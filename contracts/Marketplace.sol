// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// Openzeppelin
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/Ownable.sol";
import "./openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";
import "./openzeppelin-solidity/contracts/ERC1155/IERC1155.sol";
import "./openzeppelin-solidity/contracts/ERC1155/ERC1155Holder.sol";

// Interfaces
import './interfaces/ITradingBot.sol';
import './interfaces/ISyntheticBotToken.sol';
import './interfaces/IRouter.sol';
import "./interfaces/IFeePool.sol";

// Inheritance
import './interfaces/IMarketplace.sol';

contract Marketplace is IMarketplace, ERC1155Holder, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public immutable mcUSD;
    IRouter public immutable router;
    IERC20 public immutable TGEN;
    IFeePool public immutable feePool;
    address public immutable xTGEN;

    // Starts at index 1; increases without bounds.
    uint256 public numberOfMarketplaceListings = 1;

    // Starts at index 1; increases without bounds.
    mapping (uint256 => MarketplaceListing) public marketplaceListings; 

    // User address => NFT ID => listing index.
    // Returns 0 if user is not selling the NFT ID.
    mapping (address => mapping (uint256 => uint256)) public userToID; 

    constructor(address _mcUSD, address _router, address _TGEN, address _feePool, address _xTGEN) Ownable() {
        require(_mcUSD != address(0), "Marketplace: invalid address for mcUSD.");
        require(_router != address(0), "Marketplace: invalid address for router.");
        require(_TGEN != address(0), "Marketplace: invalid address for TGEN.");
        require(_feePool != address(0), "Marketplace: invalid address for fee pool.");
        require(_xTGEN != address(0), "Marketplace: invalid address for xTGEN.");

        mcUSD = IERC20(_mcUSD);
        router = IRouter(_router);
        TGEN = IERC20(_TGEN);
        feePool = IFeePool(_feePool);
        xTGEN = _xTGEN;
    }

    /* ========== VIEWS ========== */

    /**
    * @dev Given the index of a marketplace listing, returns the listing's data.
    * @param _index Index of the marketplace listing.
    * @return (address, bool, address, uint256, uint256, uint256) Address of the seller, whether the listing exists, address of the synthetic bot token, position's NFT ID, number of tokens, and the price (in USD).
    */
    function getMarketplaceListing(uint256 _index) external view override indexInRange(_index) returns (address, bool, address, uint256, uint256, uint256) {
        MarketplaceListing memory listing = marketplaceListings[_index];

        return (listing.seller, listing.exists, listing.botTokenAddress, listing.positionID, listing.numberOfTokens, listing.price);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

   /**
    * @dev Purchases tokens in the position at the given index.
    * @param _index Index of the marketplace listing.
    * @param _numberOfTokens Number of tokens to purchase.
    */
    function purchase(uint256 _index, uint256 _numberOfTokens) external override indexInRange(_index) {
        require(marketplaceListings[_index].exists, "Marketplace: listing does not exist.");
        require(msg.sender != marketplaceListings[_index].seller, "Marketplace: Cannot buy your own position.");
        require(_numberOfTokens > 0, "Marketplace: number of tokens must be positive.");

        MarketplaceListing memory listing = marketplaceListings[_index];

        uint256 price = listing.price;
        uint256 amountOfUSD = price.mul(_numberOfTokens).div(1e18);
        uint256 transactionFee = ITradingBot(ISyntheticBotToken(listing.botTokenAddress).getTradingBot()).tokenTradeFee();
        address botOwner = ITradingBot(ISyntheticBotToken(listing.botTokenAddress).getTradingBot()).owner();

        mcUSD.safeTransferFrom(msg.sender, address(this), amountOfUSD.mul(transactionFee.add(10000)).div(10000));

        // Transfer mcUSD to bot owner.
        mcUSD.safeTransfer(botOwner, amountOfUSD.mul(transactionFee).div(10000));
        mcUSD.approve(address(feePool), amountOfUSD.mul(transactionFee).div(10000));
        feePool.deposit(botOwner, amountOfUSD.mul(transactionFee).div(10000));
        
        // Transfer mcUSD to seller.
        mcUSD.safeTransfer(listing.seller, amountOfUSD);

        // Update state variables.
        _removeTokensFromListing(listing.botTokenAddress, listing.positionID, listing.seller, _index, _numberOfTokens);

        emit Purchased(msg.sender, _index, listing.botTokenAddress, listing.positionID, _numberOfTokens, listing.price);
    }

    /**
    * @dev Creates a new marketplace listing with the given price and NFT ID.
    * @param _botToken Address of the synthetic bot token.
    * @param _ID ID of the SyntheticBotToken position NFT.
    * @param _price USD price per token.
    * @param _numberOfTokens Number of tokens to sell.
    */
    function createListing(address _botToken, uint256 _ID, uint256 _price, uint256 _numberOfTokens) external override {
        require(_botToken != address(0), "Marketplace: invalid adderss for synthetic bot token.");
        require(userToID[msg.sender][_ID] == 0, "Marketplace: Already have a marketplace listing for this NFT.");
        require(_price > 0, "Marketplace: Price must be greater than 0");
        require(_numberOfTokens > 0, "Marketplace: Number of tokens must be greater than 0");
        require(IERC1155(_botToken).balanceOf(msg.sender, _ID) >= _numberOfTokens, "Marketplace: not enough tokens.");

        numberOfMarketplaceListings = numberOfMarketplaceListings.add(1);
        userToID[msg.sender][_ID] = numberOfMarketplaceListings;
        marketplaceListings[numberOfMarketplaceListings] = MarketplaceListing(msg.sender, true, _botToken, _ID, _numberOfTokens, _price);

        // Transfer NFT to marketplace.
        IERC1155(_botToken).safeTransferFrom(msg.sender, address(this), _ID, _numberOfTokens, "");

        emit CreatedListing(msg.sender, numberOfMarketplaceListings, _botToken, _ID, _numberOfTokens, _price);
    }

    /**
    * @dev Removes the marketplace listing at the given index.
    * @param _index Index of the marketplace listing.
    */
    function removeListing(uint256 _index) external override indexInRange(_index) onlySeller(_index) {
        MarketplaceListing memory listing = marketplaceListings[_index];

        _removeTokensFromListing(listing.botTokenAddress, listing.positionID, msg.sender, _index, listing.numberOfTokens);

        emit RemovedListing(msg.sender, _index);
    }

    /**
    * @dev Updates the price of the given marketplace listing.
    * @param _index Index of the marketplace listing.
    * @param _newPrice USD price per token.
    */
    function updatePrice(uint256 _index, uint256 _newPrice) external override indexInRange(_index) onlySeller(_index) {
        require(_newPrice > 0, "Marketplace: New price must be greater than 0");

        marketplaceListings[_index].price = _newPrice;

        emit UpdatedPrice(msg.sender, _index, _newPrice);
    }

    /**
    * @dev Updates the quantity of the given marketplace listing.
    * @param _index Index of the marketplace listing.
    * @param _newQuantity New number of tokens to sell.
    */
    function updateQuantity(uint256 _index, uint256 _newQuantity) external override indexInRange(_index) onlySeller(_index) {
        require(_newQuantity > 0, "Marketplace: New quantity must be greater than 0");

        MarketplaceListing memory listing = marketplaceListings[_index];

        if (_newQuantity >= listing.numberOfTokens) {
            IERC1155(listing.botTokenAddress).safeTransferFrom(msg.sender, address(this), listing.positionID, _newQuantity.sub(listing.numberOfTokens), "");
        }
        else {
            _removeTokensFromListing(listing.botTokenAddress, listing.positionID, msg.sender, _index, listing.numberOfTokens.sub(_newQuantity));
        }

        marketplaceListings[_index].numberOfTokens = _newQuantity;

        emit UpdatedQuantity(msg.sender, _index, _newQuantity);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
    * @dev Removes tokens from the marketplace listing.
    * @notice Sets the marketplace listing's 'exists' variable to false if no tokens remaining.
    * @notice Marketplace contract accumulates rewards from synthetic bot token while token is listed for sale.
    *         Rewards are swapped for TGEN and transferred to xTGEN contract.
    * @param _botToken Address of the synthetic bot token.
    * @param _positionID Position's NFT ID.
    * @param _user Address of the seller.
    * @param _index Index of the marketplace listing.
    * @param _numberOfTokens Number of tokens to remove.
    */
    function _removeTokensFromListing(address _botToken, uint256 _positionID, address _user, uint256 _index, uint256 _numberOfTokens) internal {
        marketplaceListings[_index].numberOfTokens = (_numberOfTokens >= marketplaceListings[_index].numberOfTokens) ?
                                                        0 : marketplaceListings[_index].numberOfTokens.sub(_numberOfTokens);

        if (marketplaceListings[_index].numberOfTokens == 0) {
            marketplaceListings[_index].exists = false;
            userToID[_user][marketplaceListings[_index].positionID] = 0;
        }

        uint256 initialBalance = mcUSD.balanceOf(address(this));

        // Transfer tokens to buyer.
        IERC1155(_botToken).setApprovalForAll(msg.sender, true);
        IERC1155(_botToken).safeTransferFrom(address(this), msg.sender, _positionID, _numberOfTokens, "");

        uint256 receivedTGEN = router.swapAssetForTGEN(address(mcUSD), mcUSD.balanceOf(address(this)).sub(initialBalance));
        TGEN.safeTransfer(xTGEN, receivedTGEN);
    }

    /* ========== MODIFIERS ========== */

    modifier indexInRange(uint256 index) {
        require(index > 0 &&
                index <= numberOfMarketplaceListings,
                "Marketplace: Index out of range");
        _;
    }

    modifier onlySeller(uint256 index) {
        require(msg.sender == marketplaceListings[index].seller,
                "Marketplace: Only the seller can call this function");
        _;
    }
}
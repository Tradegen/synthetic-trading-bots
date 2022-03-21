// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IMarketplace {

    struct MarketplaceListing {
        address seller;
        bool exists;
        address botTokenAddress;
        uint256 positionID;
        uint256 numberOfTokens;
        uint256 price; // Denominated in USD.
    }

    /**
    * @dev Given the index of a marketplace listing, returns the listing's data.
    * @param _index Index of the marketplace listing.
    * @return (address, bool, address, uint256, uint256, uint256) Address of the seller, whether the listing exists, address of the synthetic bot token, position's NFT ID, number of tokens, and the price (in USD).
    */
    function getMarketplaceListing(uint256 _index) external view returns (address, bool, address, uint256, uint256, uint256);

    /**
    * @dev Given the index of a marketplace listing, returns the fair value of the listing's token.
    * @notice Fair value is defined as [oracle price + (remaining rewards / number of tokens in position)].
    * @param _index Index of the marketplace listing.
    * @return (uint256) Fair value of the listing's token.
    */
    function calculateFairValue(uint256 _index) external view returns (uint256);

    /**
    * @dev Given the index of a marketplace listing, calculates the difference between the listed price and the token's fair value.
    * @notice The returned value is scaled by 10000 to represent a percentage with 2 decimal places.
    * @notice Fair value is defined as [oracle price + (remaining rewards / number of tokens in position)].
    * @param _index Index of the marketplace listing.
    * @return (bool, uint256) Whether the price is above fair value, and the % difference between listed price and fair value.
    */
    function calculatePriceDifference(uint256 _index) external view returns (bool, uint256);

    /**
    * @dev Purchases tokens in the position at the given index.
    * @param _index Index of the marketplace listing.
    * @param _numberOfTokens Number of tokens to purchase.
    */
    function purchase(uint256 _index, uint256 _numberOfTokens) external;

    /**
    * @dev Creates a new marketplace listing with the given price and NFT ID.
    * @param _botToken Address of the synthetic bot token.
    * @param _ID ID of the SyntheticBotToken position NFT.
    * @param _price USD price per token.
    * @param _numberOfTokens Number of tokens to sell.
    */
    function createListing(address _botToken, uint256 _ID, uint256 _price, uint256 _numberOfTokens) external;

    /**
    * @dev Removes the marketplace listing at the given index.
    * @param _index Index of the marketplace listing.
    */
    function removeListing(uint256 _index) external;

    /**
    * @dev Updates the price of the given marketplace listing.
    * @param _index Index of the marketplace listing.
    * @param _newPrice USD price per token.
    */
    function updatePrice(uint256 _index, uint256 _newPrice) external;

    /**
    * @dev Updates the quantity of the given marketplace listing.
    * @param _index Index of the marketplace listing.
    * @param _newQuantity New number of tokens to sell.
    */
    function updateQuantity(uint256 _index, uint256 _newQuantity) external;

    /* ========== EVENTS ========== */

    event CreatedListing(address indexed seller, uint256 marketplaceListingIndex, address botToken, uint256 ID, uint256 numberOfTokens, uint256 price);
    event RemovedListing(address indexed seller, uint256 marketplaceListingIndex);
    event UpdatedPrice(address indexed seller, uint256 marketplaceListingIndex, uint256 newPrice);
    event UpdatedQuantity(address indexed seller, uint256 marketplaceListingIndex, uint256 newQuantity);
    event Purchased(address indexed buyer, uint256 marketplaceListingIndex, address botToken, uint256 ID, uint256 numberOfTokens, uint256 price);
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// OpenZeppelin
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/ReentrancyGuard.sol";
import "./openzeppelin-solidity/contracts/ERC1155/ERC1155.sol";
import "./openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";

// Interfaces
import "./interfaces/ITradingBot.sol";
import "./interfaces/IBotPerformanceOracle.sol";
import "./interfaces/IFeePool.sol";

// Inheritance
import "./interfaces/ISyntheticBotToken.sol";

contract SyntheticBotToken is ISyntheticBotToken, ERC1155, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct Position {
        uint256 numberOfTokens;
        uint256 createdOn;
        uint256 rewardsEndOn;
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        uint256 rewardRate;
    }

    /* ========== STATE VARIABLES ========== */

    uint256 public constant REWARDS_DURATION = 365 days;

    IBotPerformanceOracle public immutable oracle;
    IERC20 public immutable collateralToken; // mcUSD
    ITradingBot public immutable tradingBot;
    IFeePool public immutable feePool;

    // Keep track of highest NFT ID.
    uint256 numberOfPositions;

    // NFT ID => position info.
    mapping(uint256 => Position) public positions;

    // User address => NFT ID => reward per token paid.
    mapping(address => mapping(uint256 => uint256)) public userRewardPerTokenPaid;

    // User address => NFT ID => accumulated rewards.
    mapping(address => mapping(uint256 => uint256)) public rewards;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _botPerformanceOracle, address _tradingBot, address _collateralToken, address _feePool) {
        require(_botPerformanceOracle != address(0), "SyntheticBotToken: invalid address for bot performance oracle.");
        require(_tradingBot != address(0), "SyntheticBotToken: invalid address for trading bot.");
        require(_collateralToken != address(0), "SyntheticBotToken: invalid address for collateral token.");
        require(_feePool != address(0), "SyntheticBotToken: invalid address for fee pool.");

        oracle = IBotPerformanceOracle(_botPerformanceOracle);
        tradingBot = ITradingBot(_tradingBot);
        collateralToken = IERC20(_collateralToken);
        feePool = IFeePool(_feePool);
    }

    /* ========== VIEWS ========== */

    /**
     * @dev Returns the USD price of the synthetic bot token.
     */
    function getTokenPrice() external view returns (uint256) {
        return oracle.getTokenPrice();
    }

    /**
     * @dev Returns the address of the trading bot associated with this token.
     */
    function getTradingBot() external view override returns (address) {
        return address(tradingBot);
    }

    /**
     * @dev Given a position ID, returns the position info.
     * @param _positionID ID of the position NFT.
     * @return (uint256, uint256, uint256, uint256, uint256, uint256) total number of tokens in the position, timestamp the position was created, timestamp the rewards will end, timestamp the rewards were last updated, number of rewards per token, number of rewards per second.
     */
    function getPosition(uint256 _positionID) external view override returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        require(_positionID >= 0, "SyntheticBotToken: position ID must be positive.");

        Position memory position = positions[_positionID];

        return (position.numberOfTokens, position.createdOn, position.rewardsEndOn, position.lastUpdateTime, position.rewardPerTokenStored, position.rewardRate);
    }

    /**
     * @dev Returns the latest timestamp to use when calculating available rewards.
     * @param _positionID ID of the position NFT.
     * @return (uint256) The latest timestamp to use for rewards calculations.
     */
    function lastTimeRewardApplicable(uint256 _positionID) public view override returns (uint256) {
        return block.timestamp > positions[_positionID].rewardsEndOn ? positions[_positionID].rewardsEndOn : block.timestamp;
    }

    /**
     * @dev Returns the total amount of rewards remaining for the given position.
     * @param _positionID ID of the position NFT.
     * @return (uint256) Total amount of rewards remaining.
     */
    function remainingRewards(uint256 _positionID) public view override returns (uint256) {
        return (positions[_positionID].rewardsEndOn.sub(lastTimeRewardApplicable(_positionID))).mul(positions[_positionID].rewardRate);
    }

    /**
     * @dev Returns the user's amount of rewards remaining for the given position.
     * @param _user Address of the user.
     * @param _positionID ID of the position NFT.
     * @return (uint256) User's amount of rewards remaining.
     */
    function remainingRewardsForUser(address _user, uint256 _positionID) external view override returns (uint256) {
        require(_user != address(0), "SyntheticBotToken: invalid address for user.");
        require(_positionID >= 0, "SyntheticBotToken: position ID must be positive.");

        return remainingRewards(_positionID).mul(balanceOf(_user, _positionID)).div(positions[_positionID].numberOfTokens);
    }

    /**
     * @dev Returns the number of rewards available per token for the given position.
     * @param _positionID ID of the position NFT.
     * @return (uint256) Number of rewards per token.
     */
    function rewardPerToken(uint256 _positionID) public view override returns (uint256) {
        // Prevent division by 0.
        if (positions[_positionID].numberOfTokens == 0) {
            return positions[_positionID].rewardPerTokenStored;
        }

        return
            positions[_positionID].rewardPerTokenStored.add(
                lastTimeRewardApplicable(_positionID).sub(positions[_positionID].lastUpdateTime).mul(positions[_positionID].rewardRate).mul(1e18).div(positions[_positionID].numberOfTokens)
            );
    }

    /**
     * @dev Returns the amount of rewards the user has earned for the given position.
     * @param _account Address of the user.
     * @param _positionID ID of the position NFT.
     * @return (uint256) Amount of rewards earned
     */
    function earned(address _account, uint256 _positionID) public view override returns (uint256) {
        return balanceOf(_account, _positionID).mul(rewardPerToken(_positionID).sub(userRewardPerTokenPaid[_account][_positionID])).div(1e18).add(rewards[_account][_positionID]);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

   /**
     * @dev Mints synthetic bot tokens.
     * @notice Need to approve (botTokenPrice * numberOfTokens * (mintFee + 10000) / 10000) worth of mcUSD before calling this function.
     * @param _numberOfTokens Number of synthetic bot tokens to mint.
     */
    function mintTokens(uint256 _numberOfTokens) external override nonReentrant {
        require(_numberOfTokens > 0, "SyntheticBotToken: number of tokens must be positive.");

        uint256 botTokenPrice = oracle.getTokenPrice();
        uint256 amountOfUSD = _numberOfTokens.mul(botTokenPrice).div(1e18);

        collateralToken.safeTransferFrom(msg.sender, address(this), amountOfUSD.mul(tradingBot.tokenMintFee().add(10000)).div(10000));
        collateralToken.approve(address(feePool), amountOfUSD.mul(tradingBot.tokenMintFee()).div(10000));
        feePool.deposit(tradingBot.owner(), amountOfUSD.mul(tradingBot.tokenMintFee()).div(10000));

        numberOfPositions = numberOfPositions.add(1);
        _mint(msg.sender, numberOfPositions, _numberOfTokens, "");
        positions[numberOfPositions] = Position({
            numberOfTokens: _numberOfTokens,
            createdOn: block.timestamp,
            rewardsEndOn: block.timestamp.add(REWARDS_DURATION),
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            rewardRate: amountOfUSD.div(REWARDS_DURATION)
        });

        emit MintedTokens(msg.sender, numberOfPositions, _numberOfTokens);
    }

    /**
     * @dev Claims available rewards for the given position.
     * @notice Only the position owner can call this function.
     * @param _positionID ID of the position NFT.
     */
    function claimRewards(uint256 _positionID) external override nonReentrant updateReward(msg.sender, _positionID) {
        _getReward(msg.sender, _positionID);
    }

    /**
    * @dev Transfers tokens from seller to buyer.
    * @param from Address of the seller.
    * @param to Address of the buyer.
    * @param id NFT ID of the position.
    * @param amount Number of tokens to transfer for the given ID.
    * @param data Bytes data
    */
    function safeTransferFrom(address from, address to, uint id, uint amount, bytes memory data) public override updateReward(from, id) updateReward(to, id) {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "SyntheticBotToken: caller is not owner nor approved."
        );
        require(balanceOf(from, id) >= amount, "SyntheticBotToken: not enough tokens.");

        // Get user's reward before transferring tokens.
        _getReward(from, id);

        _safeTransferFrom(from, to, id, amount, data);
    }

    // Prevent transfer of multiple NFTs in one transaction.
    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public override {}

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     * @dev Claims the user's available rewards for the given position.
     * @param _user, Address of the user.
     * @param _positionID ID of the position NFT.
     */
    function _getReward(address _user, uint256 _positionID) internal {
        uint256 reward = rewards[_user][_positionID];

        if (reward > 0) {
            rewards[_user][_positionID] = 0;
            collateralToken.safeTransfer(_user, reward);
            emit ClaimedRewards(_user, _positionID, reward);
        }
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address _account, uint256 _positionID) {
        positions[_positionID].rewardPerTokenStored = rewardPerToken(_positionID);
        positions[_positionID].lastUpdateTime = lastTimeRewardApplicable(_positionID);
        if (_account != address(0)) {
            rewards[_account][_positionID] = earned(_account, _positionID);
            userRewardPerTokenPaid[_account][_positionID] = positions[_positionID].rewardPerTokenStored;
        }
        _;
    }

    /* ========== EVENTS ========== */

    event MintedTokens(address user, uint256 positionID, uint256 numberOfTokens);
    event ClaimedRewards(address user, uint256 positionID, uint256 amountClaimed);
}
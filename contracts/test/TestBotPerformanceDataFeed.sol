// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//OpenZeppelin
import "../openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";
import "../openzeppelin-solidity/contracts/ERC20/IERC20.sol";

//Inheritance
import '../interfaces/IBotPerformanceDataFeed.sol';

contract TestBotPerformanceDataFeed is IBotPerformanceDataFeed {
    using SafeERC20 for IERC20;

    address public immutable override feeToken;
    uint256 public override usageFee;
    uint256 public override lastUpdated;
    uint256 public override createdOn;
    address public override dataProvider;

    constructor(address _feeToken, uint256 _usageFee) {
        feeToken = _feeToken;
        usageFee = _usageFee;
        createdOn = block.timestamp;
    }

   /**
    * @notice Updates the usage fee for this data feed.
    * @dev Only the data feed owner (trading bot owner) can call this function.
    * @dev Assumes that the given fee is scaled to 18 decimals.
    */
    function updateUsageFee(uint256 _newFee) external override {
        usageFee = _newFee;
    }

    /**
    * @notice Returns the status of this data feed.
    * @dev 0 = Active.
    * @dev 1 = Outdated.
    * @dev 2 = Halted.
    */
    function getDataFeedStatus() external view override returns (uint256) {
        return 0;
    }

    /**
    * @notice Returns the timestamp at which the update at the given index was made.
    * @param _index Index in this data feed's history of updates.
    * @return uint256 Timestamp at which the update was made.
    */
    function getIndexTimestamp(uint256 _index) external view override returns (uint256) {
        return block.timestamp;
    }

    /**
     * @notice Adds the order to the ledger and updates the trading bot's token price.
     * @dev This function is meant to be called by the dedicated data provider whenever the bot's keeper
     *          updates entry/exit rules with the latest asset price.
     * @dev Position size is not included because trading bots always use their max buying power for each trade.
     * @param _asset Symbol of the asset.
     * @param _isBuy Whether the order is a 'buy' order
     * @param _price Price at which the order executed.
     * @param _timestamp Timestamp when the order was executed.
     */
    function updateData(string memory _asset, bool _isBuy, uint256 _price, uint256 _timestamp) external override {

    }

    /**
    * @notice Updates the address of the data provider allowed to update this data feed.
    * @dev Only the contract operator can call this function.
    * @param _newProvider Address of the new data provider.
    */
    function updateDedicatedDataProvider(address _newProvider) external override {
        dataProvider = _newProvider;
    }

    /**
     * @notice Returns the order info at the given index.
     * @param _index Index of the order.
     * @return (address, bool, uint256, uint256) Symbol of the asset, whether the order was a 'buy', timestamp, asset's price.
     */
    function getOrderInfo(uint256 _index) external view override returns (string memory, bool, uint256, uint256) {
        return ("", true, 1e18, 1e18);
    }

    /**
     * @notice Returns the current token price of the trading bot.
     * @dev Contracts calling this function need to pay the usage fee.
     * @return (uint256) Price of the trading bot's token, in USD.
     */
    function getTokenPrice() external override returns (uint256) {
        return 2e18;
    }

    /**
    * @notice Sets the data feed's 'halted' status.
    * @dev Only the contract operator can call this function.
    * @param _isHalted Whether to mark the contract as 'halted'.
    */
    function haltDataFeed(bool _isHalted) external override {

    }

    /**
    * @notice Updates the operator of this contract.
    * @dev Only the contract owner can call this function.
    * @param _newOperator Address of the new operator.
    */
    function setOperator(address _newOperator) external override {
        
    }
}
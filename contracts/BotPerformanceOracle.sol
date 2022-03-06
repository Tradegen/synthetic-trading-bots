// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// OpenZeppelin
import "./openzeppelin-solidity/contracts/SafeMath.sol";

// Interfaces
import "./interfaces/IRouter.sol";

// Inheritance
import "./interfaces/IBotPerformanceOracle.sol";

contract BotPerformanceOracle is IBotPerformanceOracle {
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    IRouter public immutable router;
    address public immutable tradingBot;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _router, address _tradingBot) {
        require(_router != address(0), "BotPerformanceOracle: invalid address for router.");
        require(_tradingBot != address(0), "BotPerformanceOracle: invalid address for trading bot.");

        router = IRouter(_router);
        tradingBot = _tradingBot;
    }

    /* ========== VIEWS ========== */

    /**
     * @dev Returns the order info of the given order.
     * @param _index Index of the order.
     * @return (address, bool, uint256, uint256, uint256) Address of the asset, whether the order was a 'buy', timestamp, asset's price, new trading bot token price.
     */
    function getOrderInfo(uint256 _index) external view override returns (address, bool, uint256, uint256, uint256) {

    }

    /**
     * @dev Returns the current token price of the trading bot.
     * @return (uint256) Price of the trading bot's token, in USD.
     */
    function getTokenPrice() external view override returns (uint256) {

    }

    /* ========== MUTATIVE FUNCTIONS ========== */

   /**
     * @dev Adds the order to the ledger and updates the trading bot's token price.
     * @param _asset Address of the asset.
     * @param _isBuy Whether the order is a 'buy' order
     * @param _assetPrice Price of the asset when the order was executed.
     */
    function onOrderPlaced(address _asset, bool _isBuy, uint256 _assetPrice) external override {

    }

    /* ========== EVENTS ========== */

    event OrderPlaced(address asset, bool isBuy, uint256 assetPrice, uint256 newBotTokenPrice);
}
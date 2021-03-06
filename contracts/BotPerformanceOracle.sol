// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// OpenZeppelin
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/Ownable.sol";

// Interfaces
import "./interfaces/IPriceAggregatorRouter.sol";
import "./interfaces/IPriceAggregator.sol";

// Inheritance
import "./interfaces/IBotPerformanceOracle.sol";

contract BotPerformanceOracle is IBotPerformanceOracle, Ownable {
    using SafeMath for uint256;

    struct Order {
        address asset;
        bool isBuy;
        uint256 timestamp;
        uint256 assetPrice;
        uint256 newBotTokenPrice;
    }

    /* ========== STATE VARIABLES ========== */

    IPriceAggregatorRouter public immutable router;
    address public oracle;

    uint256 numberOfOrders;
    mapping(uint256 => Order) public orders; // Starts at index 1.

    /* ========== CONSTRUCTOR ========== */

    constructor(address _router, address _oracle) Ownable() {
        router = IPriceAggregatorRouter(_router);
        oracle = _oracle;
    }

    /* ========== VIEWS ========== */

    /**
     * @dev Returns the order info of the given order.
     * @param _index Index of the order.
     * @return (address, bool, uint256, uint256, uint256) Address of the asset, whether the order was a 'buy', timestamp, asset's price, new trading bot token price.
     */
    function getOrderInfo(uint256 _index) external view override returns (address, bool, uint256, uint256, uint256) {
        Order memory order = orders[_index];

        return (order.asset, order.isBuy, order.timestamp, order.assetPrice, order.newBotTokenPrice);
    }

    /**
     * @dev Returns the current token price of the trading bot.
     * @return (uint256) Price of the trading bot's token, in USD.
     */
    function getTokenPrice() public view override returns (uint256) {
        if (numberOfOrders == 0) {
            return 1e18;
        }

        Order memory latestOrder = orders[numberOfOrders];

        return latestOrder.isBuy ? IPriceAggregator(router.getPriceAggregator(latestOrder.asset)).latestRawPrice().mul(latestOrder.newBotTokenPrice).div(latestOrder.assetPrice) : latestOrder.newBotTokenPrice;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @dev Adds the order to the ledger and updates the trading bot's token price.
     * @notice This function is meant to be called by the dedicated oracle contract whenever the bot's keeper
     *          updates entry/exit rules with the latest asset price.
     * @param _asset Address of the asset.
     * @param _isBuy Whether the order is a 'buy' order
     * @param _price Price at which the order executed.
     */
    function onOrderPlaced(address _asset, bool _isBuy, uint256 _price) external override onlyOracle {
        orders[numberOfOrders.add(1)] = Order({
            asset: _asset,
            isBuy: _isBuy,
            timestamp: block.timestamp,
            assetPrice: _price,
            newBotTokenPrice: getTokenPrice()
        });
        numberOfOrders = numberOfOrders.add(1);

        emit OrderPlaced(_asset, _isBuy, _price, orders[numberOfOrders].newBotTokenPrice);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "BotPerformanceOracle: invalid address for new oracle.");

        oracle = _newOracle;

        emit SetOracle(_newOracle);
    }

    /* ========== MODIFIERS ========== */

    modifier onlyOracle() {
        require(msg.sender == oracle, "BotPerformanceOracle: only the dedicated oracle contract can call this function.");
        _;
    }


    /* ========== EVENTS ========== */

    event OrderPlaced(address asset, bool isBuy, uint256 assetPrice, uint256 newBotTokenPrice);
    event SetOracle(address newOracle);
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//Libraries
import "../BotPerformanceOracle.sol";

contract TestBotPerformanceOracle is BotPerformanceOracle {
    constructor(address _router, address _oracle)
        BotPerformanceOracle(_router, _oracle) {}

    function setOrder(uint256 _orderIndex, address _asset, bool _isBuy, uint256 _timestamp, uint256 _assetPrice, uint256 _newBotTokenPrice) external {
        orders[_orderIndex] = Order({
            asset: _asset,
            isBuy: _isBuy,
            timestamp: _timestamp,
            assetPrice: _assetPrice,
            newBotTokenPrice: _newBotTokenPrice
        });
    }

    function setNumberOfOrders(uint256 _numberOfOrders) external {
        numberOfOrders = _numberOfOrders;
    }
}
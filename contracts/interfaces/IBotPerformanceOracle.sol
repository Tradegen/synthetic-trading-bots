// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IBotPerformanceOracle {
    // Views

    /**
     * @dev Returns the order info of the given order.
     * @param _index Index of the order.
     * @return (address, bool, uint256, uint256, uint256) Address of the asset, whether the order was a 'buy', timestamp, asset's price, new trading bot token price.
     */
    function getOrderInfo(uint256 _index) external view returns (address, bool, uint256, uint256, uint256);

    /**
     * @dev Returns the current token price of the trading bot.
     * @return (uint256) Price of the trading bot's token, in USD.
     */
    function getTokenPrice() external view returns (uint256);

    // Mutative

    /**
     * @dev Adds the order to the ledger and updates the trading bot's token price.
     * @notice This function is meant to be called by the Trading Bot contract when the bot's keeper
     *          updates entry/exit rules with the latest asset price.
     * @param _asset Address of the asset.
     * @param _isBuy Whether the order is a 'buy' order
     * @param _price Price at which the order executed.
     */
    function onOrderPlaced(address _asset, bool _isBuy, uint256 _price) external;
}
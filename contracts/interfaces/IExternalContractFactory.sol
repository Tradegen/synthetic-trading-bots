// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IExternalContractFactory {
    // Mutative

    /**
    * @dev Creates SyntheticBotToken and BotPerformanceOracle contracts.
    * @notice This function is meant to be called by TradingBots contract when creating a trading bot.
    * @param _oracle Address of the dedicated oracle for the trading bot's synthetic token.
    * @return (address, address) The address of the BotPerformanceOracle contract, and the address of the SyntheticBotTokenn address.
    */
    function createContracts(address _oracle) external returns (address, address);
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface ITradingBot {
    // Views

    /**
     * @notice Returns the address of the trading bot's owner.
     */
    function owner() external view returns (address);
}
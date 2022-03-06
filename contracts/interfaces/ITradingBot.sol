// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface ITradingBot {
    // Views

    /**
     * @dev Returns the fee (denominated in 10000) for minting the bot's token.
     */
    function tokenMintFee() external view returns (uint256);

    /**
     * @dev Returns the fee (denominated in 10000) for trading the bot's token.
     */
    function tokenTradeFee() external view returns (uint256);
}
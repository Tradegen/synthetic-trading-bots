// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

contract TestSyntheticBotToken2 {
    constructor() {}

    function resetCostBasis(address) external returns (uint256) {
        return 1e24;
    }
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "../interfaces/ITradingBot.sol";

contract TestTradingBot is ITradingBot {

    address public override owner;

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address _newOwner) external {
        owner = _newOwner;
    }
}
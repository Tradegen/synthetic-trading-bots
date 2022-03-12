// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "../interfaces/ITradingBot.sol";

contract TestTradingBot is ITradingBot {

    uint256 public override tokenMintFee;
    uint256 public override tokenTradeFee;
    address public override owner;

    constructor(uint256 _mintFee, uint256 _tradeFee) {
        owner = msg.sender;
        tokenMintFee = _mintFee;
        tokenTradeFee = _tradeFee;
    }

    function setTokenMintFee(uint256 _newMintFee) external {
        tokenMintFee = _newMintFee;
    }

    function setTokenTradeFee(uint256 _newTradeFee) external {
        tokenTradeFee = _newTradeFee;
    }

    function setOwner(address _newOwner) external {
        owner = _newOwner;
    }
}
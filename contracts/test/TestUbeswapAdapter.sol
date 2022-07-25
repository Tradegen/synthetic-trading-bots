// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//Inheritance
import '../interfaces/IUbeswapAdapter.sol';

contract TestUbeswapAdapter is IUbeswapAdapter {
    constructor() {}

    /**
    * @notice Given an input asset address, returns the price of the asset in USD.
    * @return uint256 Price of the asset
    */
    function getPrice(address) external view override returns (uint256) {
        return 2e18;
    }
}
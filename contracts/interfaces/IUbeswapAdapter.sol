// SPDX-License-Identifier: MIT

pragma solidity >=0.7.6;

interface IUbeswapAdapter {
    /**
    * @dev Given an input asset address, returns the price of the asset in USD.
    * @param currencyKey Address of the asset
    * @return uint Price of the asset
    */
    function getPrice(address currencyKey) external view returns (uint);
}
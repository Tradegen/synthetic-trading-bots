// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IPriceAggregator {
    // Views

    /**
     * @dev Returns the latest price from the asset's price feed.
     */
    function latestRawPrice() external view returns (uint256);
}
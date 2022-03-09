// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IPriceAggregatorRouter {
    // Views

    /**
     * @dev Returns the address of the PriceAggregator contract for the given asset.
     * @notice Returns address(0) if the given asset doesn't have a PriceAggregator.
     * @param _asset Address of the asset.
     * @return (address) Address of the asset's PriceAggregator contract.
     */
    function getPriceAggregator(address _asset) external view returns (address);
}
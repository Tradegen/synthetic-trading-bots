// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IRouter {
    // Views

    /**
     * @dev Returns the USD price of the given asset.
     * @notice Returns 0 if the asset is not supported.
     * @param _asset Address of the asset.
     * @return (uint256) USD price of the asset.
     */
    function getUSDPrice(address _asset) external view returns (uint256);

    /**
     * @dev Returns the address of the PriceAggregator contract for the given asset.
     * @notice Returns address(0) if the given asset doesn't have a PriceAggregator.
     * @param _asset Address of the asset.
     * @return (address) Address of the asset's PriceAggregator contract.
     */
    function getPriceAggregator(address _asset) external view returns (address);
}
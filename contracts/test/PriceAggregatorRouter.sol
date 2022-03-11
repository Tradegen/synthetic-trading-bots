// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// OpenZeppelin
import "../openzeppelin-solidity/contracts/Ownable.sol";

// Interfaces
import "../interfaces/IPriceAggregator.sol";

// Inheritance
import "../interfaces/IPriceAggregatorRouter.sol";

contract PriceAggregatorRouter is IPriceAggregatorRouter, Ownable {

    /* ========== STATE VARIABLES ========== */

    // Address of asset => address of asset's PriceAggregator contract.
    mapping (address => address) public priceAggregators;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _oracle, address _asset) Ownable() {}

    /* ========== VIEWS ========== */

    /**
     * @dev Returns the address of the PriceAggregator contract for the given asset.
     * @notice Returns address(0) if the given asset doesn't have a PriceAggregator.
     * @param _asset Address of the asset.
     * @return (address) Address of the asset's PriceAggregator contract.
     */
    function getPriceAggregator(address _asset) external view override returns (address) {
        require(_asset != address(0), "PriceAggregatorRouter: invalid address for asset.");

        return priceAggregators[_asset];
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /**
     * @dev Set the PriceAggregator contract for the given asset.
     * @param _asset Address of the asset.
     * @param _priceAggregator Address of the PriceAggregator contract.
     */
    function setPriceAggregator(address _asset, address _priceAggregator) external onlyOwner {
        require(_asset != address(0), "PriceAggregatorRouter: invalid address for asset.");
        require(_priceAggregator != address(0), "PriceAggregatorRouter: invalid address for price aggregator.");
        require(IPriceAggregator(_priceAggregator).asset() == _asset, "PriceAggregatorRouter: given asset does not match price aggregator's asset.");

        priceAggregators[_asset] = _priceAggregator;

        emit SetPriceAggregator(_asset, _priceAggregator);
    }

    /* ========== EVENTS ========== */

    event SetPriceAggregator(address asset, address priceAggregator);
}
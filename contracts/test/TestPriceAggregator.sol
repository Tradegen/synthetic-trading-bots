// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// OpenZeppelin
import "../openzeppelin-solidity/contracts/Ownable.sol";

// Inheritance
import "../interfaces/IPriceAggregator.sol";

contract TestPriceAggregator is IPriceAggregator, Ownable {

    /* ========== STATE VARIABLES ========== */

    // Contracts.
    address public oracle;
    address public immutable override asset;

    // Latest price from the asset's price feed.
    uint256 public override latestRawPrice;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _oracle, address _asset) Ownable() {
        require(_oracle != address(0), "PriceAggregator: invalid address for oracle.");
        require(_asset != address(0), "PriceAggregator: invalid address for asset.");

        oracle = _oracle;
        asset = _asset;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    // Sets the latestRawPrice variable for testing.
    function setLatestRawPrice(uint256 _newRawPrice) external {
        latestRawPrice = _newRawPrice;
    }
}
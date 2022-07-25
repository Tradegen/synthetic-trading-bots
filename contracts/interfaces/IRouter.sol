// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IRouter {
    /**
    * @notice Swaps the given asset for TGEN.
    * @dev Need to transfer asset to Router contract before calling this function.
    * @param _asset Address of token to swap from.
    * @param _amount Number of tokens to swap.
    * @return (uint256) Amount of TGEN received.
    */
    function swapAssetForTGEN(address _asset, uint256 _amount) external returns (uint256);

    /**
    * @notice Swaps TGEN for the given asset.
    * @dev Need to transfer TGEN to Router contract before calling this function.
    * @param _asset Address of token to swap to.
    * @param _amount Number of TGEN to swap.
    * @return (uint256) Amount of asset received.
    */
    function swapTGENForAsset(address _asset, uint256 _amount) external returns (uint256);

    /**
    * @notice Adds liquidity for asset-TGEN pair.
    * @dev Need to transfer asset and TGEN to Router contract before calling this function.
    * @dev Assumes the _amountAsset and _amountTGEN has equal dollar value.
    * @dev This function is meant to be called from the LiquidityBond contract.
    * @param _asset Address of other token.
    * @param _amountAsset Amount of other token to add.
    * @param _amountTGEN Amount of TGEN to add.
    */
    function addLiquidity(address _asset, uint256 _amountAsset, uint256 _amountTGEN) external;
}
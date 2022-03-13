// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//OpenZeppelin
import "../openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";
import "../openzeppelin-solidity/contracts/ERC20/IERC20.sol";

//Inheritance
import '../interfaces/IRouter.sol';

contract Router is IRouter {
    using SafeERC20 for IERC20;

    IERC20 public immutable TGEN;

    constructor(address _TGEN) {
        require(_TGEN != address(0), "Router: invalid address for TGEN.");

        TGEN = IERC20(_TGEN);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
    * @dev Sends TGEN back to caller at 1:1 ratio.
    */
    function swapAssetForTGEN(address _asset, uint256 _amount) external override returns (uint256) {
        require(_asset != address(0), "Router: invalid asset address.");
        require(_amount > 0, "Router: amount must be positive.");

        IERC20(_asset).safeTransferFrom(msg.sender, address(this), _amount);
        TGEN.safeTransfer(msg.sender, _amount);

        return _amount;
    }

    /**
    * @dev Placeholder for testing.
    */
    function swapTGENForAsset(address _asset, uint256 _amount) external override returns (uint256) {
        return 0;
    }

    /**
    * @dev Placeholder for testing.
    */
    function addLiquidity(address _asset, uint256 _amountAsset, uint256 _amountTGEN) external override {
        return;
    }

    /* ========== EVENTS ========== */

    event SwappedForTGEN(address asset, uint256 amountOfTokensSwapped, uint256 amountOfTGENReceived);
    event SwappedFromTGEN(address asset, uint256 amountOfTGENSwapped, uint256 amountOfTokensReceived);
    event AddedLiquidity(address asset, uint256 amountAsset, uint256 amountTGEN, uint256 numberOfLPTokens);
}
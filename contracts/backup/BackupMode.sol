// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//OpenZeppelin
import "../openzeppelin-solidity/contracts/Ownable.sol";
import "../openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";
import "../openzeppelin-solidity/contracts/SafeMath.sol";

// Interfaces
import '../interfaces/IUbeswapAdapter.sol';

//Inheritance
import '../interfaces/IBackupMode.sol';

contract BackupMode is IBackupMode, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    bool public override useBackup;
    uint256 public override startTime;
    uint256 public override priceOfTGEN;

    IUbeswapAdapter public immutable ubeswapAdapter;
    address public immutable TGEN;
    address public immutable backupEscrow;
    address public immutable xTGEN;

    constructor(address _ubeswapAdapter, address _TGEN, address _backupEscrow, address _xTGEN) Ownable() {
        ubeswapAdapter = IUbeswapAdapter(_ubeswapAdapter);
        TGEN = _TGEN;
        backupEscrow = _backupEscrow;
        xTGEN = _xTGEN;

        useBackup = false;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
    * @dev Turns on backup mode.
    * @notice Only the contract owner can call this function.
    * @notice Assumes that there's enough TGEN in this contract.
    * @notice When backup mode is on, minting will be paused for synthetic bot tokens.
    * @notice Users can withdraw their cost basis in TGEN from the escrow contract.
    * @notice Backup mode will only be turned on if the majority of users want to exit their synthetic bot token positions and are unable to do so through the marketplace.
    * @param _totalCostBasis Total value of bot tokens (in USD) minted across all trading bots.
    */
    function turnOnBackupMode(uint256 _totalCostBasis) external override onlyOwner {
        require(!useBackup, "BackupMode: already using backup mode.");

        useBackup = true;
        startTime = block.timestamp;
        priceOfTGEN = ubeswapAdapter.getPrice(TGEN);

        uint256 amountOfTGEN = _totalCostBasis.mul(1e18).div(priceOfTGEN);
        IERC20(TGEN).safeTransfer(backupEscrow, amountOfTGEN);

        uint256 leftoverTGEN = IERC20(TGEN).balanceOf(address(this));
        IERC20(TGEN).safeTransfer(xTGEN, leftoverTGEN);

        emit TurnedOnBackupMode(amountOfTGEN, leftoverTGEN);
    }

    /* ========== EVENTS ========== */

    event TurnedOnBackupMode(uint256 amountOfTGEN, uint256 leftoverTGEN);
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//OpenZeppelin
import "../openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";
import "../openzeppelin-solidity/contracts/SafeMath.sol";

// Interfaces
import '../interfaces/IBackupMode.sol';
import '../interfaces/ISyntheticBotToken.sol';

//Inheritance
import '../interfaces/IBackupEscrow.sol';

contract BackupEscrow is IBackupEscrow {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IBackupMode public immutable backupMode;
    IERC20 public immutable TGEN;

    // User address => synthetic bot token address => whether the user has withdrawn.
    mapping(address => mapping (address => bool)) public hasWithdrawn;

    // Contract holds available TGEN for all bot tokens.
    constructor(address _backupMode, address _TGEN) {
        backupMode = IBackupMode(_backupMode);
        TGEN = IERC20(_TGEN);
    }

    /* ========== VIEWS ========== */

    /**
    * @dev Returns the amount of TGEN available based on the cost basis.
    */
    function availableTGEN(uint256 _costBasis) public view override returns (uint256) {
        return _costBasis.mul(backupMode.priceOfTGEN()).div(1e18);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
    * @dev Withdraws TGEN from escrow, based on the cost basis.
    * @param _syntheticBotToken Address of the SyntheticBotToken contract.
    */
    function withdraw(address _syntheticBotToken) external override {
        require(backupMode.useBackup(), "BackupEscrow: backup mode must be on.");
        require(!hasWithdrawn[msg.sender][_syntheticBotToken], "BackupEscrow: user has already withdrawn for this synthetic bot token.");

        hasWithdrawn[msg.sender][_syntheticBotToken] = true;

        uint256 costBasis = ISyntheticBotToken(_syntheticBotToken).resetCostBasis(msg.sender);

        uint256 amountOfTGEN = availableTGEN(costBasis);
        TGEN.safeTransfer(msg.sender, amountOfTGEN);

        emit Withdraw(msg.sender, _syntheticBotToken, amountOfTGEN);
    }

    /* ========== EVENTS ========== */

    event Withdraw(address user, address syntheticBotToken, uint256 amountOfTGEN);
}
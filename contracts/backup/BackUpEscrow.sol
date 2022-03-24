// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//OpenZeppelin
import "../openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";
import "../openzeppelin-solidity/contracts/SafeMath.sol";
import "../openzeppelin-solidity/contracts/Ownable.sol";

// Interfaces
import '../interfaces/IBackupMode.sol';
import '../interfaces/ISyntheticBotToken.sol';

//Inheritance
import '../interfaces/IBackupEscrow.sol';

contract BackupEscrow is IBackupEscrow, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IBackupMode public immutable backupMode;
    IERC20 public immutable TGEN;
    address public factory;

    // User address => synthetic bot token address => whether the user has withdrawn.
    mapping(address => mapping (address => bool)) public hasWithdrawn;

    // Synthetic bot token address => whether the bot token is registered.
    mapping(address => bool) public registeredBotToken;

    // Contract holds available TGEN for all bot tokens.
    constructor(address _backupMode, address _TGEN) Ownable() {
        backupMode = IBackupMode(_backupMode);
        TGEN = IERC20(_TGEN);
    }

    /* ========== VIEWS ========== */

    /**
    * @dev Returns the amount of TGEN available based on the cost basis.
    */
    function availableTGEN(uint256 _costBasis) public view override returns (uint256) {
        return _costBasis.mul(1e18).div(backupMode.priceOfTGEN());
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

    /* ========== RESTRICTED FUNCTIONS ========== */

    /**
    * @dev Sets the address of the SyntheticBotTokenFactory contract.
    * @notice This function can only be called by the contract owner.
    * @param _factory Address of the factory.
    */
    function setFactory(address _factory) external onlyOwner {
        require(factory == address(0), "BackupEscrow: already set factory.");

        factory = _factory;

        emit SetFactory(factory);
    }

    /**
    * @dev Registers the synthetic bot token, marking it eligible for withdrawals during backup mode.
    * @param _syntheticBotToken Address of the SyntheticBotToken contract.
    */
    function registerBotToken(address _syntheticBotToken) external override onlyFactory {
        registeredBotToken[_syntheticBotToken] = true;

        emit RegisteredBotToken(_syntheticBotToken);
    }

    /* ========== MODIFIERS ========== */

    modifier onlyFactory() {
        require(msg.sender == factory, "BackupEscrow: only the SyntheticBotTokenFactory contract can call this function.");
        _;
    }

    /* ========== EVENTS ========== */

    event Withdraw(address user, address syntheticBotToken, uint256 amountOfTGEN);
    event RegisteredBotToken(address syntheticBotToken);
    event SetFactory(address factory);
}
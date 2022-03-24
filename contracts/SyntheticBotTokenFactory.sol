// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// Internal References
import "./SyntheticBotToken.sol";

// Interfaces
import "./interfaces/IBackupEscrow.sol";

contract SyntheticBotTokenFactory {

    /* ========== STATE VARIABLES ========== */

    IBackupEscrow public immutable backupEscrow;
    address public immutable mcUSD;
    address public immutable TGEN;
    address public immutable feePool;
    address public immutable router;
    address public immutable xTGEN;
    address public immutable backupMode;
    address public immutable owner;
 
    /* ========== CONSTRUCTOR ========== */

    constructor(address _backupEscrow, address _mcUSD, address _TGEN, address _feePool, address _router, address _xTGEN, address _backupMode) {
        backupEscrow = IBackupEscrow(_backupEscrow);
        mcUSD = _mcUSD;
        TGEN = _TGEN;
        feePool = _feePool;
        router = _router;
        xTGEN = _xTGEN;
        backupMode = _backupMode;
        owner = msg.sender;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
    * @dev Creates a SyntheticBotToken contract.
    * @notice Assumes the BackupEscrow already has the factory set to this contract.
    * @param _oracle Address of the dedicated oracle for the trading bot's synthetic token.
    * @param _tradingBot Address of the TradingBot NFT.
    */
    function createContract(address _oracle, address _tradingBot) external {
        require(msg.sender == owner, "SyntheticBotTokenFactory: only the owner can call this function.");
        require(_oracle != address(0), "SyntheticBotTokenFactory: invalid address for oracle.");
        require(_tradingBot != address(0), "SyntheticBotTokenFactory: invalid address for trading bot.");

        address syntheticBotToken = address(new SyntheticBotToken(_oracle, _tradingBot, mcUSD, TGEN, feePool, router, xTGEN, backupMode, address(backupEscrow)));
        backupEscrow.registerBotToken(syntheticBotToken);

        emit CreatedContract(syntheticBotToken);
    }

    /* ========== EVENTS ========== */

    event CreatedContract(address syntheticBotToken);
}
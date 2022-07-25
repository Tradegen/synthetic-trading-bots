// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// Internal References
import "./SyntheticBotToken.sol";

// Interfaces
import "./interfaces/IBackupEscrow.sol";

contract SyntheticBotTokenFactory {

    /* ========== STATE VARIABLES ========== */

    IBackupEscrow public immutable backupEscrow;
    address public immutable stablecoin;
    address public immutable TGEN;
    address public immutable router;
    address public immutable xTGEN;
    address public immutable backupMode;
    address public immutable owner;
 
    /* ========== CONSTRUCTOR ========== */

    constructor(address _backupEscrow, address _stablecoin, address _TGEN, address _router, address _xTGEN, address _backupMode) {
        backupEscrow = IBackupEscrow(_backupEscrow);
        stablecoin = _stablecoin;
        TGEN = _TGEN;
        router = _router;
        xTGEN = _xTGEN;
        backupMode = _backupMode;
        owner = msg.sender;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
    * @notice Creates a SyntheticBotToken contract.
    * @dev Assumes the BackupEscrow already has the factory set to this contract.
    * @param _dataFeed Address of the trading bot's BotPerformanceDataFeed contract.
    * @param _tradingBot Address of the TradingBot NFT.
    */
    function createContract(address _dataFeed, address _tradingBot) external {
        require(msg.sender == owner, "SyntheticBotTokenFactory: Only the owner can call this function.");
        require(_dataFeed != address(0), "SyntheticBotTokenFactory: Invalid address for data feed.");
        require(_tradingBot != address(0), "SyntheticBotTokenFactory: Invalid address for trading bot.");

        address syntheticBotToken = address(new SyntheticBotToken(_dataFeed, _tradingBot, stablecoin, TGEN, router, xTGEN, backupMode, address(backupEscrow)));
        backupEscrow.registerBotToken(syntheticBotToken);

        emit CreatedContract(syntheticBotToken);
    }

    /* ========== EVENTS ========== */

    event CreatedContract(address syntheticBotToken);
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// OpenZeppelin
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";

// Internal References
import "./BotPerformanceOracle.sol";
import "./SyntheticBotToken.sol";

// Inheritance
import "./interfaces/IExternalContractFactory.sol";

contract ExternalContractFactory is IExternalContractFactory {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    address public immutable priceAggregatorRouter;
    address public immutable mcUSD;
    address public immutable TGEN;
    address public immutable xTGEN;
    address public immutable feePool;
    address public immutable router;

    mapping(address => uint256) public userFees;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _priceAggregatorRouter, address _mcUSD, address _feePool, address _router, address _TGEN, address _xTGEN) {
        require(_priceAggregatorRouter != address(0), "ExternalContractFactory: invalid address for price aggregator router.");
        require(_mcUSD != address(0), "ExternalContractFactory: invalid address for mcUSD.");
        require(_feePool != address(0), "ExternalContractFactory: invalid address for fee pool.");
        require(_router != address(0), "ExternalContractFactory: invalid address for router.");
        require(_TGEN != address(0), "ExternalContractFactory: invalid address for TGEN.");
        require(_xTGEN != address(0), "ExternalContractFactory: invalid address for xTGEN.");

        priceAggregatorRouter = _priceAggregatorRouter;
        mcUSD = _mcUSD;
        feePool = _feePool;
        router = _router;
        TGEN = _TGEN;
        xTGEN = _xTGEN;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
    * @dev Creates SyntheticBotToken and BotPerformanceOracle contracts.
    * @notice This function is meant to be called by TradingBots contract when creating a trading bot.
    * @param _oracle Address of the dedicated oracle for the trading bot's synthetic token.
    * @return (address, address) The address of the BotPerformanceOracle contract, and the address of the SyntheticBotTokenn address.
    */
    function createContracts(address _oracle) external override returns (address, address) {
        require(_oracle != address(0), "ExternalContractFactory: invalid address for oracle.");

        address botPerformanceOracle = address(new BotPerformanceOracle(priceAggregatorRouter, _oracle));
        address syntheticBotToken = address(new SyntheticBotToken(botPerformanceOracle, msg.sender, mcUSD, TGEN, feePool, router, xTGEN));

        emit CreatedContracts(msg.sender, botPerformanceOracle, syntheticBotToken);

        return (botPerformanceOracle, syntheticBotToken);
    }

    /* ========== EVENTS ========== */

    event CreatedContracts(address indexed tradingBot, address botPerformanceOracle, address syntheticBotToken);
}
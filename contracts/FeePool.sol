// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// OpenZeppelin
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";

// Inheritance
import "./interfaces/IFeePool.sol";

contract FeePool is IFeePool {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable mcUSD;

    mapping(address => uint256) public userFees;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _mcUSD) {
        require(_mcUSD != address(0), "FeePool: invalid address for mcUSD.");

        mcUSD = IERC20(_mcUSD);
    }

    /* ========== VIEWS ========== */

    /**
    * @dev Returns the amount of fees the user has available.
    * @param _user Address of the user.
    * @return (uint256) Amount of fees available.
    */
    function availableFees(address _user) external view override returns (uint256) {
        require(_user != address(0), "FeePool: invalid address for user.");

        return userFees[_user];
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

   /**
    * @dev Deposits fees for the given user.
    * @param _user Address of the user.
    * @param _amount Number of tokens to deposit.
    */
    function deposit(address _user, uint256 _amount) external override {
        require(_user != address(0), "FeePool: invalid address for user.");
        require(_amount >= 0, "FeePool: amount must be positive.");

        mcUSD.safeTransferFrom(msg.sender, address(this), _amount);

        userFees[_user] = userFees[_user].add(_amount);

        emit Deposit(_user, _amount);
    }

    /**
    * @dev Withdraws available fees for the user calling this function.
    */
    function withdraw() external override {
        uint256 fees = userFees[msg.sender];

        userFees[msg.sender] = 0;

        // Transfer available fees to the user.
        mcUSD.safeTransfer(msg.sender, fees);

        emit Withdraw(msg.sender, fees);
    }

    /* ========== EVENTS ========== */

    event Deposit(address user, uint256 amount);
    event Withdraw(address user, uint256 amount);
}
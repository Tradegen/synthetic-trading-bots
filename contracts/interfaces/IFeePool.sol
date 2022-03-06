// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IFeePool {
    // Mutative

    /**
    * @dev Deposits fees for the given user.
    * @param _user Address of the user.
    * @param _amount Number of tokens to deposit.
    */
    function deposit(address _user, uint256 _amount) external;

    /**
    * @dev Withdraws available fees for the user calling this function.
    */
    function withdraw() external;

    // Views

    /**
    * @dev Returns the amount of fees the user has available.
    * @param _user Address of the user.
    * @return (uint256) Amount of fees available.
    */
    function availableFees(address _user) external view returns (uint256); 
}
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.6;

interface IBackupEscrow {
    /**
    * @dev Returns the amount of TGEN available based on the cost basis.
    */
    function availableTGEN(uint256 _costBasis) external view returns (uint256);

    /**
    * @dev Withdraws TGEN from escrow, based on the cost basis.
    * @param _syntheticBotToken Address of the SyntheticBotToken contract.
    */
    function withdraw(address _syntheticBotToken) external;

    /**
    * @dev Registers the synthetic bot token, marking it eligible for withdrawals during backup mode.
    * @param _syntheticBotToken Address of the SyntheticBotToken contract.
    */
    function registerBotToken(address _syntheticBotToken) external;
}
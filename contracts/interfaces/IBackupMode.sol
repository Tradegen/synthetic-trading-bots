// SPDX-License-Identifier: MIT

pragma solidity >=0.7.6;

interface IBackupMode {
    /**
    * @dev Returns whether backup mode is on.
    */
    function useBackup() external view returns (bool);

    /**
    * @dev Returns the time at which backup mode was turned on.
    */
    function startTime() external view returns (uint256);

    /**
    * @dev Returns the price of TGEN when backup mode was turned on.
    */
    function priceOfTGEN() external view returns (uint256);

    /**
    * @dev Turns on backup mode.
    * @notice Only the contract owner can call this function.
    * @notice Assumes that there's enough TGEN in this contract.
    * @notice When backup mode is on, minting will be paused for synthetic bot tokens.
    * @notice Users can withdraw their cost basis in TGEN from the escrow contract.
    * @notice Backup mode will only be turned on if the majority of users want to exit their synthetic bot token positions and are unable to do so through the marketplace.
    * @param _totalCostBasis Total value of bot tokens (in USD) minted across all trading bots.
    */
    function turnOnBackupMode(uint256 _totalCostBasis) external;
}
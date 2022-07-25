// SPDX-License-Identifier: MIT

pragma solidity >=0.7.6;

interface IBackupMode {
    /**
    * @notice Returns whether backup mode is on.
    */
    function useBackup() external view returns (bool);

    /**
    * @notice Returns the time at which backup mode was turned on.
    */
    function startTime() external view returns (uint256);

    /**
    * @notice Returns the price of TGEN when backup mode was turned on.
    */
    function priceOfTGEN() external view returns (uint256);

    /**
    * @notice Turns on backup mode.
    * @dev Only the contract owner can call this function.
    * @dev Assumes that there's enough TGEN in this contract.
    * @dev When backup mode is on, minting will be paused for synthetic bot tokens.
    * @dev Users can withdraw their cost basis in TGEN from the escrow contract.
    * @dev Backup mode will only be turned on if the majority of users want to exit their synthetic bot token positions and are unable to do so through the marketplace.
    * @param _totalCostBasis Total value of bot tokens (in USD) minted across all trading bots.
    */
    function turnOnBackupMode(uint256 _totalCostBasis) external;
}
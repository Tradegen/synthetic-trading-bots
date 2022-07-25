// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface ISyntheticBotToken {
    // Views

    /**
     * @notice Returns the address of the trading bot associated with this token.
     */
    function getTradingBot() external view returns (address);

    /**
     * @notice Given a position ID, returns the position info.
     * @param _positionID ID of the position NFT.
     * @return (uint256, uint256, uint256, uint256, uint256, uint256) total number of tokens in the position, timestamp the position was created, timestamp the rewards will end, timestamp the rewards were last updated, number of rewards per token, number of rewards per second.
     */
    function getPosition(uint256 _positionID) external view returns (uint256, uint256, uint256, uint256, uint256, uint256);

    /**
     * @notice Returns the latest timestamp to use when calculating available rewards.
     * @param _positionID ID of the position NFT.
     * @return (uint256) The latest timestamp to use for rewards calculations.
     */
    function lastTimeRewardApplicable(uint256 _positionID) external view returns (uint256);

     /**
     * @notice Returns the total amount of rewards remaining for the given position.
     * @param _positionID ID of the position NFT.
     * @return (uint256) Total amount of rewards remaining.
     */
    function remainingRewards(uint256 _positionID) external view returns (uint256);

    /**
     * @notice Returns the user's amount of rewards remaining for the given position.
     * @param _user Address of the user.
     * @param _positionID ID of the position NFT.
     * @return (uint256) User's amount of rewards remaining.
     */
    function remainingRewardsForUser(address _user, uint256 _positionID) external view returns (uint256);

    /**
     * @notice Returns the number of rewards available per token for the given position.
     * @param _positionID ID of the position NFT.
     * @return (uint256) Number of rewards per token.
     */
    function rewardPerToken(uint256 _positionID) external view returns (uint256);

    /**
     * @notice Returns the amount of rewards the user has earned for the given position.
     * @param _account Address of the user.
     * @param _positionID ID of the position NFT.
     * @return (uint256) Amount of rewards earned
     */
    function earned(address _account, uint256 _positionID) external view returns (uint256);

    // Mutative

    /**
     * @notice Mints synthetic bot tokens.
     * @dev Need to pay data request fee to the BotPerformanceDataFeed contract to get botTokenPrice.
     * @dev Need to approve (botTokenPrice * numberOfTokens * (mintFee + 10000) / 10000) worth of stablecoin before calling this function.
     * @param _numberOfTokens Number of synthetic bot tokens to mint.
     * @param _duration Number of weeks before rewards end.
     */
    function mintTokens(uint256 _numberOfTokens, uint256 _duration) external;

    /**
     * @notice Claims available rewards for the given position.
     * @dev Only the position owner can call this function.
     * @param _positionID ID of the position NFT.
     */
    function claimRewards(uint256 _positionID) external;

    /**
     * @notice Resets the user's cost basis and lower the total cost basis.
     * @dev Only the BackupEscrow contract can call this function.
     * @dev This function is called when a user claims their TGEN from the BackupEscrow contract.
     * @param _user Address of the user.
     * @return (uint256) User's initial cost basis.
     */
    function resetCostBasis(address _user) external returns (uint256);
}
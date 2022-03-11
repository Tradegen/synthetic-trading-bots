// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//Libraries
import "../SyntheticBotToken.sol";

contract TestSyntheticBotToken is SyntheticBotToken {
    constructor(address _botPerformanceOracle, address _tradingBot, address _collateralToken, address _feePool)
        SyntheticBotToken(_botPerformanceOracle, _tradingBot, _collateralToken, _feePool) {}

    function setPosition(uint256 _positionIndex, uint256 _numberOfTokens, uint256 _createdOn, uint256 _rewardsEndOn, uint256 _lastUpdateTime, uint256 _rewardPerTokenStored, uint256 _rewardRate) external {
        positions[_positionIndex] = Position({
            numberOfTokens: _numberOfTokens,
            createdOn: _createdOn,
            rewardsEndOn: _rewardsEndOn,
            lastUpdateTime: _lastUpdateTime,
            rewardPerTokenStored: _rewardPerTokenStored,
            rewardRate: _rewardRate
        });
    }

    function getCurrentTime() external view returns (uint256) {
        return block.timestamp;
    }
}
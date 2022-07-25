// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//Libraries
import "../SyntheticBotToken.sol";

contract TestSyntheticBotToken is SyntheticBotToken {
    constructor(address _botPerformanceDataFeed, address _tradingBot, address _stablecoin, address _TGEN, address _router, address _xTGEN, address _backupMode, address _backupEscrow)
        SyntheticBotToken(_botPerformanceDataFeed, _tradingBot, _stablecoin, _TGEN, _router, _xTGEN, _backupMode, _backupEscrow) {}

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

    function testMint(address _user, uint256 _tokenID, uint256 _balance) external {
        _mint(_user, _tokenID, _balance, "");
    }

    function setNumberOfTokens(uint256 _positionID, uint256 _numberOfTokens) external {
        positions[_positionID].numberOfTokens = _numberOfTokens;
    }

    function setLastUpdateTime(uint256 _positionID, uint256 _lastUpdateTime) external {
        positions[_positionID].lastUpdateTime = _lastUpdateTime;
    }

    function setRewardsEndOn(uint256 _positionID, uint256 _rewardsEndOn) external {
        positions[_positionID].rewardsEndOn = _rewardsEndOn;
    }
}
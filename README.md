# Synthetic Trading Bots

## Purpose

Provide an example of a protocol that integrates Tradegen's data feeds.

## Overview

Synthetic trading bots tokenize the performance of trading bots in simulated trades. These tokens mimic the performance of their respective trading bots, giving users exposure to the trading bots without having to run the bots themselves.

## Disclaimer

The code has not been audited yet.

This protocol is experimental. Developers looking to integrate bot performance data are advised to use existing synthetic asset protocols but replace their oracle with the BotPerformanceOracle.

## System Design

At a high level, the system consists of trading bots, data feeds, and a synthetic asset protocol. Each component of the system is implemented as a set of smart contracts deployed on the Celo blockchain.

Trading bots make simulated trades on major cryptos and relay the trade data to data feeds. Each bot consists of a set of entry/exit rules defined by the bot's creator. Keepers (scripts running on the cloud) call the trading bot's contracts at regular intervals to update the bot's state with the latest price data, according to the bot's entry/exit rules. If the entry/exit rules are met, a simulated trade is sent to the bot's data feed.

Data feeds store the order history of each trading bot and use it to calculate the price of a bot's performance. The price of each bot starts at $1 and fluctuates based on the bot's lifetime performance. For instance, a +50% lifetime performance will lead to a price of $1.50 and a -30% lifetime performance will lead to a price of $0.70. Developers wanting to use a bot's price data in their applications can pay a 'data request' fee to the bot's data feed to get the latest price. The bot's creator collects the 'data request' fees from their bot, allowing them to monetize their bot without risking their own capital.

The synthetic asset protocol uses a bot's data feed to create tokens that track the bot's performance. Each token is an NFT (ERC1155 standard) that represents a user's position. Each position consists of 'bot tokens' (deposited capital divided by the bot's price when the NFT was minted) that can be sold to other users on the platform's marketplace. The funds used to mint the NFT vest linearly over the duration specified by the NFT's creator, and are distributed to 'bot token' holders proportional to the number of tokens they hold.

### Why Simulated Trades?

* Support leveraged positions without having to worry about liquidity in the system. Leverage can be implemented by multiplying price changes by a scalar.
* Prevent the project from becoming dependent on a specific exchange for executing orders. This helps prevent 'contagion', where the collapse of one project causes other projects relying on that project to collapse as well. 
* No price manipulation or front-running. Since orders are not being placed on an exchange, liquidity cannot be manipulated to affect execution price.
* No slippage or exchange fees. Users can create strategies that trade with higher frequency without reducing profits.  

## Repository Structure

```
.
├── abi  ## Generated ABIs that developers can use to interact with the system.
├── addresses  ## Address of each deployed contract, organized by network.
├── contracts  ## All source code.
│   ├── backup  ## Source code for backup mode.
│   ├── interfaces  ## Interfaces used for defining/calling contracts.
│   ├── openzeppelin-solidity  ## Helper contracts provided by OpenZeppelin.
│   ├── test  ## Mock contracts used for testing main contracts.
├── test ## Source code for testing code in //contracts.
```

## Backup Mode

This protocol includes a backup mode, which pauses the minting of new bot tokens. Since this protocol is experimental, a backup mode is included to make sure users can recover their cost basis if they can't sell their positions in the marketplace. If backup mode is enabled, TGEN (the protocol's governance token) will be transferred to the BackupEscrow contract from an insurance fund, and users will be able to withdraw TGEN from the escrow with the same dollar value as their cost basis. Backup mode will only be enabled if the majority of users vote in favor of it.

## Documentation

To learn more about the Tradegen project, visit the docs at https://docs.tradegen.io.

Source code for trading bots: https://github.com/Tradegen/algo-trading.

Source code for data feeds: https://github.com/Tradegen/data-feeds.

## License

MIT

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

Docs are available at https://docs.tradegen.io

## License

MIT

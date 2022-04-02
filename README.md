# Synthetic Trading Bots

Synthetic trading bots tokenize the performance of trading algos in simulated trades. This enables high-frequency trading on-chain with zero exchange fees and slippage.

Trades are simulated on our own blockchain in response to price updates from Band Protocol oracles. Simulated orders are passed to the BotPerformanceOracle contract through a dedicated keeper node. A decentralized keeper network is used for relaying bot performance data from Tradegen's blockchain to EVM-compatible blockchains at regular intervals. The logic for updating bots can be found at https://github.com/Tradegen/algo-trading

This repo shows an example of how bot performance data could be used in a protocol. In this protocol, bot token positions are NFTs that gradually vest deposited collateral. These NFTs are tradable on the platform's marketplace or external marketplaces supporting the ERC1155 standard.

## Disclaimer

These smart contracts have not been audited or deployed yet.

This protocol is experimental. Developers looking to integrate bot performance data are advised to use existing synthetic asset protocols but replace their oracle with the BotPerformanceOracle.

## Backup Mode

This protocol includes a backup mode, which pauses the minting of new bot tokens. Since this protocol is experimental, a backup mode is included to make sure users can recover their cost basis if they can't sell their positions in the marketplace. If backup mode is enabled, TGEN will be transferred to the BackupEscrow contract from an insurance fund, and users will be able to withdraw TGEN from the escrow with the same dollar value as their cost basis. Backup mode will only be enabled if the majority of users vote in favor of it.

## Docs

Docs are available at https://docs.tradegen.io

## License

MIT

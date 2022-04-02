# Synthetic Trading Bots

Synthetic trading bots tokenize the performance of trading algos in simulated trades. This enables high-frequency trading on-chain with zero exchange fees and slippage.

Trades are simulated on our own blockchain in response to price updates from Band Protocol oracles. Simulated orders are passed to the BotPerformanceOracle contract through a dedicated keeper node. A decentralized keeper network is used for relaying bot performance data from Tradegen's blockchain to EVM-compatible blockchains at regular intervals.

This repo shows an example of how bot performance data could be integrated into an app. In this app, bot token positions are NFTs that gradually vest deposited collateral. These NFTs are tradable on the platform's marketplace.

## Disclaimer

These smart contracts have not been audited or deployed yet.

## Docs

Docs are available at https://docs.tradegen.io

## License

MIT

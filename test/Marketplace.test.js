const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");

describe("Marketplace", () => {
  let deployer;
  let otherUser;
  
  let testToken;
  let testTokenAddress;
  let testTGEN;
  let testTGENAddress;
  let TestTokenFactory;

  let feePool;
  let feePoolAddress;
  let FeePoolFactory;

  let tradingBot;
  let tradingBotAddress;
  let TradingBotFactory;

  let router;
  let routerAddress;
  let RouterFactory;

  let priceAggregatorRouter;
  let priceAggregatorRouterAddress;
  let PriceAggregatorRouterFactory;

  let botPerformanceOracle;
  let botPerformanceOracleAddress;
  let BotPerformanceOracleFactory;

  let syntheticBotToken;
  let syntheticBotTokenAddress;
  let SyntheticBotTokenFactory;

  let marketplace;
  let marketplaceAddress;
  let MarketplaceFactory;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    TestTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    FeePoolFactory = await ethers.getContractFactory('FeePool');
    RouterFactory = await ethers.getContractFactory('TestRouter');
    BotPerformanceOracleFactory = await ethers.getContractFactory('BotPerformanceOracle');
    SyntheticBotTokenFactory = await ethers.getContractFactory('SyntheticBotToken');
    PriceAggregatorRouterFactory = await ethers.getContractFactory('PriceAggregatorRouter');
    TradingBotFactory = await ethers.getContractFactory('TestTradingBot');
    MarketplaceFactory = await ethers.getContractFactory('Marketplace');

    testToken = await TestTokenFactory.deploy("Test token", "TEST");
    await testToken.deployed();
    testTokenAddress = testToken.address;

    testTGEN = await TestTokenFactory.deploy("Test TGEN", "TGEN");
    await testTGEN.deployed();
    testTGENAddress = testTGEN.address;

    feePool = await FeePoolFactory.deploy(testTokenAddress);
    await feePool.deployed();
    feePoolAddress = feePool.address;

    priceAggregatorRouter = await PriceAggregatorRouterFactory.deploy();
    await priceAggregatorRouter.deployed();
    priceAggregatorRouterAddress = priceAggregatorRouter.address;

    tradingBot = await TradingBotFactory.deploy(1000, 1000);
    await tradingBot.deployed();
    tradingBotAddress = tradingBot.address;

    router = await RouterFactory.deploy(testTGENAddress);
    await router.deployed();
    routerAddress = router.address;

    botPerformanceOracle = await BotPerformanceOracleFactory.deploy(priceAggregatorRouterAddress, otherUser.address);
    await botPerformanceOracle.deployed();
    botPerformanceOracleAddress = botPerformanceOracle.address;

    syntheticBotToken = await SyntheticBotTokenFactory.deploy(botPerformanceOracleAddress, tradingBotAddress, testTokenAddress, feePoolAddress);
    await syntheticBotToken.deployed();
    syntheticBotTokenAddress = syntheticBotToken.address;
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    // Using BotPerformanceOracle address as xTGEN address for testing.
    marketplace = await MarketplaceFactory.deploy(testTokenAddress, routerAddress, testTGENAddress, feePoolAddress, botPerformanceOracleAddress);
    await marketplace.deployed();
    marketplaceAddress = marketplace.address;

    let tx = await testTGEN.transfer(routerAddress, parseEther("1000"));
    await tx.wait();

    let tx2 = await testToken.approve(syntheticBotTokenAddress, parseEther("11"));
    await tx2.wait();

    let tx3 = await syntheticBotToken.mintTokens(parseEther("10"));
    await tx3.wait();
  });
  
  describe("#createListing", () => {
    it("no balance in position", async () => {
        let tx = marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await expect(tx).to.be.reverted;

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(0);

        let index = await marketplace.userToID(deployer.address, 1);
        expect(index).to.equal(0);
    });
  });
});
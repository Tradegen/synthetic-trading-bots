const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");

describe("SyntheticBotToken", () => {
  let deployer;
  let otherUser;
  
  let testToken;
  let testTokenAddress;
  let TestTokenFactory;

  let feePool;
  let feePoolAddress;
  let FeePoolFactory;

  let botPerformanceOracle;
  let botPerformanceOracleAddress;
  let BotPerformanceOracleFactory;

  let tradingBot;
  let tradingBotAddress;
  let TradingBotFactory;

  let priceAggregatorRouter;
  let priceAggregatorRouterAddress;
  let PriceAggregatorRouterFactory;

  let syntheticBotToken;
  let syntheticBotTokenAddress;
  let SyntheticBotTokenFactory;

  const ONE_WEEK = 86400 * 7;
  const DURATION = 86400 * 365;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    TestTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    FeePoolFactory = await ethers.getContractFactory('FeePool');
    PriceAggregatorRouterFactory = await ethers.getContractFactory('PriceAggregatorRouter');
    BotPerformanceOracleFactory = await ethers.getContractFactory('TestBotPerformanceOracle');
    TradingBotFactory = await ethers.getContractFactory('TestTradingBot');
    SyntheticBotTokenFactory = await ethers.getContractFactory('TestSyntheticBotToken');

    testToken = await TestTokenFactory.deploy("Test token", "TEST");
    await testToken.deployed();
    testTokenAddress = testToken.address;

    feePool = await FeePoolFactory.deploy(testTokenAddress);
    await feePool.deployed();
    feePoolAddress = feePool.address;

    priceAggregatorRouter = await PriceAggregatorRouterFactory.deploy();
    await priceAggregatorRouter.deployed();
    priceAggregatorRouterAddress = priceAggregatorRouter.address;

    tradingBot = await TradingBotFactory.deploy();
    await tradingBot.deployed();
    tradingBotAddress = tradingBot.address;

    botPerformanceOracle = await BotPerformanceOracleFactory.deploy(priceAggregatorRouterAddress, deployer.address);
    await botPerformanceOracle.deployed();
    botPerformanceOracleAddress = botPerformanceOracle.address;
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    syntheticBotToken = await SyntheticBotTokenFactory.deploy(botPerformanceOracleAddress, tradingBotAddress, testTokenAddress, feePoolAddress);
    await syntheticBotToken.deployed();
    syntheticBotTokenAddress = syntheticBotToken.address;
  });
  
  describe("#remainingRewards", () => {
    it("0 time elapsed", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();

        let tx = await syntheticBotToken.setPosition(1, parseEther("1"), currentTime, Number(currentTime) + DURATION, currentTime, parseEther("1"), 1);
        await tx.wait();

        // 1 second elapsed since getting current time.
        let remainingRewards = await syntheticBotToken.remainingRewards(1);
        expect(remainingRewards).to.equal(DURATION - 1);
    });

    it("current time > end time", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();

        let tx = await syntheticBotToken.setPosition(1, parseEther("1"), currentTime, Number(currentTime) - 100, currentTime, parseEther("1"), 1);
        await tx.wait();

        // 1 second elapsed since getting current time.
        let remainingRewards = await syntheticBotToken.remainingRewards(1);
        expect(remainingRewards).to.equal(0);
    });
  });
});
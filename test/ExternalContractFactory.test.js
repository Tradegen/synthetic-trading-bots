const { expect } = require("chai");

describe("ExternalContractFactory", () => {
  let deployer;
  let otherUser;
  
  let testToken;
  let testTokenAddress;
  let TestTokenFactory;

  let feePool;
  let feePoolAddress;
  let FeePoolFactory;

  let priceAggregatorRouter;
  let priceAggregatorRouterAddress;
  let PriceAggregatorRouterFactory;

  let botPerformanceOracle;
  let BotPerformanceOracleFactory;

  let syntheticBotToken;
  let SyntheticBotTokenFactory;

  let externalContractFactory;
  let externalContractFactoryAddress;
  let ExternalContractFactoryFactory;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    TestTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    FeePoolFactory = await ethers.getContractFactory('FeePool');
    PriceAggregatorRouterFactory = await ethers.getContractFactory('PriceAggregatorRouter');
    BotPerformanceOracleFactory = await ethers.getContractFactory('BotPerformanceOracle');
    SyntheticBotTokenFactory = await ethers.getContractFactory('SyntheticBotToken');
    ExternalContractFactoryFactory = await ethers.getContractFactory('ExternalContractFactory');

    testToken = await TestTokenFactory.deploy("Test token", "TEST");
    await testToken.deployed();
    testTokenAddress = testToken.address;

    feePool = await FeePoolFactory.deploy(testTokenAddress);
    await feePool.deployed();
    feePoolAddress = feePool.address;

    priceAggregatorRouter = await PriceAggregatorRouterFactory.deploy();
    await priceAggregatorRouter.deployed();
    priceAggregatorRouterAddress = priceAggregatorRouter.address;
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    externalContractFactory = await ExternalContractFactoryFactory.deploy(priceAggregatorRouterAddress, testTokenAddress, feePoolAddress);
    await externalContractFactory.deployed();
    externalContractFactoryAddress = externalContractFactory.address;
  });
  
  describe("#createContracts", () => {
    it("create contracts", async () => {
        let tx = await externalContractFactory.createContracts(otherUser.address);
        let temp = await tx.wait();
        let botPerformanceOracleAddress = temp.events[1].args.botPerformanceOracle;
        let syntheticBotTokenAddress = temp.events[1].args.syntheticBotToken;

        botPerformanceOracle = BotPerformanceOracleFactory.attach(botPerformanceOracleAddress);
        syntheticBotToken = SyntheticBotTokenFactory.attach(syntheticBotTokenAddress);

        let router = await botPerformanceOracle.router();
        expect(router).to.equal(priceAggregatorRouterAddress);

        let externalOracle = await botPerformanceOracle.oracle();
        expect(externalOracle).to.equal(otherUser.address);

        let oracle = await syntheticBotToken.oracle();
        expect(oracle).to.equal(botPerformanceOracleAddress);

        let tradingBot = await syntheticBotToken.tradingBot();
        expect(tradingBot).to.equal(deployer.address);

        let collateralToken = await syntheticBotToken.collateralToken();
        expect(collateralToken).to.equal(testTokenAddress);

        let fee = await syntheticBotToken.feePool();
        expect(fee).to.equal(feePoolAddress);
    });
  });
});
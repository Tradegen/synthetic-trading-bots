const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");

describe("BotPerformanceOracle", () => {
  let deployer;
  let otherUser;
  
  let priceAggregator;
  let priceAggregatorAddress;
  let PriceAggregatorFactory;

  let priceAggregatorRouter;
  let priceAggregatorRouterAddress;
  let PriceAggregatorRouterFactory;

  let botPerformanceOracle;
  let botPerformanceOracleAddress;
  let BotPerformanceOracleFactory;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    PriceAggregatorFactory = await ethers.getContractFactory('TestPriceAggregator');
    PriceAggregatorRouterFactory = await ethers.getContractFactory('PriceAggregatorRouter');
    BotPerformanceOracleFactory = await ethers.getContractFactory('TestBotPerformanceOracle');

    priceAggregator = await PriceAggregatorFactory.deploy(otherUser.address, otherUser.address);
    await priceAggregator.deployed();
    priceAggregatorAddress = priceAggregator.address;

    priceAggregatorRouter = await PriceAggregatorRouterFactory.deploy();
    await priceAggregatorRouter.deployed();
    priceAggregatorRouterAddress = priceAggregatorRouter.address;

    let tx = await priceAggregatorRouter.setPriceAggregator(otherUser.address, priceAggregatorAddress);
    await tx.wait();
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    botPerformanceOracle = await BotPerformanceOracleFactory.deploy(priceAggregatorRouterAddress, deployer.address);
    await botPerformanceOracle.deployed();
    botPerformanceOracleAddress = botPerformanceOracle.address;
  });
  
  describe("#getTokenPrice", () => {
    it("0 orders", async () => {
        const tokenPrice = await botPerformanceOracle.getTokenPrice();
        expect(tokenPrice).to.equal(parseEther("1"));
    });

    it("latest order is buy", async () => {
        let tx = await botPerformanceOracle.setOrder(1, otherUser.address, true, 0, parseEther("1"), parseEther("1"));
        await tx.wait();

        let tx2 = await priceAggregator.setLatestRawPrice(parseEther("2"));
        await tx2.wait();

        let tx3 = await botPerformanceOracle.setNumberOfOrders(1);
        await tx3.wait();

        const tokenPrice = await botPerformanceOracle.getTokenPrice();
        expect(tokenPrice).to.equal(parseEther("2"));
    });

    it("latest order is sell", async () => {
        let tx = await botPerformanceOracle.setOrder(1, otherUser.address, false, 0, parseEther("1"), parseEther("1.5"));
        await tx.wait();

        let tx2 = await priceAggregator.setLatestRawPrice(parseEther("2"));
        await tx2.wait();

        let tx3 = await botPerformanceOracle.setNumberOfOrders(1);
        await tx3.wait();

        const tokenPrice = await botPerformanceOracle.getTokenPrice();
        expect(tokenPrice).to.equal(parseEther("1.5"));
    });
  });

  describe("#onOrderPlaced", () => {
    it("no existing orders", async () => {
        let tx = await botPerformanceOracle.onOrderPlaced(otherUser.address, true, parseEther("4"));
        await tx.wait();

        let tx2 = await priceAggregator.setLatestRawPrice(parseEther("2"));
        await tx2.wait();

        const tokenPrice = await botPerformanceOracle.getTokenPrice();
        expect(tokenPrice).to.equal(parseEther("0.5"));

        const orderInfo = await botPerformanceOracle.getOrderInfo(1);
        expect(orderInfo[0]).to.equal(otherUser.address);
        expect(orderInfo[1]).to.be.true;
        expect(orderInfo[3]).to.equal(parseEther("4"));
        expect(orderInfo[4]).to.equal(parseEther("1"));
    });

    it("existing buy order", async () => {
        let tx = await botPerformanceOracle.onOrderPlaced(otherUser.address, true, parseEther("4"));
        await tx.wait();

        let tx2 = await priceAggregator.setLatestRawPrice(parseEther("3.6"));
        await tx2.wait();

        let tx3 = await botPerformanceOracle.onOrderPlaced(otherUser.address, false, parseEther("3.6"));
        await tx3.wait();

        const tokenPrice = await botPerformanceOracle.getTokenPrice();
        expect(tokenPrice).to.equal(parseEther("0.9"));

        const orderInfo = await botPerformanceOracle.getOrderInfo(2);
        expect(orderInfo[0]).to.equal(otherUser.address);
        expect(orderInfo[1]).to.be.false;
        expect(orderInfo[3]).to.equal(parseEther("3.6"));
        expect(orderInfo[4]).to.equal(parseEther("0.9"));
    });

    it("existing sell order", async () => {
        let tx = await botPerformanceOracle.onOrderPlaced(otherUser.address, true, parseEther("2"));
        await tx.wait();

        let tx2 = await priceAggregator.setLatestRawPrice(parseEther("3"));
        await tx2.wait();

        const tokenPrice1 = await botPerformanceOracle.getTokenPrice();
        expect(tokenPrice1).to.equal(parseEther("1.5"));

        let tx3 = await botPerformanceOracle.onOrderPlaced(otherUser.address, false, parseEther("3"));
        await tx3.wait();

        const tokenPrice2 = await botPerformanceOracle.getTokenPrice();
        expect(tokenPrice2).to.equal(parseEther("1.5"));

        let tx4 = await priceAggregator.setLatestRawPrice(parseEther("4.5"));
        await tx4.wait();

        let tx5 = await botPerformanceOracle.onOrderPlaced(otherUser.address, true, parseEther("4.5"));
        await tx5.wait();

        const tokenPrice3 = await botPerformanceOracle.getTokenPrice();
        expect(tokenPrice3).to.equal(parseEther("1.5"));

        const orderInfo1 = await botPerformanceOracle.getOrderInfo(1);
        expect(orderInfo1[0]).to.equal(otherUser.address);
        expect(orderInfo1[1]).to.be.true;
        expect(orderInfo1[3]).to.equal(parseEther("2"));
        expect(orderInfo1[4]).to.equal(parseEther("1"));

        const orderInfo2 = await botPerformanceOracle.getOrderInfo(2);
        expect(orderInfo2[0]).to.equal(otherUser.address);
        expect(orderInfo2[1]).to.be.false;
        expect(orderInfo2[3]).to.equal(parseEther("3"));
        expect(orderInfo2[4]).to.equal(parseEther("1.5"));

        const orderInfo3 = await botPerformanceOracle.getOrderInfo(3);
        expect(orderInfo3[0]).to.equal(otherUser.address);
        expect(orderInfo3[1]).to.be.true;
        expect(orderInfo3[3]).to.equal(parseEther("4.5"));
        expect(orderInfo3[4]).to.equal(parseEther("1.5"));
    });
  });
});
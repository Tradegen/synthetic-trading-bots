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
  let syntheticBotToken2;
  let syntheticBotTokenAddress2;
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
    SyntheticBotTokenFactory = await ethers.getContractFactory('TestSyntheticBotToken');
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
  /*
  describe("#createListing", () => {
    it("no balance in position", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = marketplace.connect(otherUser).createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await expect(tx2).to.be.reverted;

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(0);

        let index = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index).to.equal(0);
    });

    it("below oracle price", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("0.8"), parseEther("1"));
        await expect(tx2).to.be.reverted;

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(0);

        let index = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index).to.equal(0);
    });

    it("no existing listings for asset", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx2.wait();

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(1);

        let index = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index).to.equal(1);

        let listing = await marketplace.getMarketplaceListing(1);
        expect(listing[0]).to.equal(deployer.address);
        expect(listing[1]).to.be.true;
        expect(listing[2]).to.equal(syntheticBotTokenAddress);
        expect(listing[3]).to.equal(1);
        expect(listing[4]).to.equal(parseEther("1"));
        expect(listing[5]).to.equal(parseEther("2"));
    });

    it("user already has listing for asset", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx2.wait();

        let tx3 = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx3.wait();

        let tx4 = marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await expect(tx4).to.be.reverted;

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(1);

        let index = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index).to.equal(1);

        let listing = await marketplace.getMarketplaceListing(1);
        expect(listing[0]).to.equal(deployer.address);
        expect(listing[1]).to.be.true;
        expect(listing[2]).to.equal(syntheticBotTokenAddress);
        expect(listing[3]).to.equal(1);
        expect(listing[4]).to.equal(parseEther("1"));
        expect(listing[5]).to.equal(parseEther("2"));
    });

    it("another user has listing for asset", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx2.wait();

        let tx3 = await syntheticBotToken.setApprovalForAll(otherUser.address, true);
        await tx3.wait();

        let tx4 = await syntheticBotToken.safeTransferFrom(deployer.address, otherUser.address, 1, parseEther("2"), "0x00");
        await tx4.wait();

        let tx5 = await syntheticBotToken.connect(otherUser).setApprovalForAll(marketplaceAddress, true);
        await tx5.wait();

        let tx6 = await marketplace.connect(otherUser).createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx6.wait();

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(2);

        let indexDeployer = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(indexDeployer).to.equal(1);

        let indexOther = await marketplace.userToID(otherUser.address, syntheticBotTokenAddress, 1);
        expect(indexOther).to.equal(2);

        let listingDeployer = await marketplace.getMarketplaceListing(1);
        expect(listingDeployer[0]).to.equal(deployer.address);
        expect(listingDeployer[1]).to.be.true;
        expect(listingDeployer[2]).to.equal(syntheticBotTokenAddress);
        expect(listingDeployer[3]).to.equal(1);
        expect(listingDeployer[4]).to.equal(parseEther("1"));
        expect(listingDeployer[5]).to.equal(parseEther("2"));

        let listingOther = await marketplace.getMarketplaceListing(2);
        expect(listingOther[0]).to.equal(otherUser.address);
        expect(listingOther[1]).to.be.true;
        expect(listingOther[2]).to.equal(syntheticBotTokenAddress);
        expect(listingOther[3]).to.equal(1);
        expect(listingOther[4]).to.equal(parseEther("1"));
        expect(listingOther[5]).to.equal(parseEther("2"));
    });

    it("create listing for multiple assets", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx2.wait();

        syntheticBotToken2 = await SyntheticBotTokenFactory.deploy(botPerformanceOracleAddress, tradingBotAddress, testTokenAddress, feePoolAddress);
        await syntheticBotToken2.deployed();
        syntheticBotTokenAddress2 = syntheticBotToken2.address;

        let tx3 = await testToken.approve(syntheticBotTokenAddress2, parseEther("11"));
        await tx3.wait();

        let tx4 = await syntheticBotToken2.mintTokens(parseEther("10"));
        await tx4.wait();

        let tx5 = await syntheticBotToken2.setApprovalForAll(marketplaceAddress, true);
        await tx5.wait();

        let tx6 = await marketplace.createListing(syntheticBotTokenAddress2, 1, parseEther("2"), parseEther("1"));
        await tx6.wait();

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(2);

        let index1 = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index1).to.equal(1);

        let listing1 = await marketplace.getMarketplaceListing(1);
        expect(listing1[0]).to.equal(deployer.address);
        expect(listing1[1]).to.be.true;
        expect(listing1[2]).to.equal(syntheticBotTokenAddress);
        expect(listing1[3]).to.equal(1);
        expect(listing1[4]).to.equal(parseEther("1"));
        expect(listing1[5]).to.equal(parseEther("2"));

        let index2 = await marketplace.userToID(deployer.address, syntheticBotTokenAddress2, 1);
        expect(index2).to.equal(2);

        let listing2 = await marketplace.getMarketplaceListing(2);
        expect(listing2[0]).to.equal(deployer.address);
        expect(listing2[1]).to.be.true;
        expect(listing2[2]).to.equal(syntheticBotTokenAddress2);
        expect(listing2[3]).to.equal(1);
        expect(listing2[4]).to.equal(parseEther("1"));
        expect(listing2[5]).to.equal(parseEther("2"));
    });

    it("list multiple positions in same asset", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx2.wait();

        let tx3 = await testToken.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx3.wait();

        let tx4 = await syntheticBotToken.mintTokens(parseEther("10"));
        await tx4.wait();

        let tx5 = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx5.wait();

        let tx6 = await marketplace.createListing(syntheticBotTokenAddress, 2, parseEther("5"), parseEther("2"));
        await tx6.wait();

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(2);

        let index1 = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index1).to.equal(1);

        let listing1 = await marketplace.getMarketplaceListing(1);
        expect(listing1[0]).to.equal(deployer.address);
        expect(listing1[1]).to.be.true;
        expect(listing1[2]).to.equal(syntheticBotTokenAddress);
        expect(listing1[3]).to.equal(1);
        expect(listing1[4]).to.equal(parseEther("1"));
        expect(listing1[5]).to.equal(parseEther("2"));

        let index2 = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 2);
        expect(index2).to.equal(2);

        let listing2 = await marketplace.getMarketplaceListing(2);
        expect(listing2[0]).to.equal(deployer.address);
        expect(listing2[1]).to.be.true;
        expect(listing2[2]).to.equal(syntheticBotTokenAddress);
        expect(listing2[3]).to.equal(2);
        expect(listing2[4]).to.equal(parseEther("2"));
        expect(listing2[5]).to.equal(parseEther("5"));
    });

    it("asset has rewards available before creating listing", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        let initialBalanceDeployer = await testToken.balanceOf(deployer.address);

        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        // Simulate 98 seconds elapsed.
        let tx2 = await syntheticBotToken.setLastUpdateTime(1, Number(currentTime) - 96);
        await tx2.wait();

        let tx3 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx3.wait();

        let newBalanceDeployer = await testToken.balanceOf(deployer.address);
        let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) + BigInt(31392694063860);
        expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());

        // No time elapsed since last claim.
        let earnedDeployer = await syntheticBotToken.earned(deployer.address, 1);
        expect(earnedDeployer).to.equal(0);

        let userRewardPerTokenPaidDeployer = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
        expect(userRewardPerTokenPaidDeployer).to.equal(3139269406386);

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(1);

        let index = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index).to.equal(1);

        let listing = await marketplace.getMarketplaceListing(1);
        expect(listing[0]).to.equal(deployer.address);
        expect(listing[1]).to.be.true;
        expect(listing[2]).to.equal(syntheticBotTokenAddress);
        expect(listing[3]).to.equal(1);
        expect(listing[4]).to.equal(parseEther("1"));
        expect(listing[5]).to.equal(parseEther("2"));
    });
  });*/

  describe("#removeListing", () => {/*
    it("only seller", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx2.wait();

        let tx3 = marketplace.connect(otherUser).removeListing(1);
        await expect(tx3).to.be.reverted;

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(1);

        let index = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index).to.equal(1);
    });

    it("no rewards accrued for marketplace", async () => {
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("1"));
        await tx2.wait();

        let initialBalance = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(initialBalance).to.equal(parseEther("9"));

        let tx3 = await marketplace.removeListing(1);
        await tx3.wait();

        let newBalance = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(newBalance).to.equal(parseEther("10"));

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(1);

        let index = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index).to.equal(0);

        let listing = await marketplace.getMarketplaceListing(1);
        expect(listing[0]).to.equal(deployer.address);
        expect(listing[1]).to.be.false;
        expect(listing[2]).to.equal(syntheticBotTokenAddress);
        expect(listing[3]).to.equal(1);
        expect(listing[4]).to.equal(0);
        expect(listing[5]).to.equal(parseEther("2"));
    });*/

    it("rewards accrued for marketplace", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        
        let tx = await syntheticBotToken.setApprovalForAll(marketplaceAddress, true);
        await tx.wait();

        let tx2 = await marketplace.createListing(syntheticBotTokenAddress, 1, parseEther("2"), parseEther("10"));
        await tx2.wait();

        let initialBalanceDeployer = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(initialBalanceDeployer).to.equal(0);

        let initialBalanceStaking = await testTGEN.balanceOf(botPerformanceOracleAddress);

        // Simulate 100 seconds elapsed.
        let tx3 = await syntheticBotToken.setLastUpdateTime(1, Number(currentTime) - 97);
        await tx3.wait();

        let tx4 = await marketplace.removeListing(1);
        await tx4.wait();

        let newBalanceDeployer = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(newBalanceDeployer).to.equal(parseEther("10"));

        let newBalanceStaking = await testTGEN.balanceOf(botPerformanceOracleAddress);
        let expectedNewBalanceStaking = BigInt(initialBalanceStaking) + BigInt(32026889903530);
        expect(newBalanceStaking.toString()).to.equal(expectedNewBalanceStaking.toString());

        let numberOfMarketplaceListings = await marketplace.numberOfMarketplaceListings();
        expect(numberOfMarketplaceListings).to.equal(1);

        let index = await marketplace.userToID(deployer.address, syntheticBotTokenAddress, 1);
        expect(index).to.equal(0);

        let listing = await marketplace.getMarketplaceListing(1);
        expect(listing[0]).to.equal(deployer.address);
        expect(listing[1]).to.be.false;
        expect(listing[2]).to.equal(syntheticBotTokenAddress);
        expect(listing[3]).to.equal(1);
        expect(listing[4]).to.equal(0);
        expect(listing[5]).to.equal(parseEther("2"));
    });
  });
});
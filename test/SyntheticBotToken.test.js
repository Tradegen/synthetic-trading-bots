const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");
/*
describe("SyntheticBotToken", () => {
  let deployer;
  let otherUser;
  
  let mcUSD;
  let mcUSDAddress;
  let TGEN;
  let TGENAddress;
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

  let router;
  let routerAddress;
  let RouterFactory;

  let syntheticBotToken;
  let syntheticBotTokenAddress;
  let SyntheticBotTokenFactory;

  const ONE_WEEK = 86400 * 7;
  const DURATION = 52 * ONE_WEEK;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    TestTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    FeePoolFactory = await ethers.getContractFactory('FeePool');
    RouterFactory = await ethers.getContractFactory('TestRouter');
    PriceAggregatorRouterFactory = await ethers.getContractFactory('PriceAggregatorRouter');
    BotPerformanceOracleFactory = await ethers.getContractFactory('TestBotPerformanceOracle');
    TradingBotFactory = await ethers.getContractFactory('TestTradingBot');
    SyntheticBotTokenFactory = await ethers.getContractFactory('TestSyntheticBotToken');

    mcUSD = await TestTokenFactory.deploy("Test token", "mcUSD");
    await mcUSD.deployed();
    mcUSDAddress = mcUSD.address;

    TGEN = await TestTokenFactory.deploy("Test TGEN", "TGEN");
    await TGEN.deployed();
    TGENAddress = TGEN.address;

    feePool = await FeePoolFactory.deploy(mcUSDAddress);
    await feePool.deployed();
    feePoolAddress = feePool.address;

    priceAggregatorRouter = await PriceAggregatorRouterFactory.deploy();
    await priceAggregatorRouter.deployed();
    priceAggregatorRouterAddress = priceAggregatorRouter.address;

    tradingBot = await TradingBotFactory.deploy(1000, 1000);
    await tradingBot.deployed();
    tradingBotAddress = tradingBot.address;

    router = await RouterFactory.deploy(TGENAddress);
    await router.deployed();
    routerAddress = router.address;

    botPerformanceOracle = await BotPerformanceOracleFactory.deploy(priceAggregatorRouterAddress, deployer.address);
    await botPerformanceOracle.deployed();
    botPerformanceOracleAddress = botPerformanceOracle.address;
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    // Using botPerformanceOracleAddress as xTGEN.
    syntheticBotToken = await SyntheticBotTokenFactory.deploy(botPerformanceOracleAddress, tradingBotAddress, mcUSDAddress, TGENAddress, feePoolAddress, routerAddress, botPerformanceOracleAddress);
    await syntheticBotToken.deployed();
    syntheticBotTokenAddress = syntheticBotToken.address;

    let tx = await TGEN.transfer(routerAddress, parseEther("1000"));
    await tx.wait();
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

  describe("#remainingRewardsForUser", () => {
    it("user has 0 balance", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();

        let tx = await syntheticBotToken.setPosition(1, parseEther("1"), currentTime, Number(currentTime) + DURATION, currentTime, parseEther("1"), 1);
        await tx.wait();

        // 1 second elapsed since getting current time.
        let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUser).to.equal(0);
    });

    it("user has positive balance; only investor in position", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();

        let tx = await syntheticBotToken.setPosition(1, parseEther("1"), currentTime, Number(currentTime) + DURATION, currentTime, parseEther("1"), 1);
        await tx.wait();

        let tx2 = await syntheticBotToken.testMint(deployer.address, 1, parseEther("1"));
        await tx2.wait();

        // 2 seconds elapsed since getting current time.
        let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUser).to.equal(DURATION - 2);
    });

    it("user has positive balance; multiple investors in position", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();

        let tx = await syntheticBotToken.setPosition(1, parseEther("2"), currentTime, Number(currentTime) + DURATION, currentTime, parseEther("1"), 1);
        await tx.wait();

        let tx2 = await syntheticBotToken.testMint(deployer.address, 1, parseEther("1"));
        await tx2.wait();

        // 2 seconds elapsed since getting current time.
        let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUser).to.equal((DURATION - 2) / 2);
    });
  });

  describe("#rewardPerToken", () => {
    it("reward per token", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();

        let tx = await syntheticBotToken.setPosition(1, 1, currentTime, Number(currentTime) + DURATION, currentTime - 99, 0, 1);
        await tx.wait();

        // 1 second elapsed since getting current time.
        let rewardPerToken = await syntheticBotToken.rewardPerToken(1);
        expect(rewardPerToken).to.equal(parseEther("100"));
    });
  });
  
  describe("#mintTokens", () => {
    it("no existing positions; max duration", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        let initialBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let initialBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let initialBalanceStaking = await TGEN.balanceOf(botPerformanceOracleAddress);

        let tx = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx.wait();

        let tx2 = await syntheticBotToken.mintTokens(parseEther("10"), 52);
        await tx2.wait();

        let newBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let newBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let newBalanceStaking = await TGEN.balanceOf(botPerformanceOracleAddress);
        let balanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

        let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) - BigInt(11e18);
        let expectedNewBalanceFeePool = BigInt(initialBalanceFeePool) + BigInt(1e18);
        expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());
        expect(newBalanceFeePool.toString()).to.equal(expectedNewBalanceFeePool.toString());
        expect(balanceToken).to.equal(parseEther("10"));
        expect(newBalanceStaking).to.equal(initialBalanceStaking);

        let balanceOf = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(balanceOf).to.equal(parseEther("10"));

        // No time elapsed.
        let earned = await syntheticBotToken.earned(deployer.address, 1);
        expect(earned).to.equal(0);

        // No time elapsed.
        let rewardPerToken = await syntheticBotToken.rewardPerToken(1);
        expect(rewardPerToken).to.equal(0);

        // No time elapsed.
        let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUser).to.be.gt(parseEther("9.99999999"));
        expect(remainingRewardsForUser).to.be.lt(parseEther("10.00000001"));

        let userRewardPerTokenPaid = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
        expect(userRewardPerTokenPaid).to.equal(0);

        let numberOfPositions = await syntheticBotToken.numberOfPositions();
        expect(numberOfPositions).to.equal(1);

        let positionInfo = await syntheticBotToken.getPosition(1);
        expect(positionInfo[0]).to.equal(parseEther("10"));
        expect(positionInfo[1]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[2]).to.equal(Number(currentTime) + DURATION + 2);
        expect(positionInfo[3]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[4]).to.equal(0);
        expect(positionInfo[5]).to.equal(317969067969);             
    });

    it("no existing positions; min duration", async () => {
      let currentTime = await syntheticBotToken.getCurrentTime();
      let initialBalanceDeployer = await mcUSD.balanceOf(deployer.address);
      let initialBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
      let initialBalanceStaking = await TGEN.balanceOf(botPerformanceOracleAddress);

      let tx = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
      await tx.wait();

      let tx2 = await syntheticBotToken.mintTokens(parseEther("10"), 4);
      await tx2.wait();

      let newBalanceDeployer = await mcUSD.balanceOf(deployer.address);
      let newBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
      let newBalanceStaking = await TGEN.balanceOf(botPerformanceOracleAddress);
      let balanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

      let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) - BigInt(11e18);
      let expectedNewBalanceFeePool = BigInt(initialBalanceFeePool) + BigInt(1e18);
      let expectedNewBalanceStaking = BigInt(initialBalanceStaking) + BigInt(2e18);
      expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());
      expect(newBalanceFeePool.toString()).to.equal(expectedNewBalanceFeePool.toString());
      expect(balanceToken).to.equal(parseEther("8"));
      expect(newBalanceStaking.toString()).to.equal(expectedNewBalanceStaking.toString());

      let balanceOf = await syntheticBotToken.balanceOf(deployer.address, 1);
      expect(balanceOf).to.equal(parseEther("10"));

      // No time elapsed.
      let earned = await syntheticBotToken.earned(deployer.address, 1);
      expect(earned).to.equal(0);

      // No time elapsed.
      let rewardPerToken = await syntheticBotToken.rewardPerToken(1);
      expect(rewardPerToken).to.equal(0);

      // No time elapsed.
      let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
      expect(remainingRewardsForUser).to.be.gt(parseEther("7.99999999"));
      expect(remainingRewardsForUser).to.be.lt(parseEther("8.00000001"));

      let userRewardPerTokenPaid = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
      expect(userRewardPerTokenPaid).to.equal(0);

      let numberOfPositions = await syntheticBotToken.numberOfPositions();
      expect(numberOfPositions).to.equal(1);

      let positionInfo = await syntheticBotToken.getPosition(1);
      expect(positionInfo[0]).to.equal(parseEther("10"));
      expect(positionInfo[1]).to.equal(Number(currentTime) + 2);
      expect(positionInfo[2]).to.equal(Number(currentTime) + (ONE_WEEK * 4) + 2);
      expect(positionInfo[3]).to.equal(Number(currentTime) + 2);
      expect(positionInfo[4]).to.equal(0);
      expect(positionInfo[5]).to.equal(3306878306878);         
    });
    
    it("existing positions", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        let initialBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let initialBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);

        let tx = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx.wait();

        let tx2 = await syntheticBotToken.mintTokens(parseEther("10"), 52);
        await tx2.wait();

        let tx3 = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx3.wait();

        let tx4 = await syntheticBotToken.mintTokens(parseEther("10"), 52);
        await tx4.wait();

        let newBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let newBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let balanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

        let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) - BigInt(22e18);
        let expectedNewBalanceFeePool = BigInt(initialBalanceFeePool) + BigInt(2e18);
        expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());
        expect(newBalanceFeePool.toString()).to.equal(expectedNewBalanceFeePool.toString());
        expect(balanceToken).to.equal(parseEther("20"));

        let balanceOf = await syntheticBotToken.balanceOf(deployer.address, 2);
        expect(balanceOf).to.equal(parseEther("10"));

        // No time elapsed.
        let earned = await syntheticBotToken.earned(deployer.address, 2);
        expect(earned).to.equal(0);

        // 2 seconds elapsed.
        let rewardPerToken1 = await syntheticBotToken.rewardPerToken(31709791983);
        expect(rewardPerToken1).to.equal(0);

        // 2 seconds elapsed.
        let earned1 = await syntheticBotToken.earned(deployer.address, 1);
        expect(earned1).to.equal(635938135930);

        // No time elapsed.
        let rewardPerToken2 = await syntheticBotToken.rewardPerToken(0);
        expect(rewardPerToken2).to.equal(0);

        // No time elapsed.
        let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUser).to.be.gt(parseEther("9.9999"));
        expect(remainingRewardsForUser).to.be.lt(parseEther("10.00000001"));

        let userRewardPerTokenPaid = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
        expect(userRewardPerTokenPaid).to.equal(0);

        let numberOfPositions = await syntheticBotToken.numberOfPositions();
        expect(numberOfPositions).to.equal(2);

        let positionInfo = await syntheticBotToken.getPosition(1);
        expect(positionInfo[0]).to.equal(parseEther("10"));
        expect(positionInfo[1]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[2]).to.equal(Number(currentTime) + DURATION + 2);
        expect(positionInfo[3]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[4]).to.equal(0);
        expect(positionInfo[5]).to.equal(317969067969);
    });
  });
  
  describe("#claimRewards", () => {
    it("one investor; 100 seconds elapsed", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        let initialBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let initialBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);

        let tx = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx.wait();

        let tx2 = await syntheticBotToken.mintTokens(parseEther("10"), 52);
        await tx2.wait();

        // Simulate 100 seconds elapsed.
        let tx3 = await syntheticBotToken.setLastUpdateTime(1, Number(currentTime) - 96);
        await tx3.wait();

        let initialBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

        let tx4 = await syntheticBotToken.claimRewards(1);
        await tx4.wait();

        let newBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let newBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let newBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

        let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) - BigInt(11e18) + BigInt(31796906796900);
        let expectedNewBalanceFeePool = BigInt(initialBalanceFeePool) + BigInt(1e18);
        let expectedNewBalanceToken = BigInt(initialBalanceToken) - BigInt(31796906796900)
        expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());
        expect(newBalanceFeePool.toString()).to.equal(expectedNewBalanceFeePool.toString());
        expect(newBalanceToken.toString()).to.equal(expectedNewBalanceToken.toString());

        let balanceOf = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(balanceOf).to.equal(parseEther("10"));

        // No time elapsed since last claim.
        let earned2 = await syntheticBotToken.earned(deployer.address, 1);
        expect(earned2).to.equal(0);

        // No time elapsed since last claim.
        let rewardPerToken = await syntheticBotToken.rewardPerToken(1);
        expect(rewardPerToken).to.equal(3179690679690);

        // No time elapsed.
        let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUser).to.be.gt(parseEther("9.999"));
        expect(remainingRewardsForUser).to.be.lt(parseEther("10.00000001"));

        let userRewardPerTokenPaid = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
        expect(userRewardPerTokenPaid).to.equal(3179690679690);

        let numberOfPositions = await syntheticBotToken.numberOfPositions();
        expect(numberOfPositions).to.equal(1);

        let positionInfo = await syntheticBotToken.getPosition(1);
        expect(positionInfo[0]).to.equal(parseEther("10"));
        expect(positionInfo[1]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[2]).to.equal(Number(currentTime) + DURATION + 2);
        expect(positionInfo[3]).to.equal(Number(currentTime) + 4);
        expect(positionInfo[4]).to.equal(3179690679690);
        expect(positionInfo[5]).to.equal(317969067969);
    });

    it("one investor; (duration + 1) seconds elapsed", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        let initialBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let initialBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);

        let tx = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx.wait();

        let tx2 = await syntheticBotToken.mintTokens(parseEther("10"), 52);
        await tx2.wait();

        // Simulate 100 seconds elapsed.
        let tx3 = await syntheticBotToken.setRewardsEndOn(1, Number(currentTime) + 1);
        await tx3.wait();

        let tx4 = await syntheticBotToken.setLastUpdateTime(1, Number(currentTime) + 1 - DURATION);
        await tx4.wait();

        let initialBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);
        let earned2 = await syntheticBotToken.earned(deployer.address, 1);

        let tx5 = await syntheticBotToken.claimRewards(1);
        await tx5.wait();

        let newBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let newBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let newBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

        let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) - BigInt(11e18) + BigInt(earned2);
        let expectedNewBalanceFeePool = BigInt(initialBalanceFeePool) + BigInt(1e18);
        let expectedNewBalanceToken = BigInt(initialBalanceToken) - BigInt(earned2);
        expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());
        expect(newBalanceFeePool.toString()).to.equal(expectedNewBalanceFeePool.toString());
        expect(newBalanceToken.toString()).to.equal(expectedNewBalanceToken.toString());

        let balanceOf = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(balanceOf).to.equal(parseEther("10"));

        // No time elapsed since last claim.
        let earned = await syntheticBotToken.earned(deployer.address, 1);
        expect(earned).to.equal(0);

        // No time elapsed since last claim.
        let rewardPerToken = await syntheticBotToken.rewardPerToken(1);
        expect(rewardPerToken).to.equal((BigInt(earned2) / BigInt(10)).toString());

        // Rewards duration finished.
        let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUser).to.be.equal(0);

        let userRewardPerTokenPaid = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
        expect(userRewardPerTokenPaid).to.equal(rewardPerToken);

        let numberOfPositions = await syntheticBotToken.numberOfPositions();
        expect(numberOfPositions).to.equal(1);

        let positionInfo = await syntheticBotToken.getPosition(1);
        expect(positionInfo[0]).to.equal(parseEther("10"));
        expect(positionInfo[1]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[2]).to.equal(Number(currentTime) + 1);
        expect(positionInfo[3]).to.equal(Number(currentTime) + 1);
        expect(positionInfo[4]).to.equal(rewardPerToken);
        expect(positionInfo[5]).to.equal(317969067969);
    });

    it("multiple investors; 100 seconds elapsed", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        let initialBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);

        //let tx = await mcUSD.transfer(otherUser.address, parseEther("10"));
        //await tx.wait();

        let initialBalanceDeployer = await mcUSD.balanceOf(deployer.address);

        let tx2 = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx2.wait();

        let tx3 = await syntheticBotToken.mintTokens(parseEther("10"), 52);
        await tx3.wait();

        let tx4 = await syntheticBotToken.testMint(otherUser.address, 1, parseEther("10"));
        await tx4.wait();

        let tx5 = await syntheticBotToken.setNumberOfTokens(1, parseEther("20"));
        await tx5.wait();

        // Simulate 100 seconds elapsed.
        let tx6 = await syntheticBotToken.setLastUpdateTime(1, Number(currentTime) - 94);
        await tx6.wait();

        let initialBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

        let tx7 = await syntheticBotToken.claimRewards(1);
        await tx7.wait();

        let rewardPerToken1 = await syntheticBotToken.rewardPerToken(1);
        let expectedEarned1 = BigInt(rewardPerToken1) * BigInt(10);
        console.log(expectedEarned1);

        let newBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let initialBalanceOther = await mcUSD.balanceOf(otherUser.address);
        console.log(initialBalanceOther.toString());

        let tx8 = await syntheticBotToken.connect(otherUser).claimRewards(1);
        await tx8.wait();

        let rewardPerToken2 = await syntheticBotToken.rewardPerToken(1);
        let expectedEarned2 = BigInt(rewardPerToken2) * BigInt(10);
        console.log(expectedEarned2);
        
        let newBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let newBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);
        let newBalanceOther = await mcUSD.balanceOf(otherUser.address);

        let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) - BigInt(11e18) + BigInt(expectedEarned1);
        let expectedNewBalanceOther = BigInt(initialBalanceOther) + BigInt(expectedEarned2);
        let expectedNewBalanceFeePool = BigInt(initialBalanceFeePool) + BigInt(1e18);
        let expectedNewBalanceToken = BigInt(initialBalanceToken) - BigInt(expectedEarned1) - BigInt(expectedEarned2);
        expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());
        expect(newBalanceFeePool.toString()).to.equal(expectedNewBalanceFeePool.toString());
        expect(newBalanceToken.toString()).to.equal(expectedNewBalanceToken.toString());
        expect(newBalanceOther.toString()).to.equal(expectedNewBalanceOther.toString());

        let balanceOfDeployer = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(balanceOfDeployer).to.equal(parseEther("10"));

        let balanceOfOther = await syntheticBotToken.balanceOf(otherUser.address, 1);
        expect(balanceOfOther).to.equal(parseEther("10"));

        // 1 second elapsed since last claim.
        let earnedDeployer = await syntheticBotToken.earned(deployer.address, 1);
        expect(earnedDeployer).to.equal(158984533980);

        // No time elapsed since last claim.
        let earnedOther = await syntheticBotToken.earned(otherUser.address, 1);
        expect(earnedOther).to.equal(0);

        // No time elapsed since last claim.
        let rewardPerToken = await syntheticBotToken.rewardPerToken(1);
        expect(rewardPerToken).to.equal(1605743793243);

        // No time elapsed.
        let remainingRewardsForUser = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUser).to.be.gt(parseEther("4.999"));
        expect(remainingRewardsForUser).to.be.lt(parseEther("5.00000001"));

        let userRewardPerTokenPaidDeployer = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
        expect(userRewardPerTokenPaidDeployer).to.equal(1589845339845);

        let userRewardPerTokenPaidOther = await syntheticBotToken.userRewardPerTokenPaid(otherUser.address, 1);
        expect(userRewardPerTokenPaidOther).to.equal(1605743793243);

        let numberOfPositions = await syntheticBotToken.numberOfPositions();
        expect(numberOfPositions).to.equal(1);

        let positionInfo = await syntheticBotToken.getPosition(1);
        expect(positionInfo[0]).to.equal(parseEther("20"));
        expect(positionInfo[1]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[2]).to.equal(Number(currentTime) + DURATION + 2);
        expect(positionInfo[3]).to.equal(Number(currentTime) + 7);
        expect(positionInfo[4]).to.equal(1605743793243);
        expect(positionInfo[5]).to.equal(317969067969);
    });
  });

  describe("#safeTransferFrom", () => {
    it("no rewards available for recipient", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        let initialBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let initialBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let initialBalanceOther = await mcUSD.balanceOf(otherUser.address);

        let tx = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx.wait();

        let tx2 = await syntheticBotToken.mintTokens(parseEther("10"), 52);
        await tx2.wait();

        // Simulate 100 seconds elapsed.
        let tx3 = await syntheticBotToken.setLastUpdateTime(1, Number(currentTime) - 96);
        await tx3.wait();

        let initialBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

        let tx4 = await syntheticBotToken.setApprovalForAll(otherUser.address, true);
        await tx4.wait();

        let tx5 = await syntheticBotToken.safeTransferFrom(deployer.address, otherUser.address, 1, parseEther("5"), "0x00");
        await tx5.wait();

        let newBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let newBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let newBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);
        let newBalanceOther = await mcUSD.balanceOf(otherUser.address);

        let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) - BigInt(11e18) + BigInt(32114875864860);
        let expectedNewBalanceFeePool = BigInt(initialBalanceFeePool) + BigInt(1e18);
        let expectedNewBalanceToken = BigInt(initialBalanceToken) - BigInt(32114875864860)
        expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());
        expect(newBalanceFeePool.toString()).to.equal(expectedNewBalanceFeePool.toString());
        expect(newBalanceToken.toString()).to.equal(expectedNewBalanceToken.toString());
        expect(newBalanceOther).to.equal(initialBalanceOther);

        let balanceOfDeployer = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(balanceOfDeployer).to.equal(parseEther("5"));

        let balanceOfOther = await syntheticBotToken.balanceOf(otherUser.address, 1);
        expect(balanceOfOther).to.equal(parseEther("5"));

        // No time elapsed since last claim.
        let earnedDeployer = await syntheticBotToken.earned(deployer.address, 1);
        expect(earnedDeployer).to.equal(0);

        // No time elapsed since last claim.
        let earnedOther = await syntheticBotToken.earned(otherUser.address, 1);
        expect(earnedOther).to.equal(0);

        // No time elapsed since last claim.
        let rewardPerToken = await syntheticBotToken.rewardPerToken(1);
        expect(rewardPerToken).to.equal(3211487586486);

        // No time elapsed.
        let remainingRewardsForUserDeployer = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUserDeployer).to.be.gt(parseEther("4.999"));
        expect(remainingRewardsForUserDeployer).to.be.lt(parseEther("5.00000001"));

        // No time elapsed.
        let remainingRewardsForUserOther = await syntheticBotToken.remainingRewardsForUser(otherUser.address, 1);
        expect(remainingRewardsForUserOther).to.be.gt(parseEther("4.999"));
        expect(remainingRewardsForUserOther).to.be.lt(parseEther("5.00000001"));

        let userRewardPerTokenPaidDeployer = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
        expect(userRewardPerTokenPaidDeployer).to.equal(3211487586486);

        let userRewardPerTokenPaidOther = await syntheticBotToken.userRewardPerTokenPaid(otherUser.address, 1);
        expect(userRewardPerTokenPaidOther).to.equal(3211487586486);

        let numberOfPositions = await syntheticBotToken.numberOfPositions();
        expect(numberOfPositions).to.equal(1);

        let positionInfo = await syntheticBotToken.getPosition(1);
        expect(positionInfo[0]).to.equal(parseEther("10"));
        expect(positionInfo[1]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[2]).to.equal(Number(currentTime) + DURATION + 2);
        expect(positionInfo[3]).to.equal(Number(currentTime) + 5);
        expect(positionInfo[4]).to.equal(3211487586486);
        expect(positionInfo[5]).to.equal(317969067969);
    });

    it("rewards available for recipient", async () => {
        let currentTime = await syntheticBotToken.getCurrentTime();
        let initialBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let initialBalanceDeployer = await mcUSD.balanceOf(deployer.address);

        let tx = await mcUSD.approve(syntheticBotTokenAddress, parseEther("11"));
        await tx.wait();

        let tx2 = await syntheticBotToken.mintTokens(parseEther("10"), 52);
        await tx2.wait();

        let tx3 = await syntheticBotToken.testMint(otherUser.address, 1, parseEther("10"));
        await tx3.wait();

        let tx4 = await syntheticBotToken.setNumberOfTokens(1, parseEther("20"));
        await tx4.wait();

        // Simulate 100 seconds elapsed.
        let tx6 = await syntheticBotToken.setLastUpdateTime(1, Number(currentTime) - 94);
        await tx6.wait();

        let initialBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);

        let tx7 = await syntheticBotToken.setApprovalForAll(otherUser.address, true);
        await tx7.wait();

        let tx8 = await syntheticBotToken.safeTransferFrom(deployer.address, otherUser.address, 1, parseEther("5"), "0x00");
        await tx8.wait();

        let rewardPerToken1 = await syntheticBotToken.rewardPerToken(1);
        let expectedEarned1 = BigInt(rewardPerToken1) * BigInt(10);
        console.log(expectedEarned1);

        let newBalanceDeployer = await mcUSD.balanceOf(deployer.address);
        let initialBalanceOther = await mcUSD.balanceOf(otherUser.address);
        console.log(initialBalanceOther.toString());

        let rewardPerToken2 = await syntheticBotToken.rewardPerToken(1);
        let expectedEarned2 = BigInt(rewardPerToken2) * BigInt(10);
        console.log(expectedEarned2);
        
        let newBalanceFeePool = await mcUSD.balanceOf(feePoolAddress);
        let newBalanceToken = await mcUSD.balanceOf(syntheticBotTokenAddress);
        let newBalanceOther = await mcUSD.balanceOf(otherUser.address);

        let expectedNewBalanceDeployer = BigInt(initialBalanceDeployer) - BigInt(11e18) + BigInt(expectedEarned1);
        let expectedNewBalanceFeePool = BigInt(initialBalanceFeePool) + BigInt(1e18);
        let expectedNewBalanceToken = BigInt(initialBalanceToken) - BigInt(expectedEarned1);
        expect(newBalanceDeployer.toString()).to.equal(expectedNewBalanceDeployer.toString());
        expect(newBalanceFeePool.toString()).to.equal(expectedNewBalanceFeePool.toString());
        expect(newBalanceOther).to.equal(initialBalanceOther);
        expect(newBalanceToken.toString()).to.equal(expectedNewBalanceToken.toString());

        let balanceOfDeployer = await syntheticBotToken.balanceOf(deployer.address, 1);
        expect(balanceOfDeployer).to.equal(parseEther("5"));

        let balanceOfOther = await syntheticBotToken.balanceOf(otherUser.address, 1);
        expect(balanceOfOther).to.equal(parseEther("15"));

        // 1 second elapsed since last claim.
        let earnedDeployer = await syntheticBotToken.earned(deployer.address, 1);
        expect(earnedDeployer).to.equal(0);

        // No time elapsed since last claim.
        let earnedOther = await syntheticBotToken.earned(otherUser.address, 1);
        expect(earnedOther).to.equal(16057437932430);

        // No time elapsed since last claim.
        let rewardPerToken = await syntheticBotToken.rewardPerToken(1);
        expect(rewardPerToken).to.equal(1605743793243);

        // No time elapsed.
        let remainingRewardsForUserDeployer = await syntheticBotToken.remainingRewardsForUser(deployer.address, 1);
        expect(remainingRewardsForUserDeployer).to.be.gt(parseEther("2.4999"));
        expect(remainingRewardsForUserDeployer).to.be.lt(parseEther("2.500000001"));

        // No time elapsed.
        let remainingRewardsForUserOther = await syntheticBotToken.remainingRewardsForUser(otherUser.address, 1);
        expect(remainingRewardsForUserOther).to.be.gt(parseEther("7.4999"));
        expect(remainingRewardsForUserOther).to.be.lt(parseEther("7.500000001"));

        let userRewardPerTokenPaidDeployer = await syntheticBotToken.userRewardPerTokenPaid(deployer.address, 1);
        expect(userRewardPerTokenPaidDeployer).to.equal(1605743793243);

        let userRewardPerTokenPaidOther = await syntheticBotToken.userRewardPerTokenPaid(otherUser.address, 1);
        expect(userRewardPerTokenPaidOther).to.equal(1605743793243);

        let numberOfPositions = await syntheticBotToken.numberOfPositions();
        expect(numberOfPositions).to.equal(1);

        let positionInfo = await syntheticBotToken.getPosition(1);
        expect(positionInfo[0]).to.equal(parseEther("20"));
        expect(positionInfo[1]).to.equal(Number(currentTime) + 2);
        expect(positionInfo[2]).to.equal(Number(currentTime) + DURATION + 2);
        expect(positionInfo[3]).to.equal(Number(currentTime) + 7);
        expect(positionInfo[4]).to.equal(1605743793243);
        expect(positionInfo[5]).to.equal(317969067969);
    });
  });
});*/
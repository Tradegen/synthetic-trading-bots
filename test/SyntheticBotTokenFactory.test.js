const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");
/*
describe("SyntheticBotTokenFactory", () => {
  let deployer;
  let otherUser;
  
  let testTGEN;
  let testTGENAddress;
  let TestTokenFactory;

  let ubeswapAdapter;
  let ubeswapAdapterAddress;
  let UbeswapAdapterFactory;

  let syntheticBotTokenFactoryContract;
  let syntheticBotTokenFactoryAddress;
  let SyntheticBotTokenFactoryFactory;

  let backupMode;
  let backupModeAddress;
  let BackupModeFactory;

  let backupEscrow;
  let backupEscrowAddress;
  let BackupEscrowFactory;

  let dataFeed;
  let dataFeedAddress;
  let DataFeedFactory;

  let tradingBot;
  let tradingBotAddress;
  let TradingBotFactory;

  let router;
  let routerAddress;
  let RouterFactory;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    TestTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    UbeswapAdapterFactory = await ethers.getContractFactory('TestUbeswapAdapter');
    BackupModeFactory = await ethers.getContractFactory('BackupMode');
    BackupEscrowFactory = await ethers.getContractFactory('BackupEscrow');
    SyntheticBotTokenFactoryFactory = await ethers.getContractFactory('SyntheticBotTokenFactory');
    DataFeedFactory = await ethers.getContractFactory('TestBotPerformanceDataFeed');
    TradingBotFactory = await ethers.getContractFactory('TestTradingBot');
    RouterFactory = await ethers.getContractFactory('TestRouter');

    testTGEN = await TestTokenFactory.deploy("Test token", "TGEN");
    await testTGEN.deployed();
    testTGENAddress = testTGEN.address;

    ubeswapAdapter = await UbeswapAdapterFactory.deploy();
    await ubeswapAdapter.deployed();
    ubeswapAdapterAddress = ubeswapAdapter.address;

    tradingBot = await TradingBotFactory.deploy();
    await tradingBot.deployed();
    tradingBotAddress = tradingBot.address;

    dataFeed = await DataFeedFactory.deploy(testTGENAddress, parseEther("1"));
    await dataFeed.deployed();
    dataFeedAddress = dataFeed.address;

    router = await RouterFactory.deploy(testTGENAddress);
    await router.deployed();
    routerAddress = router.address;

    backupEscrow = await BackupEscrowFactory.deploy(testTGENAddress);
    await backupEscrow.deployed();
    backupEscrowAddress = backupEscrow.address;

    backupMode = await BackupModeFactory.deploy(ubeswapAdapterAddress, testTGENAddress, backupEscrowAddress, otherUser.address);
    await backupMode.deployed();
    backupModeAddress = backupMode.address;
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    syntheticBotTokenFactoryContract = await SyntheticBotTokenFactoryFactory.deploy(backupEscrowAddress, testTGENAddress, testTGENAddress, routerAddress, deployer.address, backupModeAddress);
    await syntheticBotTokenFactoryContract.deployed();
    syntheticBotTokenFactoryAddress = syntheticBotTokenFactoryContract.address;
  });
  
  describe("#createContract", () => {
    it("only owner", async () => {
        let tx = syntheticBotTokenFactoryContract.connect(otherUser).createContract(dataFeedAddress, tradingBotAddress);
        await expect(tx).to.be.reverted;
    });

    it("meets requirements", async () => {
      let tx = await backupEscrow.initializeContracts(syntheticBotTokenFactoryAddress, backupModeAddress);
      await tx.wait();

        let tx2 = await syntheticBotTokenFactoryContract.createContract(dataFeedAddress, tradingBotAddress);
        let temp = await tx2.wait();
        expect(temp).to.emit("CreatedContract");
    });
  });
});*/
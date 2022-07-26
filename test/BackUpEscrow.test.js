const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");
/*
describe("BackupEscrow", () => {
  let deployer;
  let otherUser;
  
  let testTGEN;
  let testTGENAddress;
  let TestTokenFactory;

  let ubeswapAdapter;
  let ubeswapAdapterAddress;
  let UbeswapAdapterFactory;

  let syntheticBotToken;
  let syntheticBotTokenAddress;
  let SyntheticBotTokenFactory;

  let backupMode;
  let backupModeAddress;
  let BackupModeFactory;

  let backupEscrow;
  let backupEscrowAddress;
  let BackupEscrowFactory;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    TestTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    UbeswapAdapterFactory = await ethers.getContractFactory('TestUbeswapAdapter');
    BackupModeFactory = await ethers.getContractFactory('BackupMode');
    BackupEscrowFactory = await ethers.getContractFactory('BackupEscrow');
    SyntheticBotTokenFactory = await ethers.getContractFactory('TestSyntheticBotToken2');

    testTGEN = await TestTokenFactory.deploy("Test token", "TGEN");
    await testTGEN.deployed();
    testTGENAddress = testTGEN.address;

    ubeswapAdapter = await UbeswapAdapterFactory.deploy();
    await ubeswapAdapter.deployed();
    ubeswapAdapterAddress = ubeswapAdapter.address;

    syntheticBotToken = await SyntheticBotTokenFactory.deploy();
    await syntheticBotToken.deployed();
    syntheticBotTokenAddress = syntheticBotToken.address;
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    backupEscrow = await BackupEscrowFactory.deploy(testTGENAddress);
    await backupEscrow.deployed();
    backupEscrowAddress = backupEscrow.address;

    backupMode = await BackupModeFactory.deploy(ubeswapAdapterAddress, testTGENAddress, backupEscrowAddress, otherUser.address);
    await backupMode.deployed();
    backupModeAddress = backupMode.address;

    let tx = await testTGEN.transfer(backupModeAddress, parseEther("1000000"));
    await tx.wait();
  });
  
  describe("#initializeContracts", () => {
    it("onlyOwner", async () => {
        let tx = backupEscrow.connect(otherUser).initializeContracts(deployer.address, backupModeAddress)
        await expect(tx).to.be.reverted;
    });

    it("meets requirements", async () => {
        let tx = await backupEscrow.initializeContracts(deployer.address, backupModeAddress)
        await tx.wait();

        let address = await backupEscrow.backupMode();
        expect(address).to.equal(backupModeAddress);

        let address2 = await backupEscrow.factory();
        expect(address2).to.equal(deployer.address);
    });

    it("already initialized contracts", async () => {
        let tx = await backupEscrow.initializeContracts(deployer.address, backupModeAddress)
        await tx.wait();

        let tx2 = backupEscrow.connect(otherUser).initializeContracts(deployer.address, backupModeAddress)
        await expect(tx2).to.be.reverted;
    });
  });

  describe("#registerBotToken", () => {
    it("onlyFactory", async () => {
        let tx = await backupEscrow.initializeContracts(deployer.address, backupModeAddress)
        await tx.wait();

        let tx2 = backupEscrow.connect(otherUser).registerBotToken(syntheticBotTokenAddress);
        await expect(tx2).to.be.reverted;
    });

    it("meets requirements", async () => {
        let tx = await backupEscrow.initializeContracts(deployer.address, backupModeAddress)
        await tx.wait();

        let tx2 = await backupEscrow.registerBotToken(syntheticBotTokenAddress);
        await tx2.wait();

        let registeredBotToken = await backupEscrow.registeredBotToken(syntheticBotTokenAddress);
        expect(registeredBotToken).to.be.true;
    });
  });

  describe("#withdraw", () => {
    it("backup mode is not on", async () => {
        let tx = await backupEscrow.initializeContracts(deployer.address, backupModeAddress)
        await tx.wait();

        let tx2 = backupEscrow.withdraw(syntheticBotTokenAddress);
        await expect(tx2).to.be.reverted;

        let hasWithdrawn = await backupEscrow.hasWithdrawn(deployer.address, syntheticBotTokenAddress);
        expect(hasWithdrawn).to.be.false;
    });

    it("meets requirements", async () => {
        let tx = await backupEscrow.initializeContracts(deployer.address, backupModeAddress)
        await tx.wait();

        let tx2 = await backupMode.turnOnBackupMode(parseEther("2000000"));
        await tx2.wait();

        let tx3 = await backupEscrow.connect(otherUser).withdraw(syntheticBotTokenAddress);
        await tx3.wait();

        let hasWithdrawn = await backupEscrow.hasWithdrawn(otherUser.address, syntheticBotTokenAddress);
        expect(hasWithdrawn).to.be.true;

        let balance1 = await testTGEN.balanceOf(otherUser.address);
        expect(balance1).to.equal(parseEther("500000"));

        let balance2 = await testTGEN.balanceOf(backupEscrowAddress);
        expect(balance2).to.equal(parseEther("500000"));
    });

    it("already withdrawn", async () => {
        let tx = await backupEscrow.initializeContracts(deployer.address, backupModeAddress)
        await tx.wait();

        let tx2 = await backupMode.turnOnBackupMode(parseEther("2000000"));
        await tx2.wait();

        let tx3 = await backupEscrow.connect(otherUser).withdraw(syntheticBotTokenAddress);
        await tx3.wait();

        let tx4 = backupEscrow.connect(otherUser).withdraw(syntheticBotTokenAddress);
        await expect(tx4).to.be.reverted;
    });
  });
});*/
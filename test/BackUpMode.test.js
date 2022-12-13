const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");

describe("BackupMode", () => {
  let deployer;
  let otherUser;
  
  let testTGEN;
  let testTGENAddress;
  let TestTokenFactory;

  let ubeswapAdapter;
  let ubeswapAdapterAddress;
  let UbeswapAdapterFactory;

  let backupMode;
  let backupModeAddress;
  let BackupModeFactory;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    TestTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    UbeswapAdapterFactory = await ethers.getContractFactory('TestUbeswapAdapter');
    BackupModeFactory = await ethers.getContractFactory('BackupMode');

    testTGEN = await TestTokenFactory.deploy("Test token", "TGEN");
    await testTGEN.deployed();
    testTGENAddress = testTGEN.address;

    ubeswapAdapter = await UbeswapAdapterFactory.deploy();
    await ubeswapAdapter.deployed();
    ubeswapAdapterAddress = ubeswapAdapter.address;
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    backupMode = await BackupModeFactory.deploy(ubeswapAdapterAddress, testTGENAddress, ubeswapAdapterAddress, otherUser.address);
    await backupMode.deployed();
    backupModeAddress = backupMode.address;

    let tx = await testTGEN.transfer(backupModeAddress, parseEther("1000000"));
    await tx.wait();
  });
  
  describe("#turnOnBackupMode", () => {
    it("onlyOwner", async () => {
        let tx = backupMode.connect(otherUser).turnOnBackupMode(parseEther("2000000"));
        await expect(tx).to.be.reverted;

        let balance = await testTGEN.balanceOf(backupModeAddress);
        expect(balance).to.equal(parseEther("1000000"));
    });

    it("meets requirements", async () => {
        let tx = await backupMode.turnOnBackupMode(parseEther("1000000"));
        await tx.wait();

        let balance1 = await testTGEN.balanceOf(backupModeAddress);
        expect(balance1).to.equal(0);

        let balance2 = await testTGEN.balanceOf(ubeswapAdapterAddress);
        expect(balance2).to.equal(parseEther("500000"));

        let balance3 = await testTGEN.balanceOf(otherUser.address);
        expect(balance3).to.equal(parseEther("500000"));
    });

    it("already turned on backup mode", async () => {
        let tx = await backupMode.turnOnBackupMode(parseEther("1000000"));
        await tx.wait();

        let tx2 = backupMode.turnOnBackupMode(parseEther("2000000"));
        await expect(tx2).to.be.reverted;
    });
  });
});
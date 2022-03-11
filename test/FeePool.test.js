const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");
/*
describe("FeePool", () => {
  let deployer;
  let otherUser;
  
  let testToken;
  let testTokenAddress;
  let TestTokenFactory;

  let feePool;
  let feePoolAddress;
  let FeePoolFactory;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    TestTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    FeePoolFactory = await ethers.getContractFactory('FeePool');

    testToken = await TestTokenFactory.deploy("Test token", "TEST");
    await testToken.deployed();
    testTokenAddress = testToken.address;
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    feePool = await FeePoolFactory.deploy(testTokenAddress);
    await feePool.deployed();
    feePoolAddress = feePool.address;

    let tx = await testToken.transfer(otherUser.address, parseEther("10"));
    await tx.wait();
  });
  
  describe("#deposit", () => {
    it("deposit without allowance", async () => {
        let tx = feePool.deposit(otherUser.address, parseEther("100"));
        await expect(tx).to.be.reverted;

        let availableFees = await feePool.availableFees(otherUser.address);
        expect(availableFees).to.equal(0);
    });

    it("deposit with allowance", async () => {
        let initialBalance = await testToken.balanceOf(otherUser.address);

        let tx = await testToken.connect(otherUser).approve(feePoolAddress, parseEther("10"));
        await tx.wait();

        let tx2 = await feePool.connect(otherUser).deposit(otherUser.address, parseEther("10"));
        await tx2.wait();

        let availableFees = await feePool.availableFees(otherUser.address);
        expect(availableFees).to.equal(parseEther("10"));

        let newBalance = await testToken.balanceOf(otherUser.address);
        let expectedBalance = BigInt(initialBalance) - BigInt(1e19);
        expect(newBalance.toString()).to.equal(expectedBalance.toString());
    });
  });

  describe("#withdraw", () => {
    it("withdraw with no balance", async () => {
        let initialBalance = await testToken.balanceOf(deployer.address);

        let tx = await feePool.withdraw();
        await tx.wait();

        let newBalance = await testToken.balanceOf(deployer.address);
        expect(newBalance).to.equal(initialBalance);
    });

    it("withdraw with balance", async () => {
        let initialBalance = await testToken.balanceOf(otherUser.address);

        let tx = await testToken.connect(otherUser).approve(feePoolAddress, parseEther("10"));
        await tx.wait();

        let tx2 = await feePool.connect(otherUser).deposit(otherUser.address, parseEther("10"));
        await tx2.wait();

        let tx3 = await feePool.connect(otherUser).withdraw();
        await tx3.wait();

        let availableFees = await feePool.availableFees(otherUser.address);
        expect(availableFees).to.equal(0);

        let newBalance = await testToken.balanceOf(otherUser.address);
        expect(newBalance).to.equal(initialBalance);
    });
  });
});*/
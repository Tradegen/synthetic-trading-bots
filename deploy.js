const { ethers } = require("hardhat");
const hre = require('hardhat');
require('hardhat-gas-report')(hre);

const { parseEther } = require("@ethersproject/units");

const TGEN_ADDRESS_TESTNET = "0xa9e37D0DC17C8B8Ed457Ab7cCC40b5785d4d11C0";
const TGEN_ADDRESS_MAINNET = "";

const XTGEN_ADDRESS_TESTNET = "0x4a03DBf1A734BfE935347cccd3CC57f770c59C28";
const XTGEN_ADDRESS_MAINNET = "";

const MCUSD_ADDRESS_TESTNET = "0x71DB38719f9113A36e14F409bAD4F07B58b4730b";
const MCUSD_ADDRESS_MAINNET = "";

const UBESWAP_ADAPTER_ADDRESS_TESTNET = "0x2bfBd6A235F948C19db4c7046668aaa56069ea18";
const UBESWAP_ADAPTER_ADDRESS_MAINNET = "";

const ROUTER_ADDRESS_TESTNET = "0xd5B704bb3ED3D057D8d04034a7c57412985Bf2Ea";
const ROUTER_ADDRESS_MAINNET = "";

const BACKUP_ESCROW_ADDRESS_TESTNET = "0xE8461e80B6745A1B19916cEB769c6955FFB93Bfc";
const BACKUP_ESCROW_ADDRESS_MAINNET = "";

const BACKUP_MODE_ADDRESS_TESTNET = "0x69B3F4e7FeDFE6F2884B63b8Ce894b8D07EaA0EB";
const BACKUP_MODE_ADDRESS_MAINNET = "";

const BOT_TOKEN_FACTORY_ADDRESS_TESTNET = "0x27b2C7A46b63A060fd6e6d6Cc6712Cca3BdA2B9A";
const BOT_TOKEN_FACTORY_ADDRESS_MAINNET = "";

async function deployBackupEscrow() {
  const signers = await ethers.getSigners();
  deployer = signers[0];
  
  let BackupEscrowFactory = await ethers.getContractFactory('BackupEscrow');
  backupEscrow = await BackupEscrowFactory.deploy(TGEN_ADDRESS_TESTNET);
  await backupEscrow.deployed();
  console.log("BackupEscrow: " + backupEscrow.address);
}

async function deployBackupMode() {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    
    let BackupModeFactory = await ethers.getContractFactory('BackupMode');
    backupMode = await BackupModeFactory.deploy(UBESWAP_ADAPTER_ADDRESS_TESTNET, TGEN_ADDRESS_TESTNET, BACKUP_ESCROW_ADDRESS_TESTNET, XTGEN_ADDRESS_TESTNET);
    await backupMode.deployed();
    console.log("BackupMode: " + backupMode.address);
  }

async function deployBotTokenFactory() {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    
    let BotTokenFactoryFactory = await ethers.getContractFactory('SyntheticBotTokenFactory');
    factory = await BotTokenFactoryFactory.deploy(BACKUP_ESCROW_ADDRESS_TESTNET, MCUSD_ADDRESS_TESTNET, TGEN_ADDRESS_TESTNET, ROUTER_ADDRESS_TESTNET, XTGEN_ADDRESS_TESTNET, BACKUP_MODE_ADDRESS_TESTNET);
    await factory.deployed();
    console.log("SyntheticBotTokenFactory: " + factory.address);
  }

async function initializeContracts() {
  const signers = await ethers.getSigners();
  deployer = signers[0];
  
  let BackupEscrowFactory = await ethers.getContractFactory('BackupEscrow');
  let escrow = BackupEscrowFactory.attach(BACKUP_ESCROW_ADDRESS_TESTNET);
  
  let tx = await escrow.initializeContracts(BOT_TOKEN_FACTORY_ADDRESS_TESTNET, BACKUP_MODE_ADDRESS_TESTNET)
  await tx.wait();

  let factory = await escrow.factory();
  console.log(factory);
}

async function deployMarketplace() {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    
    let MarketplaceFactory = await ethers.getContractFactory('Marketplace');
    marketplace = await MarketplaceFactory.deploy(MCUSD_ADDRESS_TESTNET, ROUTER_ADDRESS_TESTNET, TGEN_ADDRESS_TESTNET, XTGEN_ADDRESS_TESTNET);
    await marketplace.deployed();
    console.log("Marketplace: " + marketplace.address);
  }

/*
deployBackupEscrow()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

deployBackupMode()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  
deployBotTokenFactory()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  
initializeContracts()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })*/
  
deployMarketplace()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
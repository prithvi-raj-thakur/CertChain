// scripts/deploy.js
// ─────────────────────────────────────────────────────────────────────────────
// Hardhat deployment script for CertificateRegistry contract.
// Run: npx hardhat run scripts/deploy.js --network ganache
//       npx hardhat run scripts/deploy.js --network hardhat
// ─────────────────────────────────────────────────────────────────────────────

const { ethers } = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying CertificateRegistry contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deployer address : ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance : ${ethers.formatEther(balance)} ETH\n`);

  // Deploy the contract
  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const contract = await CertificateRegistry.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ CertificateRegistry deployed to: ${address}`);
  console.log("\n📝 Next Steps:");
  console.log(`   1. Copy the address above`);
  console.log(`   2. Paste it as CONTRACT_ADDRESS in your .env file`);
  console.log(`   3. Also update the server/.env\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying NeuronNetMarketplace...");

  const NeuronNetMarketplace = await hre.ethers.getContractFactory("NeuronNetMarketplace");
  const marketplace = await NeuronNetMarketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  
  console.log("\n✅ CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log("📍 Address:", address);
  console.log("\n📋 SAVE THIS ADDRESS - YOU'LL NEED IT!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

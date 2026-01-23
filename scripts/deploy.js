const hre = require("hardhat");

async function main() {
  console.log("Deploying GamingArenaToken...");

  const GamingArenaToken = await hre.ethers.getContractFactory("GamingArenaToken");
  const gamingArena = await GamingArenaToken.deploy();

  await gamingArena.waitForDeployment();

  const address = await gamingArena.getAddress();

  console.log("GamingArenaToken deployed to:", address);
  console.log("Private key used matches address:", (await hre.ethers.getSigners())[0].address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const { ethers } = require("ethers");
const solc = require("solc");
const fs = require("fs");
const path = require("path");

const PRIVATE_KEY = "3f8061a5857a392ac24993936b0109b0c2b1952ed1428d50aa0e9a23a167959e";
const RPC_URL = "https://rpc-amoy.polygon.technology/";

async function main() {
  console.log("Reading contract source...");
  
  const contractPath = path.join(__dirname, "..", "src", "contracts", "GamingArena.sol");
  const source = fs.readFileSync(contractPath, "utf8");

  console.log("Compiling contract...");

  const input = {
    language: "Solidity",
    sources: {
      "GamingArena.sol": { content: source }
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"]
        }
      }
    }
  };

  function findImports(importPath) {
    try {
      let fullPath;
      if (importPath.startsWith("@openzeppelin")) {
        fullPath = path.join(__dirname, "..", "node_modules", importPath);
      } else {
        fullPath = path.join(__dirname, "..", "src", "contracts", importPath);
      }
      return { contents: fs.readFileSync(fullPath, "utf8") };
    } catch (e) {
      return { error: "File not found: " + importPath };
    }
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    for (const error of output.errors) {
      console.log(error.formattedMessage);
      if (error.severity === "error") {
        process.exit(1);
      }
    }
  }

  const contract = output.contracts["GamingArena.sol"]["GamingArenaToken"];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  console.log("Contract compiled successfully!");

  const artifactsDir = path.join(__dirname, "..", "src", "artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(artifactsDir, "GamingArenaToken.json"),
    JSON.stringify({ abi, bytecode }, null, 2)
  );
  console.log("ABI saved to src/artifacts/GamingArenaToken.json");

  console.log("Deploying to Polygon Amoy...");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deploying from address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  if (balance === 0n) {
    console.log("WARNING: Account has 0 MATIC. Get testnet MATIC from https://faucet.polygon.technology/");
    process.exit(1);
  }

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  console.log("Sending deployment transaction...");
  const contract_deployed = await factory.deploy();

  console.log("Waiting for deployment...");
  await contract_deployed.waitForDeployment();

  const address = await contract_deployed.getAddress();
  console.log("\n=================================");
  console.log("Contract deployed successfully!");
  console.log("Contract address:", address);
  console.log("=================================\n");

  const contractTsPath = path.join(__dirname, "..", "src", "lib", "contract.ts");
  let contractTs = fs.readFileSync(contractTsPath, "utf8");
  contractTs = contractTs.replace(
    /export const GAMING_ARENA_ADDRESS = "[^"]*"/,
    `export const GAMING_ARENA_ADDRESS = "${address}"`
  );
  fs.writeFileSync(contractTsPath, contractTs);
  console.log("Updated src/lib/contract.ts with new address");

  console.log("\nDone! Your Gaming Arena is now live on Polygon Amoy Testnet!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
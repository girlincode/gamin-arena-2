console.log("Starting deployment script...");

try {
  const { ethers } = require("ethers");
  const solc = require("solc");
  const fs = require("fs");
  const path = require("path");

  const PRIVATE_KEY = "3f8061a5857a392ac24993936b0109b0c2b1952ed1428d50aa0e9a23a167959e";
  const RPC_URL = "https://rpc-amoy.polygon.technology/";

  console.log("Modules loaded successfully");
  console.log("Reading contract...");

  const contractPath = path.join(__dirname, "..", "src", "contracts", "GamingArena.sol");
  const source = fs.readFileSync(contractPath, "utf8");
  console.log("Contract source read, length:", source.length);

  console.log("Setting up compiler input...");
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
    console.log("Importing:", importPath);
    try {
      let fullPath;
      if (importPath.startsWith("@openzeppelin")) {
        fullPath = path.join(__dirname, "..", "node_modules", importPath);
      } else {
        fullPath = path.join(__dirname, "..", "src", "contracts", importPath);
      }
      return { contents: fs.readFileSync(fullPath, "utf8") };
    } catch (e) {
      console.error("Import error:", e.message);
      return { error: "File not found: " + importPath };
    }
  }

  console.log("Compiling...");
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  
  if (output.errors) {
    console.log("Compilation errors/warnings:");
    for (const error of output.errors) {
      console.log(error.severity + ":", error.message);
      if (error.severity === "error") {
        process.exit(1);
      }
    }
  }

  if (!output.contracts || !output.contracts["GamingArena.sol"]) {
    console.log("Available contracts:", Object.keys(output.contracts || {}));
    throw new Error("Contract not found in output");
  }

  const contract = output.contracts["GamingArena.sol"]["GamingArenaToken"];
  if (!contract) {
    console.log("Available in GamingArena.sol:", Object.keys(output.contracts["GamingArena.sol"]));
    throw new Error("GamingArenaToken not found");
  }

  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;
  console.log("Compiled! Bytecode length:", bytecode.length);

  // Save artifacts
  const artifactsDir = path.join(__dirname, "..", "src", "artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(artifactsDir, "GamingArenaToken.json"),
    JSON.stringify({ abi, bytecode }, null, 2)
  );
  console.log("Artifacts saved");

  // Deploy
  async function deploy() {
    console.log("Connecting to Polygon Amoy...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log("Deployer address:", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "MATIC");

    if (balance === 0n) {
      console.log("ERROR: No MATIC. Get from https://faucet.polygon.technology/");
      process.exit(1);
    }

    console.log("Creating contract factory...");
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    console.log("Deploying...");
    const deployed = await factory.deploy();
    console.log("Waiting for confirmation...");
    await deployed.waitForDeployment();

    const address = await deployed.getAddress();
    console.log("=".repeat(50));
    console.log("DEPLOYED TO:", address);
    console.log("=".repeat(50));

    // Update contract.ts
    const contractTsPath = path.join(__dirname, "..", "src", "lib", "contract.ts");
    let contractTs = fs.readFileSync(contractTsPath, "utf8");
    contractTs = contractTs.replace(
      /export const GAMING_ARENA_ADDRESS = "[^"]*"/,
      'export const GAMING_ARENA_ADDRESS = "' + address + '"'
    );
    fs.writeFileSync(contractTsPath, contractTs);
    console.log("Updated contract.ts");
  }

  deploy().then(() => {
    console.log("Done!");
    process.exit(0);
  }).catch(err => {
    console.error("Deploy error:", err);
    process.exit(1);
  });

} catch (err) {
  console.error("Script error:", err);
  process.exit(1);
}

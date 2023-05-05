#! ./node_modules/.bin/ts-node

import hre from "hardhat";
import "@nomicfoundation/hardhat-toolbox";

const CONTRACT_ADDRESS: string =
  process.env.CONTRACT_ADDRESS || "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";

(async (): Promise<void> => {
  // initialize CustomVerifierFactory contract
  console.log("\nInitializing CustomVerifierFactory contract...");
  const customVerifierFactory = await hre.ethers.getContractAt(
    "CustomVerifierFactory",
    CONTRACT_ADDRESS
  );
  console.log("✅");

  // fetch models from CustomVerifier contract
  console.log("\nFetching models...");
  const models = await customVerifierFactory.getModels(0, 10);
  console.log(`Models: ${models}\n`);
})();

#! ./node_modules/.bin/ts-node

import hre from "hardhat";
import "@nomicfoundation/hardhat-toolbox";

const CONTRACT_ADDRESS: string =
  process.env.CONTRACT_ADDRESS || "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

(async (): Promise<void> => {
  // initialize CustomVerifier contract
  console.log("\nInitializing CustomVerifier contract...");
  const customVerifier = await hre.ethers.getContractAt(
    "CustomVerifier",
    CONTRACT_ADDRESS
  );
  console.log("✅");

  // fetch commitments of model from CustomVerifier contract
  console.log("\nFetching commitments of model...");
  const commitments = await customVerifier.getCommitmentsOfModel(0, 10);
  console.log(`Commitments: ${commitments}\n`);
})();

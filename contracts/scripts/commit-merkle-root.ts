#! ./node_modules/.bin/ts-node

import * as fs from 'fs';
import hre from 'hardhat';
import '@nomicfoundation/hardhat-toolbox';

import { CONTRACT_ADDRESS_CUSTOM_VERIFIER, DEMO_PATH } from './utils/constants';

const MERKLE_TREE: string = process.env.MERKLE_TREE || `${DEMO_PATH}-tree`;

(async (): Promise<void> => {
  // initialize CustomVerifier contract
  console.log('\nInitializing CustomVerifier contract...');
  const customVerifier = await hre.ethers.getContractAt(
    'CustomVerifier',
    CONTRACT_ADDRESS_CUSTOM_VERIFIER,
  );
  console.log('✅');

  // commit Merkle root
  console.log('\nCommitting Merkle root...');
  const _ = await customVerifier.commit(
    JSON.parse(
      fs
        .readFileSync(`../provers/merkle-trees/${MERKLE_TREE}-root.json`)
        .toString(),
    ).merkleRoot,
  );
  console.log('✅');

  // save commitment details as a JSON file
  console.log("\nSaving commitment details as './outputs/commitment.json'...");
  const commitments = await customVerifier.getCommitmentsOfModel(0, 10);
  const commitment = await customVerifier.getCommitment(commitments[0]);
  fs.writeFileSync(
    `./outputs/commitment.json`,
    JSON.stringify({
      commitmentId: commitment.id,
      challenge: commitment.challenge,
    }),
  );
  console.log('✅\n');
})();

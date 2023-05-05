#! ./node_modules/.bin/ts-node

import * as fs from 'fs';

import hre from 'hardhat';
import '@nomicfoundation/hardhat-toolbox';

const CONTRACT_ADDRESS: string =
  process.env.CONTRACT_ADDRESS || '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
const MERKLE_TREE: string = process.env.MERKLE_TREE || 'demo-tree';

(async (): Promise<void> => {
  // initialize CustomVerifier contract
  console.log('\nInitializing CustomVerifier contract...');
  const customVerifier = await hre.ethers.getContractAt(
    'CustomVerifier',
    CONTRACT_ADDRESS,
  );
  console.log('✅');

  // commit Merkle root
  console.log('\nCommitting Merkle root...');
  await customVerifier.commit(
    JSON.parse(
      fs
        .readFileSync(`../provers/merkle-trees/${MERKLE_TREE}-root.json`)
        .toString(),
    ).merkleRoot,
  );
  console.log('✅\n');
})();

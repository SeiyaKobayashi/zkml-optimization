#! ./node_modules/.bin/ts-node

import hre from 'hardhat';
import '@nomicfoundation/hardhat-toolbox';

import { CONTRACT_ADDRESS_CUSTOM_VERIFIER } from './utils/constants';

const COMMITMENT_ID: string =
  process.env.COMMITMENT_ID ||
  '0x3a03299cb56ef0725386a0f7756e9e28e8e5b248d18efc1c9805b1860f0188d8';

(async (): Promise<void> => {
  // initialize CustomVerifier contract
  console.log('\nInitializing CustomVerifier contract...');
  const customVerifier = await hre.ethers.getContractAt(
    'CustomVerifier',
    CONTRACT_ADDRESS_CUSTOM_VERIFIER,
  );
  console.log('✅');

  // fetch commitment of the specified ID from CustomVerifier contract
  console.log('\nFetching commitment of the specified ID...');
  const commitment = await customVerifier.getCommitment(process.env.COMMITMENT_ID);
  console.log(`Commitment: ${commitment}\n`);
})();
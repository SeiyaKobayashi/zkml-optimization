#! ./node_modules/.bin/ts-node

import hre from 'hardhat';
import '@nomicfoundation/hardhat-toolbox';

import { CONTRACT_ADDRESS_CUSTOM_VERIFIER } from './utils/constants';

(async (): Promise<void> => {
  // initialize CustomVerifier contract
  console.log('\nInitializing CustomVerifier contract...');
  const customVerifier = await hre.ethers.getContractAt(
    'CustomVerifier',
    CONTRACT_ADDRESS_CUSTOM_VERIFIER,
  );
  console.log('✅');

  // fetch commitments of model from CustomVerifier contract
  console.log('\nFetching commitments of model...');
  const commitments = await customVerifier.getCommitmentsOfModel(0, 10);
  console.log(`Commitments: ${commitments}\n`);
})();

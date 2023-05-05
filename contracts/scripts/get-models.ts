#! ./node_modules/.bin/ts-node

import hre from 'hardhat';
import '@nomicfoundation/hardhat-toolbox';

import { CONTRACT_ADDRESS_CUSTOM_VERIFIER_FACTORY } from './utils/constants';

(async (): Promise<void> => {
  // initialize CustomVerifierFactory contract
  console.log('\nInitializing CustomVerifierFactory contract...');
  const customVerifierFactory = await hre.ethers.getContractAt(
    'CustomVerifierFactory',
    CONTRACT_ADDRESS_CUSTOM_VERIFIER_FACTORY,
  );
  console.log('✅');

  // fetch models from CustomVerifierFactory contract
  console.log('\nFetching models...');
  const models = await customVerifierFactory.getModels(0, 10);
  console.log(`Models: ${models}\n`);
})();

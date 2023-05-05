#! ./node_modules/.bin/ts-node

import hre from 'hardhat';
import '@nomicfoundation/hardhat-toolbox';

import { CONTRACT_ADDRESS_CUSTOM_VERIFIER_FACTORY } from './utils/constants';

const MODEL_CONTENT_ID: string =
  process.env.MODEL_CONTENT_ID ||
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const MODEL_NAME: string = process.env.MODEL_NAME || 'demo-model';
const MODEL_DESCRIPTION: string =
  process.env.MODEL_DESCRIPTION || 'Simple classification model of MNIST.';

(async (): Promise<void> => {
  // initialize CustomVerifierFactory contract
  console.log('\nInitializing CustomVerifierFactory contract...');
  const customVerifierFactory = await hre.ethers.getContractAt(
    'CustomVerifierFactory',
    CONTRACT_ADDRESS_CUSTOM_VERIFIER_FACTORY,
  );
  console.log('✅');

  // register model in CustomVerifier contract
  console.log('\nRegistering model...');
  await customVerifierFactory.createChildContract(
    MODEL_CONTENT_ID,
    MODEL_NAME,
    MODEL_DESCRIPTION,
  );
  console.log('✅\n');
})();

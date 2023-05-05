#! ./node_modules/.bin/ts-node

import hre from 'hardhat';
import { ContractFactory } from 'ethers';
import '@nomicfoundation/hardhat-toolbox';

const difficulty = 10;
let Verifier: ContractFactory;
let verifier: any; // eslint-disable-line @typescript-eslint/no-explicit-any
let CustomVerifier: ContractFactory;
let customVerifier: any; // eslint-disable-line @typescript-eslint/no-explicit-any
let VerifierFactory: ContractFactory;
let verifierFactory: any; // eslint-disable-line @typescript-eslint/no-explicit-any

async function main(): Promise<void> {
  Verifier = await hre.ethers.getContractFactory('Verifier');
  verifier = await Verifier.deploy();
  await verifier.deployed();

  console.log('Successfully deployed Verifier contract.');

  CustomVerifier = await hre.ethers.getContractFactory('CustomVerifier');
  customVerifier = await CustomVerifier.deploy(verifier.address, difficulty);
  await customVerifier.deployed();

  console.log('Successfully deployed CustomVerifier contract.');

  VerifierFactory = await hre.ethers.getContractFactory(
    'CustomVerifierFactory',
  );
  verifierFactory = await VerifierFactory.deploy(customVerifier.address);
  await verifierFactory.deployed();

  console.log('Successfully deployed CustomVerifierFactory contract.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

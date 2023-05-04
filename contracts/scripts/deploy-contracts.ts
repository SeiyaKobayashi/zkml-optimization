#! ./node_modules/.bin/ts-node

import hre from 'hardhat';
import { ContractFactory } from 'ethers';
import "@nomicfoundation/hardhat-toolbox";

const difficulty = 12;
let Verifier: ContractFactory;
let verifier: any;
let CustomVerifier: ContractFactory;
let customVerifier: any;
let VerifierFactory: ContractFactory;
let verifierFactory: any;

async function main() {
  Verifier = await hre.ethers.getContractFactory('Verifier');
  verifier = await Verifier.deploy();
  await verifier.deployed();

  console.log('Successfully deployed Verifier contract.');

  CustomVerifier = await hre.ethers.getContractFactory('CustomVerifier');
  customVerifier = await CustomVerifier.deploy(verifier.address, difficulty);
  await customVerifier.deployed();

  console.log('Successfully deployed CustomVerifier contract.');

  VerifierFactory = await hre.ethers.getContractFactory('VerifierFactory');
  verifierFactory = await VerifierFactory.deploy(customVerifier.address);
  await verifierFactory.deployed();

  console.log('Successfully deployed VerifierFactory contract.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

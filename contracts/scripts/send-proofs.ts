#! ./node_modules/.bin/ts-node

import * as fs from 'fs';
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

  // load Merkle proofs
  console.log('\nLoading Merkle proofs...');
  const merkleProofs = JSON.parse(
    fs
      .readFileSync('../provers/merkle-trees/demo-merkle-proofs.json')
      .toString(),
  );
  console.log('✅');

  // load ZKPs
  console.log('\nLoading ZKPs...');
  const parsedZkps: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const zkps = JSON.parse(
    fs.readFileSync('../circuits/parameterized-zkps.json').toString(),
  ).params;
  console.log('✅');

  // parse ZKPs
  console.log('\nParsing ZKPs...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zkps.map((zkp: any) => {
    zkp = zkp
      .replaceAll('[', '')
      .replaceAll(']', '')
      .replaceAll('"', '')
      .replaceAll(' ', '')
      .split(',');
    parsedZkps.push({
      a: [zkp[0], zkp[1]],
      b: [
        [zkp[2], zkp[3]],
        [zkp[4], zkp[5]],
      ],
      c: [zkp[6], zkp[7]],
      input: [zkp[8]],
    });
  });
  console.log('✅');

  // send Merkle proofs & ZKPs to CustomVerifier contract
  console.log('\nSending Merkle proofs & ZKPs...');
  const commitmentId = JSON.parse(
    fs.readFileSync('./outputs/commitment.json').toString(),
  ).commitmentId;
  const proofsVerified = await customVerifier.verify(
    commitmentId,
    merkleProofs.proof,
    merkleProofs.proofFlags,
    merkleProofs.leaves,
    parsedZkps,
  );
  console.log('✅');

  console.log(
    `Verification Result: ${
      proofsVerified
        ? 'ZKPs successfully verified!'
        : 'ZKPs failed to be verified...'
    }\n`,
  );
})();

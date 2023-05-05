#! ./node_modules/.bin/ts-node

import * as fs from 'fs';

import hre from 'hardhat';
import '@nomicfoundation/hardhat-toolbox';

const CONTRACT_ADDRESS: string =
  process.env.CONTRACT_ADDRESS || '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
const COMMITMENT_ID: string =
  process.env.COMMITMENT_ID ||
  '0x3a03299cb56ef0725386a0f7756e9e28e8e5b248d18efc1c9805b1860f0188d8';

(async (): Promise<void> => {
  // initialize CustomVerifier contract
  console.log('\nInitializing CustomVerifier contract...');
  const customVerifier = await hre.ethers.getContractAt(
    'CustomVerifier',
    CONTRACT_ADDRESS,
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

  console.log(merkleProofs.leaves);

  // send Merkle proofs & ZKPs to CustomVerifier contract
  console.log('\nSending Merkle proofs & ZKPs...');
  const proofsVerified = await customVerifier.verify(
    COMMITMENT_ID,
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

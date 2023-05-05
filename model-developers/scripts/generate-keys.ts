#! ./node_modules/.bin/ts-node

import 'zx/globals';

import { DEMO_PATH } from './utils/constants';

const R1CS: string = argv.R1CS || `${DEMO_PATH}-circuit`;
const PTAU: string = argv.PTAU || "powersOfTau28_hez_final_17";
const ZKEY: string = argv.ZKEY || `${DEMO_PATH}_0000`;
const ZKEY_FINAL: string = argv.ZKEY_FINAL || `${DEMO_PATH}_0001`;

(async (): Promise<void> => {
  echo('\nGenerating zkeys...');

  cd('../circuits');

  // generate proving & verification keys
  await $`yarn snarkjs groth16 setup ${R1CS}.r1cs ${PTAU}.ptau ${ZKEY}.zkey`;

  // contribute to the phase 2 of the ceremony
  await $`yarn snarkjs zkey contribute ${ZKEY}.zkey ${ZKEY_FINAL}.zkey --name="Contribution" -v`;
  echo('✅');

  // generate a verifier contract
  echo(`\nGenerating a verifier contract...`);
  await $`snarkjs zkey export solidityverifier ../circuits/${ZKEY_FINAL}.zkey ../contracts/circom/verifier.sol`;
  echo('✅\n');
})();

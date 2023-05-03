#! ./node_modules/.bin/ts-node

import 'zx/globals';

const R1CS_FILENAME: string = argv.R1CS_FILENAME || "demo-circuit";
const PTAU_FILENAME: string = argv.PTAU_FILENAME || "powersOfTau28_hez_final_23";
const ZKEY_FILENAME: string = argv.ZKEY_FILENAME || "demo_0000";
const ZKEY_FINAL_FILENAME: string = argv.ZKEY_FINAL_FILENAME || "demo_0001";

(async () => {
  console.log('\nGenerating keys...\n');

  // generate proving & verification keys
  await $`yarn snarkjs groth16 setup ${R1CS_FILENAME}.r1cs ${PTAU_FILENAME}.ptau ${ZKEY_FILENAME}.zkey`;

  // contribute to the phase 2 of the ceremony
  await $`yarn snarkjs zkey contribute ${ZKEY_FILENAME}.zkey ${ZKEY_FINAL_FILENAME}.zkey --name="1st Contribution" -v`;
})();

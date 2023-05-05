#! ./node_modules/.bin/ts-node

import 'zx/globals';

const R1CS: string = argv.R1CS || "demo-circuit";
const PTAU: string = argv.PTAU || "powersOfTau28_hez_final_17";
const ZKEY: string = argv.ZKEY || "demo_0000";
const ZKEY_FINAL: string = argv.ZKEY_FINAL || "demo_0001";

(async (): Promise<void> => {
  echo('\nGenerating z-keys...');

  // generate proving & verification keys
  await $`yarn snarkjs groth16 setup ${R1CS}.r1cs ${PTAU}.ptau ${ZKEY}.zkey`;

  // contribute to the phase 2 of the ceremony
  await $`yarn snarkjs zkey contribute ${ZKEY}.zkey ${ZKEY_FINAL}.zkey --name="Contribution" -v`;

  echo('✅\n');
})();

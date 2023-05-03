#! ./node_modules/.bin/ts-node

import 'zx/globals';

const EXECUTABLE_NAME: string = argv.EXECUTABLE_NAME || "demo-circuit";
const INPUT_FILE: string = argv.INPUT_FILE || "demo";

(async () => {
  // generate witnesses
  console.log('\nGenerating witnesses...');
  await $`cd ../circuits/${EXECUTABLE_NAME}_js && node generate_witness.js ${EXECUTABLE_NAME}.wasm ../../provers/${INPUT_FILE}-input.json witness.wtns`;

  // generate ZKPs
  console.log('\nGenerating ZKPs...');
  await $`cd ../circuits && snarkjs groth16 prove demo_0001.zkey ./${EXECUTABLE_NAME}_js/witness.wtns proof.json public.json`;
})();

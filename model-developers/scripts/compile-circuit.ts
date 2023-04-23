#! ./node_modules/.bin/ts-node

import 'zx/globals';

const CIRCUIT_NAME: string = argv.CIRCUIT_NAME || "demo-circuit";

(async () => {
  console.log('\nCompiling circuit...\n');

  // compile circuit using circom
  await $`circom ../circuits/${CIRCUIT_NAME}.circom --r1cs --c --sym`;
})();

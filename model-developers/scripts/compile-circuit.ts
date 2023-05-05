#! ./node_modules/.bin/ts-node

import 'zx/globals';

const CIRCUIT: string = argv.CIRCUIT || "demo-circuit";

(async (): Promise<void> => {
  echo('\nCompiling circuit...');

  // compile circuit using circom
  await $`circom ../circuits/${CIRCUIT}.circom --r1cs --sym --wasm`;

  echo('✅\n');
})();

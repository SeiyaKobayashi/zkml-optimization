#! ./node_modules/.bin/ts-node

import 'zx/globals';

import { DEMO_PATH } from './utils/constants';

const CIRCUIT: string = argv.CIRCUIT || `${DEMO_PATH}-circuit`;

(async (): Promise<void> => {
  echo('\nCompiling circuit...');

  cd('../circuits');

  // compile circuit using circom
  await $`circom ../circuits/${CIRCUIT}.circom --r1cs --sym --wasm`;

  echo('✅\n');
})();

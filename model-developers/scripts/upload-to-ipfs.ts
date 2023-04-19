#! ./node_modules/.bin/ts-node

import 'zx/globals';

const CIRCUIT_NAME: string = argv.CIRCUIT_NAME || "demo-circuit";

(async () => {
  console.log('\nUploading files to IPFS...\n');

  // add bundled files to ipfs
  await $`ipfs add -r ${CIRCUIT_NAME}`;
})();

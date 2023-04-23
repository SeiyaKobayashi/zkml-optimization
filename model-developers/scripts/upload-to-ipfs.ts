#! ./node_modules/.bin/ts-node

import 'zx/globals';

const CIRCUIT_NAME: string = argv.CIRCUIT_NAME || "demo-circuit";
const MODEL_NAME: string = argv.MODEL_NAME || "demo";
const ZKEY_NAME: string = argv.ZKEY_NAME || "demo_0001";

(async () => {
  console.log('\nUploading files to IPFS...\n');

  // bundle files
  await $`tar cf ${CIRCUIT_NAME}_cpp.tar.gz ${CIRCUIT_NAME}_cpp`;

  // copy files into a directory
  await $`mkdir ${CIRCUIT_NAME} && cp ../models/${MODEL_NAME}.h5 ${CIRCUIT_NAME}_cpp.tar.gz ${ZKEY_NAME}.zkey ${CIRCUIT_NAME}`;

  // add bundled files to ipfs
  await $`ipfs add -r ${CIRCUIT_NAME}`;
})();

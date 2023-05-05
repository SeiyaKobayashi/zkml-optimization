#! ./node_modules/.bin/ts-node

import 'zx/globals';

const CIRCUIT: string = argv.CIRCUIT || "demo-circuit";
const MODEL: string = argv.MODEL || "demo";
const ZKEY_FINAL: string = argv.ZKEY_FINAL || "demo_0001";

(async (): Promise<void> => {
  echo('\nUploading files to IPFS...');

  // bundle files
  await $`tar cf ${CIRCUIT}_cpp.tar.gz ${CIRCUIT}_cpp`;

  // copy files into a directory
  await $`mkdir ${CIRCUIT} && cp ../models/${MODEL}.h5 ${CIRCUIT}_cpp.tar.gz ${ZKEY_FINAL}.zkey ${CIRCUIT}`;

  // add bundled files to ipfs
  await $`ipfs add -r ${CIRCUIT}`;

  echo('✅\n');
})();

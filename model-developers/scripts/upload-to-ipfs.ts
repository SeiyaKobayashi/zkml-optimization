#! ./node_modules/.bin/ts-node

import 'zx/globals';

import { DEMO_PATH } from './utils/constants';

const CIRCUIT: string = argv.CIRCUIT || `${DEMO_PATH}-circuit`;
const MODEL: string = argv.MODEL || DEMO_PATH;
const ZKEY_FINAL: string = argv.ZKEY_FINAL || `${DEMO_PATH}_0001`;

(async (): Promise<void> => {
  echo('\nUploading files to IPFS...');

  cd('../circuits');

  // bundle files
  await $`tar cf ${CIRCUIT}_cpp.tar.gz ${CIRCUIT}_cpp`;

  // copy files into a directory
  await $`mkdir ${CIRCUIT} && cp ../models/${MODEL}.h5 ${CIRCUIT}_cpp.tar.gz ${ZKEY_FINAL}.zkey ${CIRCUIT}`;

  // add bundled files to ipfs
  await $`ipfs add -r ${CIRCUIT}`;

  echo('✅\n');
})();

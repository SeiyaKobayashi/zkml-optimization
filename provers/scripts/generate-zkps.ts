#! ./node_modules/.bin/ts-node

import 'zx/globals';

import { DEMO_PATH } from "./utils/constants";

const CIRCUIT_EXECUTABLE: string = argv.CIRCUIT_EXECUTABLE || `${DEMO_PATH}-circuit`;
const ZKEY_FINAL: string = argv.ZKEY_FINAL || `${DEMO_PATH}_0001`;

(async (): Promise<void> => {
  fs.readdir('./circuit-inputs/', async (_, filenames) => {
    for (let i = 0; i < filenames.length - 1; i++) {
      if (filenames[i] !== '.gitkeep') {
        // compute witness
        echo(`\nComputing witness for '../../provers/circuit-inputs/${filenames[i]}' & saving it as './witness-${i}.wtns'...`);
        cd(`../circuits/${CIRCUIT_EXECUTABLE}_js`);
        await $`node generate_witness.js ${CIRCUIT_EXECUTABLE}.wasm ../../provers/circuit-inputs/${filenames[i]} ./witness-${i}.wtns`;
        echo('✅');

        // generate ZKP
        echo(`\nGenerating ZKPs for './witness-${i}.wtns' & saving it as './proof-${i}.json, ./public-${i}.json'...`);
        cd('..');
        await $`snarkjs groth16 prove ${ZKEY_FINAL}.zkey ./${CIRCUIT_EXECUTABLE}_js/witness-${i}.wtns ./proof-${i}.json ./public-${i}.json`;
        echo('✅\n');
      }
    }
  });
})();

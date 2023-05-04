#! ./node_modules/.bin/ts-node

import 'zx/globals';
import * as tf from '@tensorflow/tfjs-node';

import merkleTreeDriver from "../utils/merkle-tree";
import circuitJson from '../../circuits/demo-circuit.json' assert { type: "json" }

const MERKLE_TREE: string = argv.MERKLE_TREE || "demo-tree";
const INPUT_FILE: string = argv.INPUT_FILE || "demo";
const DIFFICULTY: number = 10;

(async () => {
  const mtDriver = new merkleTreeDriver(DIFFICULTY);

  // load Merkle tree from a file
  console.log('\nLoading Merkle tree...');
  const tree = mtDriver.loadMerkleTree(`${MERKLE_TREE}.json`);

  // search Merkle tree given the random challenge
  console.log('\nSearching Merkle tree...');
  const {values, indices} = mtDriver.searchMerkleTree(tree, '0x3b1', DIFFICULTY);

  // save input data of circuit as .json file
  console.log('\nSaving input data as a JSON file...');
  let count: number = 0;
  values.map((value) => {
    const valueJson: number[] = Object.values(JSON.parse(value[0]));
    fs.writeFileSync(
      `./circuit-inputs/${INPUT_FILE}-input-${count}.json`,
      JSON.stringify({...circuitJson, ...{'in': tf.tensor3d(valueJson, [28, 28, 1]).mul(10 ** 17).arraySync()}})
    );
    count++;
  });

  // generate Merkle proofs of the specified leaves
  console.log('\nGenerating Merkle proofs...\n');
  const { proof, proofFlags, leaves } = mtDriver.generateMerkleProofs(tree, indices);
  fs.writeFileSync(
    `./merkle-proofs/${INPUT_FILE}-merkle-proofs.json`,
    JSON.stringify({
      'proof': proof,
      'proofFlags': proofFlags,
      'leaves': leaves,
    })
  );
})();

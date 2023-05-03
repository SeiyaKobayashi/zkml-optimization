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
  const valuesJson: number[] = Object.values(JSON.parse(values[0][0]));
  fs.writeFileSync(
    `${INPUT_FILE}-input.json`,
    JSON.stringify({...circuitJson, ...{'in': tf.tensor3d(valuesJson, [28, 28, 1]).mul(10 ** 17).arraySync()}})
  );

  // generate Merkle proofs of the specified leaves
  console.log('\nGenerating Merkle proofs...\n');
  const { proof, proofFlags, leaves } = mtDriver.generateMerkleProofs(tree, indices);
})();

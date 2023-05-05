#! ./node_modules/.bin/ts-node

import 'zx/globals';
import * as tf from '@tensorflow/tfjs-node';

import merkleTreeDriver from "./utils/merkle-tree";
import { DEMO_PATH, DIFFICULTY, MNIST_SHAPE, MNIST_DENORMALIZATION_CONSTANT } from "./utils/constants";
import circuitJson from '../../circuits/demo-circuit.json' assert { type: "json" }

const MERKLE_TREE: string = argv.MERKLE_TREE || `${DEMO_PATH}-tree`;
const CIRCUIT_INPUT: string = argv.CIRCUIT_INPUT || DEMO_PATH;

(async (): Promise<void> => {
  const mtDriver = new merkleTreeDriver(DIFFICULTY);

  // load Merkle tree from a file
  echo('\nLoading Merkle tree...');
  const tree = mtDriver.loadMerkleTree(`./merkle-trees/${MERKLE_TREE}.json`);
  echo('✅');

  // search Merkle tree given the random challenge of difficulty
  echo('\nSearching Merkle tree...');
  const challenge = JSON.parse(
    fs.readFileSync('../contracts/outputs/commitment.json').toString(),
  ).challenge;
  const {values, indices} = mtDriver.searchMerkleTree(tree, challenge, DIFFICULTY);
  echo('✅');

  // save input (private) data of circuit as a JSON file
  echo(`\nSaving input data as './circuit-inputs/${CIRCUIT_INPUT}-input-{n}.json'...`);
  let count: number = 0;
  values.map((value) => {
    const valueJson: number[] = Object.values(JSON.parse(value[0]));
    fs.writeFileSync(
      `./circuit-inputs/${CIRCUIT_INPUT}-input-${count}.json`,
      JSON.stringify({...circuitJson, ...{'in': tf.tensor3d(valueJson, MNIST_SHAPE).mul(MNIST_DENORMALIZATION_CONSTANT).arraySync()}})
    );
    count++;
  });
  echo('✅');

  // generate Merkle proofs of the specified leaves
  echo(`\nGenerating Merkle proofs & saving them to './merkle-trees/${DEMO_PATH}-merkle-proofs.json'...\n`);
  const { proof, proofFlags, leaves } = mtDriver.generateMerkleProofs(tree, indices);
  const leafHashes = leaves.map((leaf) => tree.leafHash(leaf));
  fs.writeFileSync(
    `./merkle-trees/${DEMO_PATH}-merkle-proofs.json`,
    JSON.stringify({
      'proof': proof,
      'proofFlags': proofFlags,
      'leaves': leafHashes,
    })
  );
  echo('✅\n');
})();

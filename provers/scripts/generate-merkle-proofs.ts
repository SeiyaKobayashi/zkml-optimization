#! ./node_modules/.bin/ts-node

import 'zx/globals';
import merkleTreeDriver from "../utils/merkle-tree";

const MERKLE_TREE: string = argv.MERKLE_TREE || "demo-tree";
const DIFFICULTY: number = 10;

(async () => {
  const mtDriver = new merkleTreeDriver(DIFFICULTY);

  // load Merkle tree from a file
  console.log('\nLoading Merkle tree...');
  const tree = mtDriver.loadMerkleTree(`${MERKLE_TREE}.json`);

  // search Merkle tree given the random challenge
  console.log('\nSearching Merkle tree...');
  const {values, indices} = mtDriver.searchMerkleTree(tree, '0x3b1', DIFFICULTY);

  // generate Merkle proofs of the specified leaves
  console.log('\nGenerating Merkle proofs...\n');
  const { proof, proofFlags, leaves } = mtDriver.generateMerkleProofs(tree, indices);

  console.log(proof);
})();

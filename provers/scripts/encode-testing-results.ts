#! ./node_modules/.bin/ts-node

import 'zx/globals';
import * as tf from '@tensorflow/tfjs-node';

import dataDriver from "./utils/load-mnist-data";
import merkleTreeDriver from "./utils/merkle-tree";
import { DEMO_PATH, DIFFICULTY } from "./utils/constants";

const MODEL: string = argv.MODEL || `${DEMO_PATH}-tfjs`;
const MERKLE_TREE: string = argv.MERKLE_TREE || `${DEMO_PATH}-tree`;

(async (): Promise<void> => {
  // load model
  echo('\nLoading model...');
  const model = await tf.loadLayersModel(`file://../models/${MODEL}/model.json`);
  echo('✅');

  // load testing data
  echo('\nLoading testing data...');
  await dataDriver.loadData();
  const {images: testImages, labels: _} = dataDriver.getTestData();
  echo('✅');

  // predict
  echo('\nMaking predictions...');
  const predictions: any = (model.predict(testImages) as tf.Tensor).argMax(1).dataSync();
  echo('✅');

  // encode testing results as a Merkle tree & save it as a JSON file
  echo(`\nEncoding testing results & saving it as './merkle-trees/${MERKLE_TREE}.json'...`);
  const mtDriver = new merkleTreeDriver(DIFFICULTY);
  const merkleRoot = mtDriver.generateMerkleTree(testImages, predictions, `./merkle-trees/${MERKLE_TREE}.json`);
  echo(`\nmerkleRoot: ${merkleRoot}`);
  echo('✅');

  // save Merkle root as a JSON file
  echo(`\nSaving Merkle root to './merkle-trees/${MERKLE_TREE}-root.json'...`);
  fs.writeFileSync(
    `./merkle-trees/${MERKLE_TREE}-root.json`,
    JSON.stringify(
      { merkleRoot: merkleRoot }
    ),
  );
  echo('✅\n');
})();

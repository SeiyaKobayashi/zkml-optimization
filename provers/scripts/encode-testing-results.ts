#! ./node_modules/.bin/ts-node

import 'zx/globals';
import * as tf from '@tensorflow/tfjs-node';

import dataDriver from "../utils/load-mnist-data";
import merkleTreeDriver from "../utils/merkle-tree";

const MODEL: string = argv.MODEL || "demo-tfjs";
const OUTPUT_FILE: string = argv.OUTPUT_FILE || "demo-tree";
// const TESTING_DATA: string = argv.TESTING_DATA || "demo";
const DIFFICULTY: number = 10;

(async () => {
  const mtDriver = new merkleTreeDriver(DIFFICULTY);

  // load model
  console.log('\nLoading model...');
  const model = await tf.loadLayersModel(`file://../models/${MODEL}/model.json`);

  // load testing data
  console.log('\nLoading testing data...');
  await dataDriver.loadData();
  const {images: testImages, labels: _} = dataDriver.getTestData();

  // predict
  console.log('\nMaking predictions...');
  const predictions: any = (model.predict(testImages) as tf.Tensor).argMax(1).dataSync();

  // encoding testing results as a Merkle tree
  console.log('\nEncoding testing results...');
  const merkleRoot = mtDriver.generateMerkleTree(testImages, predictions, `${OUTPUT_FILE}.json`);

  console.log(`\nmerkleRoot: ${merkleRoot}\n`);
})();

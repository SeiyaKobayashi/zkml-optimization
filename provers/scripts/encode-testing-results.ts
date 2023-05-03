#! ./node_modules/.bin/ts-node

import 'zx/globals';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import * as tf from '@tensorflow/tfjs-node';

import dataDriver from "../utils/load-mnist-data";

const MODEL: string = argv.MODEL || "demo-tfjs";
// const TESTING_DATA: string = argv.TESTING_DATA || "demo";
const TEST_DATA_SIZE: number = 28 * 28;

const generateMerkleTree = (
  _testData: any,
  _predictions: any,
): string => {
  const numOfLeaves: number = _testData.size / TEST_DATA_SIZE;
  const leaves: string[][] = [];
  for (let i = 0; i < numOfLeaves; i++) {
    leaves.push([
      JSON.stringify(_testData.dataSync().slice(i * TEST_DATA_SIZE, i * TEST_DATA_SIZE + TEST_DATA_SIZE)),
      _predictions[i],
    ]);
  }

  return StandardMerkleTree.of(leaves, ['string', 'uint256']).root;
};

(async () => {
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
  const merkleRoot = generateMerkleTree(testImages, predictions);
  console.log(`\nmerkleRoot: ${merkleRoot}\n`);
})();

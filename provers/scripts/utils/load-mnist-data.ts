#! ./node_modules/.bin/ts-node

import * as tf from '@tensorflow/tfjs-node';
import * as assert from "assert";
import * as fs from "fs";
import * as https from "https";
import * as util from "util";
import * as zlib from "zlib";

const readFile = util.promisify(fs.readFile);

// MNIST data constants:
const BASE_URL = "https://storage.googleapis.com/cvdf-datasets/mnist/";
const TEST_IMAGES_FILE = "t10k-images-idx3-ubyte";
const TEST_LABELS_FILE = "t10k-labels-idx1-ubyte";
const IMAGE_HEADER_MAGIC_NUM = 2051;
const IMAGE_HEADER_BYTES = 16;
const IMAGE_HEIGHT = 28;
const IMAGE_WIDTH = 28;
const IMAGE_FLAT_SIZE = IMAGE_HEIGHT * IMAGE_WIDTH;
const LABEL_HEADER_MAGIC_NUM = 2049;
const LABEL_HEADER_BYTES = 8;
const LABEL_RECORD_BYTE = 1;
const LABEL_FLAT_SIZE = 10;

// Downloads a test file only once and returns the buffer for the file.
async function fetchOnceAndSaveToDiskWithBuffer(filename: string): Promise<Buffer> {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${filename}.gz`;
    if (fs.existsSync(filename)) {
      resolve(readFile(filename));
      return;
    }
    const file = fs.createWriteStream(filename);
    console.log(`  * Downloading from: ${url}`);
    https.get(url, (response) => {
      const unzip = zlib.createGunzip();
      response.pipe(unzip).pipe(file);
      unzip.on("end", () => {
        resolve(readFile(filename));
      });
    });
  });
}

function loadHeaderValues(buffer: any, headerLength: number) {
  const headerValues: any[]  = [];
  for (let i = 0; i < headerLength / 4; i++) {
    // Header data is stored in-order (aka big-endian)
    headerValues[i] = buffer.readUInt32BE(i * 4);
  }
  return headerValues;
}

async function loadImages(filename: string) {
  const buffer: Buffer = await fetchOnceAndSaveToDiskWithBuffer(filename);

  const headerBytes = IMAGE_HEADER_BYTES;
  const recordBytes = IMAGE_HEIGHT * IMAGE_WIDTH;

  const headerValues = loadHeaderValues(buffer, headerBytes);
  assert.equal(headerValues[0], IMAGE_HEADER_MAGIC_NUM);
  assert.equal(headerValues[2], IMAGE_HEIGHT);
  assert.equal(headerValues[3], IMAGE_WIDTH);

  const images: any[]  = [];
  let index = headerBytes;
  while (index < buffer.byteLength) {
    const array = new Float32Array(recordBytes);
    for (let i = 0; i < recordBytes; i++) {
      // Normalize the pixel values into the 0-1 interval, from
      // the original 0-255 interval.
      array[i] = buffer.readUInt8(index++) / 255;
    }
    images.push(array);
  }

  assert.equal(images.length, headerValues[1]);
  return images;
}

async function loadLabels(filename: string) {
  const buffer = await fetchOnceAndSaveToDiskWithBuffer(filename);

  const headerBytes = LABEL_HEADER_BYTES;
  const recordBytes = LABEL_RECORD_BYTE;

  const headerValues = loadHeaderValues(buffer, headerBytes);
  assert.equal(headerValues[0], LABEL_HEADER_MAGIC_NUM);

  const labels: any[] = [];
  let index = headerBytes;
  while (index < buffer.byteLength) {
    const array = new Int32Array(recordBytes);
    for (let i = 0; i < recordBytes; i++) {
      array[i] = buffer.readUInt8(index++);
    }
    labels.push(array);
  }

  assert.equal(labels.length, headerValues[1]);
  return labels;
}

/** Helper class to handle loading training and test data. */
export class MnistDataset {
  public dataset: any[];
  public testSize: number;
  public testBatchIndex: number;

  constructor() {
    this.dataset = [];
    this.testSize = 0;
    this.testBatchIndex = 0;
  }

  /** Loads test data. */
  public async loadData() {
    this.dataset = await Promise.all([
      loadImages(TEST_IMAGES_FILE), loadLabels(TEST_LABELS_FILE)
    ]);
    this.testSize = this.dataset[0].length;
  }

  public getTestData() {
    const imagesIndex = 0;
    const labelsIndex = 1;
    const size = this.dataset[imagesIndex].length;

    // Only create one big array to hold batch of images.
    const imagesShape: [number, number, number, number] = [size, IMAGE_HEIGHT, IMAGE_WIDTH, 1];
    const images: Float32Array = new Float32Array(tf.util.sizeFromShape(imagesShape));
    const labels: Int32Array = new Int32Array(tf.util.sizeFromShape([size, 1]));

    let imageOffset = 0;
    let labelOffset = 0;
    for (let i = 0; i < size; ++i) {
      images.set(this.dataset[imagesIndex][i], imageOffset);
      labels.set(this.dataset[labelsIndex][i], labelOffset);
      imageOffset += IMAGE_FLAT_SIZE;
      labelOffset += 1;
    }

    return {
      images: tf.tensor4d(images, imagesShape),
      labels: tf.oneHot(tf.tensor1d(labels, "int32"), LABEL_FLAT_SIZE).toFloat()
    };
  }
}

export default new MnistDataset();

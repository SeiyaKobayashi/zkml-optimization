import * as fs from 'fs';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';


const TEST_DATA_SIZE: number = 28 * 28;

type MerkleLeaves = {
  values: any[]
  indices: number[]
};

// NOTE: copied from https://github.com/OpenZeppelin/merkle-tree/blob/master/src/core.ts
type MultiProof<T, L = T> = {
  leaves: L[];
  proof: T[];
  proofFlags: boolean[];
};

export default class MerkleTreeDriver {
  private readonly difficulty: number;

  constructor(_difficulty: number) {
    this.difficulty = _difficulty;
  }

  static convertHexToBinary (
    _hex: string,
  ): string {
    return BigInt(_hex).toString(2).padStart((_hex.length - 2) * 4, '0');
  }

  public generateMerkleTree (
    _testData: any,
    _predictions: any,
    _filename: string,
  ): string {
    const numOfLeaves: number = _testData.size / TEST_DATA_SIZE;
    const leaves: string[][] = [];
    for (let i = 0; i < numOfLeaves; i++) {
      leaves.push([
        JSON.stringify(_testData.dataSync().slice(i * TEST_DATA_SIZE, i * TEST_DATA_SIZE + TEST_DATA_SIZE)),
        _predictions[i],
      ]);
    }

    const tree = StandardMerkleTree.of(leaves, ['string', 'uint256']);
    fs.writeFileSync(_filename, JSON.stringify(tree.dump()));

    return tree.root;
  }

  public loadMerkleTree (
    _filename: string,
  ): StandardMerkleTree<any> {
    return StandardMerkleTree.load(JSON.parse(fs.readFileSync(_filename).toString()));
  }

  public searchMerkleTree (
    _tree: StandardMerkleTree<any>,
    _challenge: string,
    _difficulty: number,
  ): MerkleLeaves {
    const challengeInBinary = MerkleTreeDriver.convertHexToBinary(_challenge);
    const values: any[] = [];
    const indices: number[] = [];

    for (const [i, v] of _tree.entries()) {
      const leafHash = _tree.leafHash(v);
      const leafHashInBinary = MerkleTreeDriver.convertHexToBinary(leafHash);
      if (leafHashInBinary.slice(-this.difficulty) === challengeInBinary.slice(-this.difficulty)) {
        values.push(v);
        indices.push(i);
      }
    }

    return {
      values: values,
      indices: indices
    };
  }

  public generateMerkleProofs (
    _tree: StandardMerkleTree<any>,
    _indices: number[],
  ): MultiProof<any, any> {
    return _tree.getMultiProof(_indices);
  }
}

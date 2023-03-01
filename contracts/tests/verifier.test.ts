import { expect } from 'chai';
import { Contract, ContractFactory, Signer } from 'ethers';
import hre from 'hardhat';
import '@nomicfoundation/hardhat-chai-matchers';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { Bytes32 } from 'soltypes';

describe('Verifier Contract', () => {
  const difficulty = 12;
  const testModelContentId: string = new Bytes32(
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  ).toString();
  const testModelName = 'Test Model';
  const testModelDescription = 'Description of test model.';
  const testMerkleRoot: string = new Bytes32(
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  ).toString();

  let Verifier: ContractFactory;
  let verifier: Contract;
  let owner: Signer;
  let ownerAddress: string;
  let anotherAccount: Signer;

  beforeEach(async () => {
    [owner, anotherAccount] = await hre.ethers.getSigners();
    ownerAddress = await owner.getAddress();

    Verifier = await hre.ethers.getContractFactory('Verifier');
    verifier = await Verifier.deploy(difficulty);
    await verifier.deployed();
  });

  const generateCommitmentId = (
    _testModelContentId: string,
    _testMerkleRoot: string,
  ): string => {
    return hre.ethers.utils.solidityKeccak256(
      ['bytes32', 'bytes32', 'address'],
      [_testModelContentId, _testMerkleRoot, ownerAddress],
    );
  };

  describe('constructor', () => {
    it('success', async () => {
      await Verifier.deploy(difficulty);

      const _difficulty = await verifier.getDifficulty();
      expect(_difficulty).to.equal(difficulty);
    });

    it('failure: invalid difficulty', async () => {
      await expect(Verifier.deploy(0)).to.be.revertedWith(
        'difficulty cannot be 0',
      );
    });
  });

  describe('registerModel', () => {
    it('success', async () => {
      const tx = await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      await expect(tx)
        .to.emit(verifier, 'ModelRegistered')
        .withArgs(testModelContentId, ownerAddress);

      const model = await verifier.getModel(testModelContentId);
      expect(model.contentId).to.equal(testModelContentId);
      expect(model.name).to.equal(testModelName);
      expect(model.description).to.equal(testModelDescription);
      expect(model.ownerAddress).to.equal(ownerAddress);
      expect(model.isDisabled).to.equal(false);

      const models = await verifier.getModels(0, 20);
      expect(models.length).to.equal(1);

      const modelsOfOwner = await verifier.getModelsByOwnerAddress(
        ownerAddress,
        0,
        20,
      );
      expect(modelsOfOwner.length).to.equal(1);
    });

    it('failure: duplicated model', async () => {
      // this call should succeed
      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      // this call should fail
      await expect(
        verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        ),
      ).to.be.revertedWith('model already exists');
    });

    it('failure: empty modelName', async () => {
      await expect(
        verifier.registerModel(testModelContentId, '', testModelDescription),
      ).to.be.revertedWith('empty modelName');
    });

    it('failure: empty modelDescription', async () => {
      await expect(
        verifier.registerModel(testModelContentId, testModelName, ''),
      ).to.be.revertedWith('empty modelDescription');
    });
  });

  describe('getModel', () => {
    it('success', async () => {
      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      const model = await verifier.getModel(testModelContentId);
      expect(model.contentId).to.equal(testModelContentId);
      expect(model.name).to.equal(testModelName);
      expect(model.description).to.equal(testModelDescription);
      expect(model.ownerAddress).to.equal(ownerAddress);
      expect(model.isDisabled).to.equal(false);
    });

    it('failure: model not found', async () => {
      await expect(verifier.getModel(testModelContentId)).to.be.revertedWith(
        'model not found',
      );
    });
  });

  describe('getModels', () => {
    const testModelContentIds: string[] = [
      new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString(),
      new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
      ).toString(),
      new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111113',
      ).toString(),
    ];

    it('success', async () => {
      // no models
      let models = await verifier.getModels(0, 1);
      expect(models.length).to.equal(0);
      await expect(
        verifier.getModels(testModelContentIds.length, 1),
      ).to.be.revertedWith('offset must be 0 when no items exist');

      // multiple models
      testModelContentIds.forEach(async (testModelContentId) => {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      });
      models = await verifier.getModels(0, 1);
      expect(models.length).to.equal(1);
      models = await verifier.getModels(0, 3);
      expect(models.length).to.equal(3);
      models = await verifier.getModels(0, 5);
      expect(models.length).to.equal(3);
      models = await verifier.getModels(1, 3);
      expect(models.length).to.equal(2);
    });

    it('failure: invalid offset', async () => {
      // no models
      await expect(
        verifier.getModels(testModelContentIds.length, 1),
      ).to.be.revertedWith('offset must be 0 when no items exist');

      // multiple models
      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );
      await expect(
        verifier.getModels(testModelContentIds.length, 1),
      ).to.be.revertedWith('offset must be < length of list of items');
    });

    it('failure: invalid limit', async () => {
      const revertMessage = 'limit must be > 0 and <= 30';
      await expect(verifier.getModels(0, 0)).to.be.revertedWith(revertMessage);
      await expect(verifier.getModels(0, 31)).to.be.revertedWith(revertMessage);
    });
  });

  describe('getModelsByOwnerAddress', () => {
    const testModelContentIds: string[] = [
      new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString(),
      new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
      ).toString(),
      new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111113',
      ).toString(),
    ];

    it('success', async () => {
      testModelContentIds.forEach(async (testModelContentId) => {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      });

      let models = await verifier.getModelsByOwnerAddress(ownerAddress, 0, 1);
      expect(models.length).to.equal(1);
      models = await verifier.getModels(0, 3);
      expect(models.length).to.equal(3);
      models = await verifier.getModels(0, 5);
      expect(models.length).to.equal(3);
      models = await verifier.getModels(1, 3);
      expect(models.length).to.equal(2);
    });

    it('failure: model owner not found', async () => {
      await expect(
        verifier.getModelsByOwnerAddress(
          '0x0000000000000000000000000000000000000000',
          0,
          1,
        ),
      ).to.be.revertedWith('model owner not found');
    });

    it('failure: invalid offset', async () => {
      // multiple models
      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      await expect(
        verifier.getModelsByOwnerAddress(
          ownerAddress,
          testModelContentIds.length,
          1,
        ),
      ).to.be.revertedWith('offset must be < length of list of items');
    });

    it('failure: invalid limit', async () => {
      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      const revertMessage = 'limit must be > 0 and <= 30';
      await expect(
        verifier.getModelsByOwnerAddress(ownerAddress, 0, 0),
      ).to.be.revertedWith(revertMessage);
      await expect(
        verifier.getModelsByOwnerAddress(ownerAddress, 0, 31),
      ).to.be.revertedWith(revertMessage);
    });
  });

  describe('updateModel', () => {
    const updatedTestModelName = 'Updated Test Model';
    const updatedTestModelDescription = 'Updated description of test model.';

    const setup = async (_createModel = true): Promise<string> => {
      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      return testModelContentId;
    };

    it('success', async () => {
      const testModelContentId = await setup();

      await verifier.updateModel(
        testModelContentId,
        updatedTestModelName,
        updatedTestModelDescription,
      );

      const model = await verifier.getModel(testModelContentId);
      expect(model.contentId).to.equal(testModelContentId);
      expect(model.name).to.equal(updatedTestModelName);
      expect(model.description).to.equal(updatedTestModelDescription);
      expect(model.ownerAddress).to.equal(ownerAddress);
      expect(model.isDisabled).to.equal(false);
    });

    it('failure: model not found', async () => {
      const testModelContentId = setup(false);

      await expect(
        verifier.updateModel(
          testModelContentId,
          updatedTestModelName,
          updatedTestModelDescription,
        ),
      ).to.be.revertedWith('model not found');
    });

    it('failure: invalid model owner', async () => {
      const testModelContentId = setup();

      await expect(
        verifier
          .connect(anotherAccount)
          .updateModel(
            testModelContentId,
            updatedTestModelName,
            updatedTestModelDescription,
          ),
      ).to.be.revertedWith('only model owner can execute');
    });

    it('failure: empty modelName', async () => {
      const testModelContentId = setup();

      await expect(
        verifier.updateModel(
          testModelContentId,
          '',
          updatedTestModelDescription,
        ),
      ).to.be.revertedWith('empty modelName');
    });

    it('failure: empty modelDescription', async () => {
      const testModelContentId = setup();

      await expect(
        verifier.updateModel(testModelContentId, updatedTestModelName, ''),
      ).to.be.revertedWith('empty modelDescription');
    });
  });

  describe('disableModel', () => {
    const setup = async (_createModel = true): Promise<string> => {
      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      return testModelContentId;
    };

    it('success', async () => {
      const testModelContentId = setup();

      await verifier.disableModel(testModelContentId);

      const model = await verifier.getModel(testModelContentId);
      expect(model.isDisabled).to.equal(true);
    });

    it('failure: model not found', async () => {
      const testModelContentId = setup(false);

      await expect(
        verifier.disableModel(testModelContentId),
      ).to.be.revertedWith('model not found');
    });

    it('failure: invalid model owner', async () => {
      const testModelContentId = setup();

      await expect(
        verifier.connect(anotherAccount).disableModel(testModelContentId),
      ).to.be.revertedWith('only model owner can execute');
    });
  });

  describe('commit', () => {
    const setup = async (_createModel = true): Promise<[string, string]> => {
      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      return [testModelContentId, testMerkleRoot];
    };

    it('success', async () => {
      const [testModelContentId, testMerkleRoot] = await setup();

      const tx = await verifier.commit(testModelContentId, testMerkleRoot);

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);

      await expect(tx)
        .to.emit(verifier, 'Committed')
        .withArgs(commitId, ownerAddress);

      const commitsOfModel = await verifier.getCommitmentsOfModel(
        testModelContentId,
        0,
        20,
      );
      expect(commitsOfModel.length).to.equal(1);

      const commitsOfProver = await verifier.getCommitmentsOfProver(
        ownerAddress,
        0,
        20,
      );
      expect(commitsOfProver.length).to.equal(1);

      const commitment = await verifier.getCommitment(commitId);
      expect(commitment.id).to.equal(commitId);
      expect(commitment.modelContentId).to.equal(testModelContentId);
      expect(commitment.merkleRoot).to.equal(testMerkleRoot);
      expect(commitment.challenge.length).to.equal(66);
      expect(commitment.difficulty).to.equal(difficulty);
      expect(commitment.proverAddress).to.equal(ownerAddress);
      expect(commitment.isRevealed).to.equal(false);
    });

    it('failure: model not found', async () => {
      const [testModelContentId, testMerkleRoot] = await setup(false);

      await expect(
        verifier.commit(testModelContentId, testMerkleRoot),
      ).to.be.revertedWith('model not found');
    });

    it('failure: commitment already exists', async () => {
      const [testModelContentId, testMerkleRoot] = await setup(true);

      await verifier.commit(testModelContentId, testMerkleRoot);

      await expect(
        verifier.commit(testModelContentId, testMerkleRoot),
      ).to.be.revertedWith('commitment already exists');
    });
  });

  describe('getCommitment', () => {
    const setup = async (
      _createModel = true,
      _createCommitment = true,
    ): Promise<[string, string]> => {
      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      if (_createCommitment) {
        await verifier.commit(testModelContentId, testMerkleRoot);
      }

      return [testModelContentId, testMerkleRoot];
    };

    it('success', async () => {
      const [testModelContentId, testMerkleRoot] = await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);

      const commitment = await verifier.getCommitment(commitId);

      expect(commitment.id).to.equal(commitId);
      expect(commitment.modelContentId).to.equal(testModelContentId);
      expect(commitment.merkleRoot).to.equal(testMerkleRoot);
      expect(commitment.challenge.length).to.equal(66);
      expect(commitment.difficulty).to.equal(difficulty);
      expect(commitment.proverAddress).to.equal(ownerAddress);
      expect(commitment.isRevealed).to.equal(false);
    });

    it('failure: commitment not found', async () => {
      const [testModelContentId, testMerkleRoot] = await setup(false, false);

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);

      await expect(verifier.getCommitment(commitId)).to.be.revertedWith(
        'commitment not found',
      );
    });

    it('failure: not contract owner', async () => {
      const [testModelContentId, testMerkleRoot] = await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);

      await expect(
        verifier.connect(anotherAccount).getCommitment(commitId),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('getCommitments', () => {
    const setup = async (
      _createModel = true,
      _createCommitments = true,
    ): Promise<string> => {
      const testMerkleRoots: string[] = [
        new Bytes32(
          '0x1111111111111111111111111111111111111111111111111111111111111111',
        ).toString(),
        new Bytes32(
          '0x1111111111111111111111111111111111111111111111111111111111111112',
        ).toString(),
        new Bytes32(
          '0x1111111111111111111111111111111111111111111111111111111111111113',
        ).toString(),
      ];

      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      if (_createCommitments) {
        testMerkleRoots.forEach(async (testMerkleRoot) => {
          await verifier.commit(testModelContentId, testMerkleRoot);
        });
      }

      return testModelContentId;
    };

    describe('getCommitmentsOfModel', () => {
      it('success', async () => {
        // no commits
        const testModelContentId = await setup(true, false);

        let commits = await verifier.getCommitmentsOfModel(
          testModelContentId,
          0,
          1,
        );
        expect(commits.length).to.equal(0);

        // multiple commits
        await setup(false, true);

        commits = await verifier.getCommitmentsOfModel(
          testModelContentId,
          0,
          1,
        );
        expect(commits.length).to.equal(1);
        commits = await verifier.getCommitmentsOfModel(
          testModelContentId,
          0,
          3,
        );
        expect(commits.length).to.equal(3);
        commits = await verifier.getCommitmentsOfModel(
          testModelContentId,
          0,
          5,
        );
        expect(commits.length).to.equal(3);
        commits = await verifier.getCommitmentsOfModel(
          testModelContentId,
          1,
          3,
        );
        expect(commits.length).to.equal(2);
      });

      it('failure: model not found', async () => {
        const testModelContentId = await setup(false, false);

        await expect(
          verifier.getCommitmentsOfModel(testModelContentId, 0, 20),
        ).to.be.revertedWith('model not found');
      });

      it('failure: invalid offset', async () => {
        // no commits
        const testModelContentId = await setup(true, false);

        await expect(
          verifier.getCommitmentsOfModel(testModelContentId, 1, 1),
        ).to.be.revertedWith('offset must be 0 when no items exist');

        // multiple commits
        await setup(false, true);

        await expect(
          verifier.getCommitmentsOfModel(testModelContentId, 5, 1),
        ).to.be.revertedWith('offset must be < length of list of items');
      });

      it('failure: invalid limit', async () => {
        const testModelContentId = await setup();

        const revertMessage = 'limit must be > 0 and <= 30';
        await expect(
          verifier.getCommitmentsOfModel(testModelContentId, 0, 0),
        ).to.be.revertedWith(revertMessage);
        await expect(
          verifier.getCommitmentsOfModel(testModelContentId, 0, 31),
        ).to.be.revertedWith(revertMessage);
      });

      it('failure: not contract owner', async () => {
        const testModelContentId = await setup();

        await expect(
          verifier
            .connect(anotherAccount)
            .getCommitmentsOfModel(testModelContentId, 0, 20),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('getCommitmentsOfProver', () => {
      it('success', async () => {
        // no commits
        let commits = await verifier.getCommitmentsOfProver(ownerAddress, 0, 1);
        expect(commits.length).to.equal(0);

        // multiple commits
        await setup(true, true);

        commits = await verifier.getCommitmentsOfProver(ownerAddress, 0, 1);
        expect(commits.length).to.equal(1);
        commits = await verifier.getCommitmentsOfProver(ownerAddress, 0, 3);
        expect(commits.length).to.equal(3);
        commits = await verifier.getCommitmentsOfProver(ownerAddress, 0, 5);
        expect(commits.length).to.equal(3);
        commits = await verifier.getCommitmentsOfProver(ownerAddress, 1, 3);
        expect(commits.length).to.equal(2);
      });

      it('failure: invalid offset', async () => {
        // no commits
        await expect(
          verifier.getCommitmentsOfProver(ownerAddress, 1, 1),
        ).to.be.revertedWith('offset must be 0 when no items exist');

        // multiple commits
        await setup(true, true);

        await expect(
          verifier.getCommitmentsOfProver(ownerAddress, 5, 1),
        ).to.be.revertedWith('offset must be < length of list of items');
      });

      it('failure: invalid limit', async () => {
        await setup();

        const revertMessage = 'limit must be > 0 and <= 30';
        await expect(
          verifier.getCommitmentsOfProver(ownerAddress, 0, 0),
        ).to.be.revertedWith(revertMessage);
        await expect(
          verifier.getCommitmentsOfProver(ownerAddress, 0, 31),
        ).to.be.revertedWith(revertMessage);
      });

      it('failure: invalid prover', async () => {
        await setup();

        await expect(
          verifier
            .connect(anotherAccount)
            .getCommitmentsOfProver(ownerAddress, 0, 20),
        ).to.be.revertedWith('invalid prover');
      });
    });
  });

  describe('updateChallenge', () => {
    const setup = async (
      _createModel = true,
      _createCommitment = true,
    ): Promise<[string, string]> => {
      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      if (_createCommitment) {
        await verifier.commit(testModelContentId, testMerkleRoot);
      }

      return [testModelContentId, testMerkleRoot];
    };

    it('success', async () => {
      const [testModelContentId, testMerkleRoot] = await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);

      const originalCommitment = await verifier.getCommitment(commitId);

      const tx = await verifier.updateChallenge(commitId);

      await expect(tx)
        .to.emit(verifier, 'ChallengeUpdated')
        .withArgs(commitId, ownerAddress);

      const updatedCommitment = await verifier.getCommitment(commitId);
      expect(updatedCommitment.challenge).to.not.equal(
        originalCommitment.challenge,
      );
    });

    it('failure: commitment not found', async () => {
      const [testModelContentId, testMerkleRoot] = await setup(false, false);

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);

      await expect(verifier.updateChallenge(commitId)).to.be.revertedWith(
        'commitment not found',
      );
    });

    it('failure: invalid prover', async () => {
      const [testModelContentId, testMerkleRoot] = await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);

      await expect(
        verifier.connect(anotherAccount).updateChallenge(commitId),
      ).to.be.revertedWith('invalid prover');
    });
  });

  describe('getDifficulty', () => {
    it('success', async () => {
      const _difficulty = await verifier.getDifficulty();

      expect(_difficulty).to.equal(difficulty);
    });

    it('failure: not contract owner', async () => {
      await expect(
        verifier.connect(anotherAccount).getDifficulty(),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('updateDifficulty', () => {
    const validDifficulty = 11;
    const invalidDifficulty = 0;

    it('success', async () => {
      await verifier.updateDifficulty(validDifficulty);

      const updatedDifficulty = await verifier.getDifficulty();
      expect(updatedDifficulty).to.equal(validDifficulty);
    });

    it('failure: invalid difficulty', async () => {
      await expect(
        verifier.updateDifficulty(invalidDifficulty),
      ).to.be.revertedWith('difficulty cannot be 0');
    });

    it('failure: not contract owner', async () => {
      await expect(
        verifier.connect(anotherAccount).updateDifficulty(validDifficulty),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('reveal', () => {
    const setup = async (
      _numOfNode = 10,
      _createModel = true,
      _createCommitment = true,
    ): Promise<[string, string, StandardMerkleTree<string[]>]> => {
      // set difficulty to 1 to make sure that challenge almost always matches
      // at least one of the autogenerated leaves
      await verifier.updateDifficulty(1);

      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      // generate Merkle tree and store root hash to `testMerkleRoot`
      const testMerkleTree = generateMerkleTree(_numOfNode);
      const testMerkleRoot = testMerkleTree.root;

      if (_createCommitment) {
        await verifier.commit(testModelContentId, testMerkleRoot);
      }

      return [testModelContentId, testMerkleRoot, testMerkleTree];
    };

    const generateMerkleTree = (
      _numOfNodes: number,
    ): StandardMerkleTree<string[]> => {
      const leaves: string[][] = [];
      for (let i = 0; i < _numOfNodes; i++) {
        leaves.push([`${i}`]);
      }

      return StandardMerkleTree.of(leaves, ['string']);
    };

    const getIndicesOfMerkleTree = (
      tree: StandardMerkleTree<string[]>,
      endsWithZero: boolean,
    ): number[] => {
      const evenHexDigits: string[] = ['0', '2', '4', '6', '8', 'a', 'c', 'e'];
      const oddHexDigits: string[] = ['1', '3', '5', '7', '9', 'b', 'd', 'f'];
      const indices: number[] = [];

      for (const [i, v] of tree.entries()) {
        if (
          endsWithZero &&
          evenHexDigits.includes(tree.leafHash(v).slice(-1))
        ) {
          indices.push(i);
        } else if (
          !endsWithZero &&
          oddHexDigits.includes(tree.leafHash(v).slice(-1))
        ) {
          indices.push(i);
        }
      }

      return indices;
    };

    it('success', async () => {
      const [testModelContentId, testMerkleRoot, testMerkleTree] =
        await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);
      let commitment = await verifier.getCommitment(commitId);
      const matchedIndices = getIndicesOfMerkleTree(
        testMerkleTree,
        commitment.challenge.slice(-1) == 0,
      );
      const { proof, proofFlags, leaves } =
        testMerkleTree.getMultiProof(matchedIndices);
      const leafHashes = leaves.map((e) => testMerkleTree.leafHash(e));

      const tx = await verifier.reveal(commitId, proof, proofFlags, leafHashes);

      await expect(tx)
        .to.emit(verifier, 'CommitmentRevealed')
        .withArgs(commitId, ownerAddress);

      commitment = await verifier.getCommitment(commitId);
      expect(commitment.isRevealed).to.equal(true);
    });

    it('failure: commitment not found', async () => {
      const [testModelContentId, testMerkleRoot, testMerkleTree] = await setup(
        10,
        true,
        false,
      );

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);
      const matchedIndices = getIndicesOfMerkleTree(testMerkleTree, true);
      const { proof, proofFlags, leaves } =
        testMerkleTree.getMultiProof(matchedIndices);
      const leafHashes = leaves.map((e) => testMerkleTree.leafHash(e));

      await expect(
        verifier.reveal(commitId, proof, proofFlags, leafHashes),
      ).to.be.revertedWith('commitment not found');
    });

    it('failure: invalid prover', async () => {
      const [testModelContentId, testMerkleRoot, testMerkleTree] =
        await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);
      const commitment = await verifier.getCommitment(commitId);
      const matchedIndices = getIndicesOfMerkleTree(
        testMerkleTree,
        commitment.challenge.slice(-1) == 0,
      );
      const { proof, proofFlags, leaves } =
        testMerkleTree.getMultiProof(matchedIndices);
      const leafHashes = leaves.map((e) => testMerkleTree.leafHash(e));

      await expect(
        verifier
          .connect(anotherAccount)
          .reveal(commitId, proof, proofFlags, leafHashes),
      ).to.be.revertedWith('invalid prover');
    });

    it('failure: commitment already revealed', async () => {
      const [testModelContentId, testMerkleRoot, testMerkleTree] =
        await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);
      const commitment = await verifier.getCommitment(commitId);
      const matchedIndices = getIndicesOfMerkleTree(
        testMerkleTree,
        commitment.challenge.slice(-1) == 0,
      );
      const { proof, proofFlags, leaves } =
        testMerkleTree.getMultiProof(matchedIndices);
      const leafHashes = leaves.map((e) => testMerkleTree.leafHash(e));

      await verifier.reveal(commitId, proof, proofFlags, leafHashes);
      await expect(
        verifier.reveal(commitId, proof, proofFlags, leafHashes),
      ).to.be.revertedWith('commitment already revealed');
    });

    it('failure: invalid leaves', async () => {
      const [testModelContentId, testMerkleRoot, testMerkleTree] =
        await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);
      const commitment = await verifier.getCommitment(commitId);
      const matchedIndices = getIndicesOfMerkleTree(
        testMerkleTree,
        commitment.challenge.slice(-1) != 0,
      );
      const { proof, proofFlags, leaves } =
        testMerkleTree.getMultiProof(matchedIndices);
      const leafHashes = leaves.map((e) => testMerkleTree.leafHash(e));

      await expect(
        verifier.reveal(commitId, proof, proofFlags, leafHashes),
      ).to.be.revertedWith('invalid leaves');
    });

    it('failure: invalid Merkle proofs', async () => {
      const [testModelContentId, testMerkleRoot, testMerkleTree] =
        await setup();

      const commitId = generateCommitmentId(testModelContentId, testMerkleRoot);
      const commitment = await verifier.getCommitment(commitId);
      const matchedIndices = getIndicesOfMerkleTree(
        testMerkleTree,
        commitment.challenge.slice(-1) == 0,
      );
      const { proof, proofFlags, leaves } =
        testMerkleTree.getMultiProof(matchedIndices);
      const leafHashes = leaves.map((e) => testMerkleTree.leafHash(e));

      await expect(
        verifier.reveal(commitId, proof.reverse(), proofFlags, leafHashes),
      ).to.be.revertedWith('invalid Merkle proofs');

      // need to re-apply `reverse()` to get the original proof
      await expect(
        verifier.reveal(
          commitId,
          proof.reverse(),
          proofFlags.reverse(),
          leafHashes,
        ),
      ).to.be.revertedWith('invalid Merkle proofs');
    });
  });
});

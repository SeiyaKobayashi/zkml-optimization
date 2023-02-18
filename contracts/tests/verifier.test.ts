import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import hre from 'hardhat';
import '@nomicfoundation/hardhat-chai-matchers';
import { Bytes32 } from 'soltypes';

describe('Verifier Contract', () => {
  let verifier: Contract;
  let owner: Signer;
  let ownerAddress: string;
  let anotherAccount: Signer;
  const challengeLength = 3;

  beforeEach(async () => {
    [owner, anotherAccount] = await hre.ethers.getSigners();
    ownerAddress = await owner.getAddress();
    const Verifier = await hre.ethers.getContractFactory('Verifier');
    verifier = await Verifier.deploy(challengeLength);
    await verifier.deployed();
  });

  describe('registerModel', () => {
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';

    it('success', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString();

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
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
      ).toString();

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
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111113',
      ).toString();

      await expect(
        verifier.registerModel(testModelContentId, '', testModelDescription),
      ).to.be.revertedWith('empty modelName');
    });

    it('failure: empty modelDescription', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111114',
      ).toString();

      await expect(
        verifier.registerModel(testModelContentId, testModelName, ''),
      ).to.be.revertedWith('empty modelDescription');
    });
  });

  describe('getModel', () => {
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';

    it('success', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString();

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
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
      ).toString();

      await expect(verifier.getModel(testModelContentId)).to.be.revertedWith(
        'model not found',
      );
    });
  });

  describe('getModels', () => {
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';
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

      let models = await verifier.getModels(0, 1);
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
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111114',
      ).toString();
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
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';

    it('success', async () => {
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
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111114',
      ).toString();
      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      await expect(
        verifier.getModelsByOwnerAddress(ownerAddress, 5, 1),
      ).to.be.revertedWith('offset must be < length of list of items');
    });

    it('failure: invalid limit', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111115',
      ).toString();
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
    const testModelName = 'Test Model';
    const updatedTestModelName = 'Updated Test Model';
    const testModelDescription = 'Description of test model.';
    const updatedTestModelDescription = 'Updated description of test model.';

    it('success', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString();

      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

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

    it('failure: invalid model owner', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
      ).toString();

      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

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

    it('failure: model not found', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111113',
      ).toString();

      await expect(
        verifier.updateModel(
          testModelContentId,
          updatedTestModelName,
          updatedTestModelDescription,
        ),
      ).to.be.revertedWith('model not found');
    });

    it('failure: empty modelName', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111114',
      ).toString();

      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      await expect(
        verifier.updateModel(
          testModelContentId,
          '',
          updatedTestModelDescription,
        ),
      ).to.be.revertedWith('empty modelName');
    });

    it('failure: empty modelDescription', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111115',
      ).toString();

      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      await expect(
        verifier.updateModel(testModelContentId, updatedTestModelName, ''),
      ).to.be.revertedWith('empty modelDescription');
    });
  });

  describe('disableModel', () => {
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';

    it('success', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString();

      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      await verifier.disableModel(testModelContentId);

      const model = await verifier.getModel(testModelContentId);
      expect(model.isDisabled).to.equal(true);
    });

    it('failure: invalid model owner', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
      ).toString();

      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      await expect(
        verifier.connect(anotherAccount).disableModel(testModelContentId),
      ).to.be.revertedWith('only model owner can execute');
    });

    it('failure: model not found', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111113',
      ).toString();

      await expect(
        verifier.disableModel(testModelContentId),
      ).to.be.revertedWith('model not found');
    });
  });

  describe('commit', () => {
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';

    const setUpTestData = async (
      _testModelContentId: string,
      _createModel = true,
    ): Promise<[string, string]> => {
      const testModelContentId: string = new Bytes32(
        _testModelContentId,
      ).toString();
      const testMerkleRoot: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString();

      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      return [testModelContentId, testMerkleRoot];
    };

    const generateCommitId = (
      _testModelContentId: string,
      _testMerkleRoot: string,
    ): string => {
      return hre.ethers.utils.solidityKeccak256(
        ['bytes32', 'bytes32', 'address'],
        [_testModelContentId, _testMerkleRoot, ownerAddress],
      );
    };

    it('success', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      );

      const tx = await verifier.commit(testModelContentId, testMerkleRoot);

      const commitId = generateCommitId(testModelContentId, testMerkleRoot);

      await expect(tx)
        .to.emit(verifier, 'CommitAdded')
        .withArgs(commitId, ownerAddress);

      const commitsOfModel = await verifier.getCommitsOfModel(
        testModelContentId,
        0,
        20,
      );
      expect(commitsOfModel.length).to.equal(1);

      const commitsOfProver = await verifier.getCommitsOfProver(
        ownerAddress,
        0,
        20,
      );
      expect(commitsOfProver.length).to.equal(1);

      const commit = await verifier.getCommit(commitId);
      expect(commit.id).to.equal(commitId);
      expect(commit.modelContentId).to.equal(testModelContentId);
      expect(commit.merkleRoot).to.equal(testMerkleRoot);
      expect(commit.challenge.length).to.equal(2 + challengeLength * 2);
      expect(commit.proverAddress).to.equal(ownerAddress);
      expect(commit.isRevealed).to.equal(false);
    });

    it('failure: model not found', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
        false,
      );

      await expect(
        verifier.commit(testModelContentId, testMerkleRoot),
      ).to.be.revertedWith('model not found');
    });

    it('failure: commit already exists', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111113',
        true,
      );

      await verifier.commit(testModelContentId, testMerkleRoot);

      await expect(
        verifier.commit(testModelContentId, testMerkleRoot),
      ).to.be.revertedWith('commit already exists');
    });
  });

  describe('getCommit', () => {
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';

    const setUpTestData = async (
      _testModelContentId: string,
      _createModel = true,
      _createCommit = true,
    ): Promise<[string, string]> => {
      const testModelContentId: string = new Bytes32(
        _testModelContentId,
      ).toString();
      const testMerkleRoot: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString();

      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      if (_createCommit) {
        await verifier.commit(testModelContentId, testMerkleRoot);
      }

      return [testModelContentId, testMerkleRoot];
    };

    const generateCommitId = (
      _testModelContentId: string,
      _testMerkleRoot: string,
    ): string => {
      return hre.ethers.utils.solidityKeccak256(
        ['bytes32', 'bytes32', 'address'],
        [_testModelContentId, _testMerkleRoot, ownerAddress],
      );
    };

    it('success', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      );

      const commitId = generateCommitId(testModelContentId, testMerkleRoot);

      const commit = await verifier.getCommit(commitId);

      expect(commit.id).to.equal(commitId);
      expect(commit.modelContentId).to.equal(testModelContentId);
      expect(commit.merkleRoot).to.equal(testMerkleRoot);
      expect(commit.challenge.length).to.equal(2 + challengeLength * 2);
      expect(commit.proverAddress).to.equal(ownerAddress);
      expect(commit.isRevealed).to.equal(false);
    });

    it('failure: commit not found', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
        false,
        false,
      );

      const commitId = generateCommitId(testModelContentId, testMerkleRoot);

      await expect(verifier.getCommit(commitId)).to.be.revertedWith(
        'commit not found',
      );
    });

    it('failure: not contract owner', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111113',
      );

      const commitId = generateCommitId(testModelContentId, testMerkleRoot);

      await expect(
        verifier.connect(anotherAccount).getCommit(commitId),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('getCommits', () => {
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';

    const setUpTestData = async (
      _testModelContentId: string,
      _createModel = true,
      _createCommits = true,
    ): Promise<string> => {
      const testModelContentId: string = new Bytes32(
        _testModelContentId,
      ).toString();
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

      if (_createCommits) {
        testMerkleRoots.forEach(async (testMerkleRoot) => {
          await verifier.commit(testModelContentId, testMerkleRoot);
        });
      }

      return testModelContentId;
    };

    describe('getCommitsOfModel', () => {
      it('success', async () => {
        // no commits
        const testModelContentId = await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111111',
          true,
          false,
        );

        let commits = await verifier.getCommitsOfModel(
          testModelContentId,
          0,
          1,
        );
        expect(commits.length).to.equal(0);

        // multiple commits
        await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111111',
          false,
          true,
        );

        commits = await verifier.getCommitsOfModel(testModelContentId, 0, 1);
        expect(commits.length).to.equal(1);
        commits = await verifier.getCommitsOfModel(testModelContentId, 0, 3);
        expect(commits.length).to.equal(3);
        commits = await verifier.getCommitsOfModel(testModelContentId, 0, 5);
        expect(commits.length).to.equal(3);
        commits = await verifier.getCommitsOfModel(testModelContentId, 1, 3);
        expect(commits.length).to.equal(2);
      });

      it('failure: model not found', async () => {
        const testModelContentId = await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111112',
          false,
          false,
        );

        await expect(
          verifier.getCommitsOfModel(testModelContentId, 0, 20),
        ).to.be.revertedWith('model not found');
      });

      it('failure: invalid offset', async () => {
        // no commits
        const testModelContentId = await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111113',
          true,
          false,
        );

        await expect(
          verifier.getCommitsOfModel(testModelContentId, 1, 1),
        ).to.be.revertedWith('offset must be 0 when no items exist');

        // multiple commits
        await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111113',
          false,
          true,
        );

        await expect(
          verifier.getCommitsOfModel(testModelContentId, 5, 1),
        ).to.be.revertedWith('offset must be < length of list of items');
      });

      it('failure: invalid limit', async () => {
        const testModelContentId = await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111114',
        );

        const revertMessage = 'limit must be > 0 and <= 30';
        await expect(
          verifier.getCommitsOfModel(testModelContentId, 0, 0),
        ).to.be.revertedWith(revertMessage);
        await expect(
          verifier.getCommitsOfModel(testModelContentId, 0, 31),
        ).to.be.revertedWith(revertMessage);
      });

      it('failure: not contract owner', async () => {
        const testModelContentId = await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111115',
        );

        await expect(
          verifier
            .connect(anotherAccount)
            .getCommitsOfModel(testModelContentId, 0, 20),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('getCommitsOfProver', () => {
      it('success', async () => {
        // no commits
        let commits = await verifier.getCommitsOfProver(ownerAddress, 0, 1);
        expect(commits.length).to.equal(0);

        // multiple commits
        await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111116',
          true,
          true,
        );

        commits = await verifier.getCommitsOfProver(ownerAddress, 0, 1);
        expect(commits.length).to.equal(1);
        commits = await verifier.getCommitsOfProver(ownerAddress, 0, 3);
        expect(commits.length).to.equal(3);
        commits = await verifier.getCommitsOfProver(ownerAddress, 0, 5);
        expect(commits.length).to.equal(3);
        commits = await verifier.getCommitsOfProver(ownerAddress, 1, 3);
        expect(commits.length).to.equal(2);
      });

      it('failure: invalid offset', async () => {
        // no commits
        await expect(
          verifier.getCommitsOfProver(ownerAddress, 1, 1),
        ).to.be.revertedWith('offset must be 0 when no items exist');

        // multiple commits
        await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111117',
          true,
          true,
        );

        await expect(
          verifier.getCommitsOfProver(ownerAddress, 5, 1),
        ).to.be.revertedWith('offset must be < length of list of items');
      });

      it('failure: invalid limit', async () => {
        await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111118',
        );

        const revertMessage = 'limit must be > 0 and <= 30';
        await expect(
          verifier.getCommitsOfProver(ownerAddress, 0, 0),
        ).to.be.revertedWith(revertMessage);
        await expect(
          verifier.getCommitsOfProver(ownerAddress, 0, 31),
        ).to.be.revertedWith(revertMessage);
      });

      it('failure: invalid prover', async () => {
        await setUpTestData(
          '0x1111111111111111111111111111111111111111111111111111111111111119',
        );

        await expect(
          verifier
            .connect(anotherAccount)
            .getCommitsOfProver(ownerAddress, 0, 20),
        ).to.be.revertedWith('invalid prover');
      });
    });
  });

  describe('updateChallenge', () => {
    const testModelName = 'Test Model';
    const testModelDescription = 'Description of test model.';

    const setUpTestData = async (
      _testModelContentId: string,
      _createModel = true,
      _createCommit = true,
    ): Promise<[string, string]> => {
      const testModelContentId: string = new Bytes32(
        _testModelContentId,
      ).toString();
      const testMerkleRoot: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      ).toString();

      if (_createModel) {
        await verifier.registerModel(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      }

      if (_createCommit) {
        await verifier.commit(testModelContentId, testMerkleRoot);
      }

      return [testModelContentId, testMerkleRoot];
    };

    const generateCommitId = (
      _testModelContentId: string,
      _testMerkleRoot: string,
    ): string => {
      return hre.ethers.utils.solidityKeccak256(
        ['bytes32', 'bytes32', 'address'],
        [_testModelContentId, _testMerkleRoot, ownerAddress],
      );
    };

    it('success', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      );

      const commitId = generateCommitId(testModelContentId, testMerkleRoot);

      const originalCommit = await verifier.getCommit(commitId);

      const tx = await verifier.updateChallenge(commitId);

      await expect(tx)
        .to.emit(verifier, 'ChallengeUpdated')
        .withArgs(commitId, ownerAddress);

      const updatedCommit = await verifier.getCommit(commitId);
      expect(updatedCommit.challenge).to.not.equal(originalCommit.challenge);
    });

    it('failure: commit not found', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
        false,
        false,
      );

      const commitId = generateCommitId(testModelContentId, testMerkleRoot);

      await expect(verifier.updateChallenge(commitId)).to.be.revertedWith(
        'commit not found',
      );
    });

    it('failure: invalid prover', async () => {
      const [testModelContentId, testMerkleRoot] = await setUpTestData(
        '0x1111111111111111111111111111111111111111111111111111111111111113',
      );

      const commitId = generateCommitId(testModelContentId, testMerkleRoot);

      await expect(
        verifier.connect(anotherAccount).updateChallenge(commitId),
      ).to.be.revertedWith('invalid prover');
    });
  });

  describe('getChallengeLength', () => {
    it('success', async () => {
      const _challengeLength = await verifier.getChallengeLength();

      expect(_challengeLength).to.equal(challengeLength);
    });

    it('failure: not contract owner', async () => {
      await expect(
        verifier.connect(anotherAccount).getChallengeLength(),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('updateChallengeLength', () => {
    const _validChallengeLength = 4;
    const _invalidChallengeLength = 33;

    it('success', async () => {
      await verifier.updateChallengeLength(_validChallengeLength);

      const updatedChallengeLength = await verifier.getChallengeLength();
      expect(updatedChallengeLength).to.equal(_validChallengeLength);
    });

    it('failure: length too long', async () => {
      await expect(
        verifier.updateChallengeLength(_invalidChallengeLength),
      ).to.be.revertedWith('length of challenge must be <= 32');
    });

    it('failure: not contract owner', async () => {
      await expect(
        verifier
          .connect(anotherAccount)
          .updateChallengeLength(_validChallengeLength),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});

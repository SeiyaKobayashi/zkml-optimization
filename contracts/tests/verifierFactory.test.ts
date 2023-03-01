import { expect } from 'chai';
import { Contract, ContractFactory, Signer } from 'ethers';
import hre from 'hardhat';
import '@nomicfoundation/hardhat-chai-matchers';
import { Bytes32 } from 'soltypes';

describe('Verifier Contract', () => {
  const difficulty = 12;
  const testModelContentId: string = new Bytes32(
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  ).toString();
  const testModelName = 'Test Model';
  const testModelDescription = 'Description of test model.';

  let Verifier: ContractFactory;
  let verifier: Contract;
  let VerifierFactory: ContractFactory;
  let verifierFactory: Contract;
  let owner: Signer;
  let ownerAddress: string;

  beforeEach(async () => {
    [owner] = await hre.ethers.getSigners();
    ownerAddress = await owner.getAddress();

    Verifier = await hre.ethers.getContractFactory('Verifier');
    verifier = await Verifier.deploy(difficulty);
    await verifier.deployed();

    VerifierFactory = await hre.ethers.getContractFactory('VerifierFactory');
    verifierFactory = await VerifierFactory.deploy(verifier.address);
    await verifierFactory.deployed();
  });

  describe('constructor', () => {
    it('success', async () => {
      await VerifierFactory.deploy(verifier.address);

      const _verifierAddress =
        await verifierFactory.getMasterVerifierContract();
      expect(_verifierAddress).to.equal(verifier.address);
    });
  });

  describe('createChildContract', () => {
    it('success', async () => {
      const tx = await verifierFactory.createChildContract(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      const clonedVerifierContract =
        await verifierFactory.getClonedVerifierContract(testModelContentId);

      await expect(tx)
        .to.emit(verifierFactory, 'ChildContractCreated')
        .withArgs(clonedVerifierContract, testModelContentId, ownerAddress);

      const models = await verifierFactory.getModels(0, 20);
      expect(models.length).to.equal(1);

      const modelsOfOwner = await verifierFactory.getModelsByOwnerAddress(
        ownerAddress,
        0,
        20,
      );
      expect(modelsOfOwner.length).to.equal(1);
    });

    it('failure: duplicated model', async () => {
      // this call should succeed
      await verifierFactory.createChildContract(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      // this call should fail
      await expect(
        verifierFactory.createChildContract(
          testModelContentId,
          testModelName,
          testModelDescription,
        ),
      ).to.be.revertedWith('model verifier already exists');
    });

    it('failure: empty modelName', async () => {
      await expect(
        verifierFactory.createChildContract(
          testModelContentId,
          '',
          testModelDescription,
        ),
      ).to.be.revertedWith('empty modelName');
    });

    it('failure: empty modelDescription', async () => {
      await expect(
        verifierFactory.createChildContract(
          testModelContentId,
          testModelName,
          '',
        ),
      ).to.be.revertedWith('empty modelDescription');
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
      let models = await verifierFactory.getModels(0, 1);
      expect(models.length).to.equal(0);
      await expect(
        verifierFactory.getModels(testModelContentIds.length, 1),
      ).to.be.revertedWith('offset must be 0 when no items exist');

      // multiple models
      testModelContentIds.forEach(async (testModelContentId) => {
        await verifierFactory.createChildContract(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      });
      models = await verifierFactory.getModels(0, 1);
      expect(models.length).to.equal(1);
      models = await verifierFactory.getModels(0, 3);
      expect(models.length).to.equal(3);
      models = await verifierFactory.getModels(0, 5);
      expect(models.length).to.equal(3);
      models = await verifierFactory.getModels(1, 3);
      expect(models.length).to.equal(2);
    });

    it('failure: invalid offset', async () => {
      // no models
      await expect(
        verifierFactory.getModels(testModelContentIds.length, 1),
      ).to.be.revertedWith('offset must be 0 when no items exist');

      // multiple models
      await verifierFactory.createChildContract(
        testModelContentId,
        testModelName,
        testModelDescription,
      );
      await expect(
        verifierFactory.getModels(testModelContentIds.length, 1),
      ).to.be.revertedWith('offset must be < length of list of items');
    });

    it('failure: invalid limit', async () => {
      const revertMessage = 'limit must be > 0 and <= 30';
      await expect(verifierFactory.getModels(0, 0)).to.be.revertedWith(
        revertMessage,
      );
      await expect(verifierFactory.getModels(0, 31)).to.be.revertedWith(
        revertMessage,
      );
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
        await verifierFactory.createChildContract(
          testModelContentId,
          testModelName,
          testModelDescription,
        );
      });

      let models = await verifierFactory.getModelsByOwnerAddress(
        ownerAddress,
        0,
        1,
      );
      expect(models.length).to.equal(1);
      models = await verifierFactory.getModelsByOwnerAddress(
        ownerAddress,
        0,
        3,
      );
      expect(models.length).to.equal(3);
      models = await verifierFactory.getModelsByOwnerAddress(
        ownerAddress,
        0,
        5,
      );
      expect(models.length).to.equal(3);
      models = await verifierFactory.getModelsByOwnerAddress(
        ownerAddress,
        1,
        3,
      );
      expect(models.length).to.equal(2);
    });

    it('failure: model owner not found', async () => {
      await expect(
        verifierFactory.getModelsByOwnerAddress(
          '0x0000000000000000000000000000000000000000',
          0,
          1,
        ),
      ).to.be.revertedWith('model owner not found');
    });

    it('failure: invalid offset', async () => {
      // multiple models
      await verifierFactory.createChildContract(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      await expect(
        verifierFactory.getModelsByOwnerAddress(
          ownerAddress,
          testModelContentIds.length,
          1,
        ),
      ).to.be.revertedWith('offset must be < length of list of items');
    });

    it('failure: invalid limit', async () => {
      await verifierFactory.createChildContract(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      const revertMessage = 'limit must be > 0 and <= 30';
      await expect(
        verifierFactory.getModelsByOwnerAddress(ownerAddress, 0, 0),
      ).to.be.revertedWith(revertMessage);
      await expect(
        verifierFactory.getModelsByOwnerAddress(ownerAddress, 0, 31),
      ).to.be.revertedWith(revertMessage);
    });
  });
});

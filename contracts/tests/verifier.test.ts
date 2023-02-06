import { expect } from 'chai';
import { Contract } from 'ethers';
import hre from 'hardhat';
import '@nomicfoundation/hardhat-chai-matchers';
import { Bytes32 } from 'soltypes';

describe('Verifier Contract', () => {
  let verifier: Contract;
  let ownerAddress: string;

  beforeEach(async () => {
    const [owner] = await hre.ethers.getSigners();
    ownerAddress = owner.address;
    const Verifier = await hre.ethers.getContractFactory('Verifier');
    verifier = await Verifier.deploy();
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

    it('failure: invalid limit', async () => {
      const revertMessage = 'limit must be > 0 and <= 30';
      await expect(verifier.getModels(0, 0)).to.be.revertedWith(revertMessage);
      await expect(verifier.getModels(0, 31)).to.be.revertedWith(revertMessage);
    });

    it('failure: invalid offset', async () => {
      const revertMessage = 'offset must be < length of list of models';
      await expect(
        verifier.getModels(testModelContentIds.length, 1),
      ).to.be.revertedWith(revertMessage);
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
      const revertMessage = 'model owner not found';
      await expect(
        verifier.getModelsByOwnerAddress(
          '0x0000000000000000000000000000000000000000',
          0,
          1,
        ),
      ).to.be.revertedWith(revertMessage);
    });

    it('failure: invalid limit', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111114',
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

    it('failure: invalid offset', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111115',
      ).toString();
      await verifier.registerModel(
        testModelContentId,
        testModelName,
        testModelDescription,
      );

      const revertMessage = 'offset must be < length of list of models';
      await expect(
        verifier.getModelsByOwnerAddress(ownerAddress, 5, 1),
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

    it('failure: model not found', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
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
        '0x1111111111111111111111111111111111111111111111111111111111111113',
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
        '0x1111111111111111111111111111111111111111111111111111111111111114',
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

    it('failure: model not found', async () => {
      const testModelContentId: string = new Bytes32(
        '0x1111111111111111111111111111111111111111111111111111111111111112',
      ).toString();

      await expect(
        verifier.disableModel(testModelContentId),
      ).to.be.revertedWith('model not found');
    });
  });
});

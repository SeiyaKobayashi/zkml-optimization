import { expect } from "chai";
import { Contract } from "ethers";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { Bytes32 } from 'soltypes';

describe("Verifier Contract", () => {
  let verifier: Contract;
  let ownerAddress: string;

  beforeEach(async () => {
    const [owner] = await hre.ethers.getSigners();
    ownerAddress = owner.address;
    const Verifier = await hre.ethers.getContractFactory("Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  describe("registerModel()", () => {
    const testModelName: string = "Test Model";
    const testModelDescription: string = "Description of test model.";

    it("model registration succeeds", async () => {
      const testModelCommitment: string = new Bytes32('0x1111111111111111111111111111111111111111111111111111111111111111').toString();
      const tx = await verifier.registerModel(
        testModelCommitment,
        testModelName,
        testModelDescription,
      );
      await expect(tx)
        .to.emit(verifier, "ModelRegistration")
        .withArgs(testModelCommitment, ownerAddress, testModelName, testModelDescription);

      const model = await verifier.getModelInfo(testModelCommitment);
      expect(model.name).to.equal(testModelName);
      expect(model.description).to.equal(testModelDescription);
      expect(model.owner).to.equal(ownerAddress);

      const models = await verifier.getModels("0x0000000000000000000000000000000000000000", 0, 20);
      expect(models.length).to.equal(1);

      const modelsOfOwner = await verifier.getModels(ownerAddress, 0, 20);
      expect(modelsOfOwner.length).to.equal(1);
    });

    it("model registration fails: duplicated model", async () => {
      const testModelCommitment: string = new Bytes32('0x1111111111111111111111111111111111111111111111111111111111111112').toString();
      await verifier.registerModel(
        testModelCommitment,
        testModelName,
        testModelDescription,
      );
      await expect(verifier.registerModel(
        testModelCommitment,
        testModelName,
        testModelDescription,
      )).to.be.revertedWith("model already exists");
    });

    it("model registration fails: invalid modelName", async () => {
      const testModelCommitment: string = new Bytes32('0x1111111111111111111111111111111111111111111111111111111111111113').toString();
      await expect(verifier.registerModel(
        testModelCommitment,
        "",
        testModelDescription,
      )).to.be.revertedWith("invalid modelName");
    });

    it("model registration fails: invalid modelDescription", async () => {
      const testModelCommitment: string = new Bytes32('0x1111111111111111111111111111111111111111111111111111111111111114').toString();
      await expect(verifier.registerModel(
        testModelCommitment,
        testModelName,
        "",
      )).to.be.revertedWith("invalid modelDescription");
    });
  });
});

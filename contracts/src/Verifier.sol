// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "./IVerifier.sol";

/**
 * @title Verifier contract
 * @author Seiya Kobayashi
 */
contract Verifier is IVerifier, Ownable {
    // TODO: add types

    /*
        state variables
    */
    // array of hashes & names of models
    ModelCommitment[] private models;
    // mapping of owner address to models
    mapping(address => ModelCommitment[]) private addressToModels;
    // mapping of Hash to model
    mapping(Hash => Model) private hashToModel;

    /*
        events
    */
    event ModelRegistration(
        Hash indexed hash,
        address indexed owner,
        string name,
        string description
    );

    // TODO: enable solhint
    /* solhint-disable */

    // TODO: implement constructor
    constructor() {}

    /* solhint-enable */

    // TODO: add modifiers (if necessary)

    function registerModel(
        Hash modelCommitment,
        string calldata modelName,
        string calldata modelDescription
    ) external returns (Model memory modelInfo) {
        require(
            Hash.unwrap(modelCommitment).length != 0,
            "invalid modelCommitment"
        );
        require(
            bytes(hashToModel[modelCommitment].name).length == 0,
            "model already exists"
        );
        require(bytes(modelName).length != 0, "invalid modelName");
        require(
            bytes(modelDescription).length != 0,
            "invalid modelDescription"
        );

        ModelCommitment memory _modelCommitment = ModelCommitment({
            commitment: modelCommitment,
            name: modelName
        });

        // add model to array for listing
        models.push(_modelCommitment);

        // add model to mapping for searching by address of model owner
        addressToModels[msg.sender].push(_modelCommitment);

        Model memory _model = Model({
            name: modelName,
            description: modelDescription,
            owner: msg.sender
        });

        // add model to mapping for searching by commitment
        hashToModel[modelCommitment] = _model;

        emit ModelRegistration(
            modelCommitment,
            msg.sender,
            modelName,
            modelDescription
        );

        return _model;
    }

    function getModels(
        address ownerAddress,
        uint32 offset,
        uint32 limit
    ) external view returns (ModelCommitment[] memory modelCommitments) {
        require(offset > models.length - 1 || offset < 0, "invalid offset");
        require(limit < 0, "invalid limit");

        // set default limit to 20
        if (limit == 0) {
            limit = 20;
        }

        if (ownerAddress == address(0x0)) {
            return _paginateModels(models, offset, limit);
        } else {
            return
                _paginateModels(addressToModels[ownerAddress], offset, limit);
        }
    }

    /// @dev Paginate models given array of models, offset and limit.
    function _paginateModels(
        ModelCommitment[] memory _models,
        uint32 _offset,
        uint32 _limit
    ) internal pure returns (ModelCommitment[] memory modelCommitments) {
        if (_offset + _limit > _models.length) {
            _limit = uint32(_models.length - _offset);
        }

        ModelCommitment[] memory _slicedModels = new ModelCommitment[](_limit);
        for (uint256 i = 0; i < _limit; i++) {
            _slicedModels[i] = _models[_offset + i];
        }

        return _slicedModels;
    }

    function getModelInfo(
        Hash modelCommitment
    ) external view returns (Model memory modelInfo) {
        require(
            Hash.unwrap(modelCommitment).length != 0,
            "invalid modelCommitment"
        );
        require(
            bytes(hashToModel[modelCommitment].name).length != 0,
            "model not found"
        );

        return hashToModel[modelCommitment];
    }

    // TODO: enable solhint
    /* solhint-disable */

    // TODO: implement function
    function commit(
        bytes32 commitmentModel,
        bytes32 commitmentData,
        bytes32 commitmentResults
    ) external returns (uint256 commitmentId, bytes32 challenge) {}

    // TODO: implement function
    function reveal(
        uint256 commitmentId,
        MerkleProof[] calldata merkleProofs
    ) external view returns (Hash[] memory verifiedNodes) {}

    // TODO: implement function
    function verify(
        uint256 commitmentId,
        Zkp[] memory zkps
    ) external returns (ZkpWithValidity[] memory zkpVerifications) {}

    /* solhint-enable */
}

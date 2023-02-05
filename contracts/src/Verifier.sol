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

    // array of content IDs of models
    Hash[] private models;
    // mapping of owner address to array of content IDs of models
    mapping(address => Hash[]) private ownerAddressToModels;
    // mapping of content ID of model to model details
    mapping(Hash => Model) private contentIdToModel;

    /*
        events
    */

    // event to be emitted when a model is registered
    event ModelRegistered(Hash indexed contentId, address indexed ownerAddress);
    // event to be emitted when a model is updated
    event ModelUpdated(
        Hash indexed contentId,
        address indexed ownerAddress,
        string name,
        string description
    );
    // event to be emitted when a model is disabled
    event ModelDisabled(Hash indexed contentId, address indexed ownerAddress);

    /*
        modifiers
    */

    modifier validateModelParameters(
        string calldata modelName,
        string calldata modelDescription
    ) {
        require(bytes(modelName).length != 0, "empty modelName");
        require(bytes(modelDescription).length != 0, "empty modelDescription");
        _;
    }

    modifier checkIfModelExists(Hash modelContentId) {
        require(
            bytes(contentIdToModel[modelContentId].name).length != 0,
            "model not found"
        );
        _;
    }

    modifier validateLimitParameter(uint32 limit) {
        require(limit > 0 && limit <= 30, "limit must be > 0 and <= 30");
        _;
    }

    modifier isModelOwner(Hash modelContentId) {
        require(
            contentIdToModel[modelContentId].ownerAddress == msg.sender,
            "only model owner can execute");
        _;
    }

    // TODO: enable solhint
    /* solhint-disable */

    // TODO: implement constructor
    constructor() {}

    /* solhint-enable */

    function registerModel(
        Hash modelContentId,
        string calldata modelName,
        string calldata modelDescription
    )
        external
        validateModelParameters(modelName, modelDescription)
        returns (Model memory model)
    {
        require(
            bytes(contentIdToModel[modelContentId].name).length == 0,
            "model already exists"
        );

        models.push(modelContentId);
        ownerAddressToModels[msg.sender].push(modelContentId);
        Model memory _model = Model({
            contentId: modelContentId,
            name: modelName,
            description: modelDescription,
            ownerAddress: msg.sender,
            isDisabled: false
        });
        contentIdToModel[modelContentId] = _model;

        emit ModelRegistered(modelContentId, msg.sender);

        return _model;
    }

    function getModel(
        Hash modelContentId
    )
        external
        view
        checkIfModelExists(modelContentId)
        returns (Model memory model)
    {
        return contentIdToModel[modelContentId];
    }

    function getModels(
        uint32 offset,
        uint32 limit
    )
        external
        view
        validateLimitParameter(limit)
        returns (ModelArrayElement[] memory paginatedModels)
    {
        require(
            offset >= 0 && offset < models.length,
            "offset must >= 0 and < length of list of models"
        );

        return _paginateModels(models, offset, limit);
    }

    function getModelsByOwnerAddress(
        address ownerAddress,
        uint32 offset,
        uint32 limit
    )
        external
        view
        validateLimitParameter(limit)
        returns (ModelArrayElement[] memory paginatedModels)
    {
        require(
            ownerAddressToModels[ownerAddress].length != 0,
            "model owner not found"
        );
        require(
            offset >= 0 && offset < ownerAddressToModels[ownerAddress].length,
            "offset must >= 0 and < length of list of models"
        );

        return
            _paginateModels(ownerAddressToModels[ownerAddress], offset, limit);
    }

    /// @dev Paginate models given array of models, offset and limit.
    function _paginateModels(
        Hash[] memory _modelContentIds,
        uint32 _offset,
        uint32 _limit
    ) internal view returns (ModelArrayElement[] memory paginatedModels) {
        if (_offset + _limit > _modelContentIds.length) {
            _limit = uint32(_modelContentIds.length - _offset);
        }

        ModelArrayElement[] memory _paginatedModels = new ModelArrayElement[](
            _limit
        );
        for (uint32 i = 0; i < _limit; i++) {
            Model memory _model = contentIdToModel[
                _modelContentIds[_offset + i]
            ];
            _paginatedModels[i] = ModelArrayElement({
                contentId: _model.contentId,
                name: _model.name
            });
        }

        return _paginatedModels;
    }

    function updateModel(
        Hash modelContentId,
        string calldata modelName,
        string calldata modelDescription
    )
        external
        checkIfModelExists(modelContentId)
        isModelOwner(modelContentId)
        validateModelParameters(modelName, modelDescription)
        returns (Model memory model)
    {
        contentIdToModel[modelContentId].name = modelName;
        contentIdToModel[modelContentId].description = modelDescription;

        return contentIdToModel[modelContentId];
    }

    function disableModel(
        Hash modelContentId
    )
        external
        checkIfModelExists(modelContentId)
        isModelOwner(modelContentId)
        returns (Model memory model)
    {
        contentIdToModel[modelContentId].isDisabled = true;

        return contentIdToModel[modelContentId];
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

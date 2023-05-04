// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "./CloneFactory.sol";
import "./ICustomVerifier.sol";
import "./IVerifierFactory.sol";
import "./CustomVerifier.sol";

/**
 * @title Verifier factory contract
 * @author Seiya Kobayashi
 */
contract VerifierFactory is IVerifierFactory, CloneFactory {
    /*
        state variables
    */

    // address of verifier contract in which subsequent child contracts execute delegatecalls
    address private verifierContract;

    // array of models
    ModelArrayElement[] private models;
    // mapping of owner address to array of models
    mapping(address => ModelArrayElement[]) private ownerAddressToModels;
    // mapping of content ID of model to model verifier address
    mapping(ICustomVerifier.Hash => address) private contentIdToVerifierAddress;

    /*
        events
    */

    // event to be emitted when a new child contract is deployed
    event ChildContractCreated(
        address indexed contractAddress,
        ICustomVerifier.Hash indexed modelContentId,
        address indexed modelOwnerAddress
    );

    /*
        modifiers
    */

    modifier validateModelParameters(
        string calldata _modelName,
        string calldata _modelDescription
    ) {
        require(bytes(_modelName).length != 0, "empty modelName");
        require(bytes(_modelDescription).length != 0, "empty modelDescription");
        _;
    }

    modifier validateOffsetParameter(uint32 _offset, uint _length) {
        if (_length > 0) {
            require(
                _offset < _length,
                "offset must be < length of list of items"
            );
        } else {
            require(_offset == 0, "offset must be 0 when no items exist");
        }
        _;
    }

    modifier validateLimitParameter(uint32 _limit) {
        require(_limit > 0 && _limit <= 30, "limit must be > 0 and <= 30");
        _;
    }

    modifier checkIfModelOwnerExists(address _ownerAddress) {
        require(
            ownerAddressToModels[_ownerAddress].length != 0,
            "model owner not found"
        );
        _;
    }

    /*
        constructor
    */

    constructor(address _verifierContract) {
        verifierContract = _verifierContract;
    }

    /*
        functions
    */

    function createChildContract(
        ICustomVerifier.Hash _modelContentId,
        string calldata _modelName,
        string calldata _modelDescription
    ) external validateModelParameters(_modelName, _modelDescription) {
        require(
            contentIdToVerifierAddress[_modelContentId] == address(0),
            "model verifier already exists"
        );

        address verifierContractAddress = createClone(verifierContract);
        contentIdToVerifierAddress[_modelContentId] = verifierContractAddress;
        CustomVerifier verifier = CustomVerifier(verifierContractAddress);

        verifier.registerModel(
            _modelContentId,
            _modelName,
            _modelDescription,
            msg.sender
        );

        ModelArrayElement memory _model = ModelArrayElement({
            contentId: _modelContentId,
            name: _modelName,
            contractAddress: verifierContractAddress
        });
        models.push(_model);
        ownerAddressToModels[msg.sender].push(_model);

        emit ChildContractCreated(
            verifierContractAddress,
            _modelContentId,
            msg.sender
        );
    }

    function getModels(
        uint32 _offset,
        uint32 _limit
    )
        external
        view
        validateOffsetParameter(_offset, models.length)
        validateLimitParameter(_limit)
        returns (ModelArrayElement[] memory)
    {
        return _paginateModels(models, _offset, _limit);
    }

    function getModelsByOwnerAddress(
        address _ownerAddress,
        uint32 _offset,
        uint32 _limit
    )
        external
        view
        checkIfModelOwnerExists(_ownerAddress)
        validateOffsetParameter(
            _offset,
            ownerAddressToModels[_ownerAddress].length
        )
        validateLimitParameter(_limit)
        returns (ModelArrayElement[] memory)
    {
        return
            _paginateModels(
                ownerAddressToModels[_ownerAddress],
                _offset,
                _limit
            );
    }

    function getMasterVerifierContract() external view returns (address) {
        return verifierContract;
    }

    function getClonedVerifierContract(
        ICustomVerifier.Hash _modelContentId
    ) external view returns (address) {
        require(
            contentIdToVerifierAddress[_modelContentId] != address(0),
            "model verifier not found"
        );

        return contentIdToVerifierAddress[_modelContentId];
    }

    /// @dev Paginate models given array of models, offset and limit.
    function _paginateModels(
        ModelArrayElement[] memory _models,
        uint32 _offset,
        uint32 _limit
    ) internal pure returns (ModelArrayElement[] memory) {
        if (_offset + _limit > _models.length) {
            _limit = uint32(_models.length - _offset);
        }

        ModelArrayElement[] memory _paginatedModels = new ModelArrayElement[](
            _limit
        );
        for (uint32 i = 0; i < _limit; i++) {
            _paginatedModels[i] = _models[_offset + i];
        }

        return _paginatedModels;
    }
}

// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "./IVerifier.sol";
import "./libraries/Bytes.sol";
import "./libraries/Challenge.sol";
import "./libraries/MerkleTree.sol";

/**
 * @title Verifier contract
 * @author Seiya Kobayashi
 */
contract Verifier is IVerifier, Ownable {
    /*
        state variables
    */

    // difficulty (number of digits in base 16) of challenge
    uint8 private difficulty;

    // array of content IDs of models
    Hash[] private models;
    // mapping of owner address to array of content IDs of models
    mapping(address => Hash[]) private ownerAddressToModels;
    // mapping of content ID of model to model details
    mapping(Hash => Model) private contentIdToModel;

    // mapping of content ID of model to array of commitment IDs
    mapping(Hash => Hash[]) private commitments;
    // mapping of prover address to array of commitment IDs
    mapping(address => Hash[]) private proverAddressToCommitments;
    // mapping of commitment ID of commitment details
    mapping(Hash => Commitment) private commitmentIdToCommitment;

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

    // event to be emitted when a commitment is added
    event Committed(Hash indexed commitmentId, address indexed proverAddress);
    // event to be emitted when challenge of a commitment is updated
    event ChallengeUpdated(
        Hash indexed commitmentId,
        address indexed proverAddress
    );
    // event to be emitted when a commitment is revealed
    event CommitmentRevealed(
        Hash indexed commitmentId,
        address indexed proverAddress
    );

    /*
        modifiers
    */

    modifier isValidDifficulty(uint8 _difficulty) {
        require(_difficulty != 0, "difficulty cannot be 0");
        _;
    }

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

    modifier validateOffsetParameter(uint32 offset, uint length) {
        if (length > 0) {
            require(
                offset < length,
                "offset must be < length of list of items"
            );
        } else {
            require(offset == 0, "offset must be 0 when no items exist");
        }
        _;
    }

    modifier validateLimitParameter(uint32 limit) {
        require(limit > 0 && limit <= 30, "limit must be > 0 and <= 30");
        _;
    }

    modifier checkIfModelOwnerExists(address ownerAddress) {
        require(
            ownerAddressToModels[ownerAddress].length != 0,
            "model owner not found"
        );
        _;
    }

    modifier isModelOwner(Hash modelContentId) {
        require(
            contentIdToModel[modelContentId].ownerAddress == msg.sender,
            "only model owner can execute"
        );
        _;
    }

    modifier checkIfCommitmentExists(Hash commitmentId) {
        require(
            Hash.unwrap(commitmentIdToCommitment[commitmentId].id) != "",
            "commitment not found"
        );
        _;
    }

    modifier isValidProver(address proverAddress) {
        require(proverAddress == msg.sender, "invalid prover");
        _;
    }

    /*
        constructor
    */

    constructor(uint8 _difficulty) isValidDifficulty(_difficulty) {
        difficulty = _difficulty;
    }

    /*
        functions
    */

    function registerModel(
        Hash _modelContentId,
        string calldata _modelName,
        string calldata _modelDescription
    )
        external
        validateModelParameters(_modelName, _modelDescription)
        returns (Model memory)
    {
        require(
            bytes(contentIdToModel[_modelContentId].name).length == 0,
            "model already exists"
        );

        models.push(_modelContentId);
        ownerAddressToModels[msg.sender].push(_modelContentId);
        Model memory _model = Model({
            contentId: _modelContentId,
            name: _modelName,
            description: _modelDescription,
            ownerAddress: msg.sender,
            isDisabled: false
        });
        contentIdToModel[_modelContentId] = _model;

        emit ModelRegistered(_modelContentId, msg.sender);

        return _model;
    }

    function getModel(
        Hash _modelContentId
    ) external view checkIfModelExists(_modelContentId) returns (Model memory) {
        return contentIdToModel[_modelContentId];
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

    function updateModel(
        Hash _modelContentId,
        string calldata _modelName,
        string calldata _modelDescription
    )
        external
        checkIfModelExists(_modelContentId)
        isModelOwner(_modelContentId)
        validateModelParameters(_modelName, _modelDescription)
    {
        contentIdToModel[_modelContentId].name = _modelName;
        contentIdToModel[_modelContentId].description = _modelDescription;
    }

    function disableModel(
        Hash _modelContentId
    )
        external
        checkIfModelExists(_modelContentId)
        isModelOwner(_modelContentId)
    {
        contentIdToModel[_modelContentId].isDisabled = true;
    }

    function commit(
        Hash _modelContentId,
        Hash _merkleRoot
    ) external checkIfModelExists(_modelContentId) returns (Hash, Hash, uint8) {
        Hash _commitmentId = _generateCommitmentId(
            _modelContentId,
            _merkleRoot
        );
        Hash _challenge = Hash.wrap(Challenge.generateChallenge(difficulty));
        uint8 _difficulty = difficulty;

        commitments[_modelContentId].push(_commitmentId);
        proverAddressToCommitments[msg.sender].push(_commitmentId);
        commitmentIdToCommitment[_commitmentId] = Commitment({
            id: _commitmentId,
            modelContentId: _modelContentId,
            merkleRoot: _merkleRoot,
            challenge: _challenge,
            difficulty: _difficulty,
            proverAddress: msg.sender,
            isRevealed: false
        });

        emit Committed(_commitmentId, msg.sender);

        return (_commitmentId, _challenge, _difficulty);
    }

    function getCommitment(
        Hash _commitmentId
    )
        external
        view
        checkIfCommitmentExists(_commitmentId)
        onlyOwner
        returns (Commitment memory)
    {
        return commitmentIdToCommitment[_commitmentId];
    }

    function getCommitmentsOfModel(
        Hash _modelContentId,
        uint32 _offset,
        uint32 _limit
    )
        external
        view
        checkIfModelExists(_modelContentId)
        validateOffsetParameter(_offset, commitments[_modelContentId].length)
        validateLimitParameter(_limit)
        onlyOwner
        returns (Hash[] memory)
    {
        return
            _paginateCommitments(commitments[_modelContentId], _offset, _limit);
    }

    function getCommitmentsOfProver(
        address _proverAddress,
        uint32 _offset,
        uint32 _limit
    )
        external
        view
        validateOffsetParameter(
            _offset,
            proverAddressToCommitments[_proverAddress].length
        )
        validateLimitParameter(_limit)
        isValidProver(_proverAddress)
        returns (Hash[] memory)
    {
        return
            _paginateCommitments(
                proverAddressToCommitments[_proverAddress],
                _offset,
                _limit
            );
    }

    function updateChallenge(
        Hash _commitmentId
    )
        external
        checkIfCommitmentExists(_commitmentId)
        isValidProver(commitmentIdToCommitment[_commitmentId].proverAddress)
        returns (Hash)
    {
        uint8 _difficulty = difficulty;
        Hash _challenge = Hash.wrap(Challenge.generateChallenge(_difficulty));
        commitmentIdToCommitment[_commitmentId].challenge = _challenge;
        commitmentIdToCommitment[_commitmentId].difficulty = _difficulty;

        emit ChallengeUpdated(_commitmentId, msg.sender);

        return _challenge;
    }

    function getDifficulty() external view onlyOwner returns (uint8) {
        return difficulty;
    }

    function updateDifficulty(
        uint8 _difficulty
    ) external isValidDifficulty(_difficulty) onlyOwner {
        difficulty = _difficulty;
    }

    function reveal(
        Hash _commitmentId,
        bytes32[] calldata _merkleProofs,
        bool[] calldata _proofFlags,
        bytes32[] memory _leaves
    )
        external
        checkIfCommitmentExists(_commitmentId)
        isValidProver(commitmentIdToCommitment[_commitmentId].proverAddress)
    {
        require(
            commitmentIdToCommitment[_commitmentId].isRevealed == false,
            "commitment already revealed"
        );

        bytes32 _challenge = Hash.unwrap(
            commitmentIdToCommitment[_commitmentId].challenge
        );
        uint8 _difficulty = commitmentIdToCommitment[_commitmentId].difficulty;
        require(
            MerkleTree.verifyLeaves(_challenge, _difficulty, _leaves) == true,
            "invalid leaves"
        );

        bytes32 _merkleRoot = Hash.unwrap(
            commitmentIdToCommitment[_commitmentId].merkleRoot
        );

        require(
            MerkleTree.verifyMerkleProofs(
                _merkleProofs,
                _proofFlags,
                _merkleRoot,
                _leaves
            ) == true,
            "invalid Merkle proofs"
        );

        commitmentIdToCommitment[_commitmentId].isRevealed = true;

        emit CommitmentRevealed(_commitmentId, msg.sender);
    }

    // TODO: enable solhint
    /* solhint-disable */

    // TODO: implement function
    function verify(
        uint256 commitmentId,
        Zkp[] memory zkps
    ) external returns (ZkpWithValidity[] memory zkpVerifications) {}

    /* solhint-enable */

    /// @dev Paginate models given array of models, offset and limit.
    function _paginateModels(
        Hash[] memory _modelContentIds,
        uint32 _offset,
        uint32 _limit
    ) internal view returns (ModelArrayElement[] memory) {
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

    /// @dev Paginate commitments given array of commitment IDs, offset and limit.
    function _paginateCommitments(
        Hash[] memory _commitmentIds,
        uint32 _offset,
        uint32 _limit
    ) internal pure returns (Hash[] memory) {
        if (_offset + _limit > _commitmentIds.length) {
            _limit = uint32(_commitmentIds.length - _offset);
        }

        Hash[] memory _paginatedCommitments = new Hash[](_limit);
        for (uint32 i = 0; i < _limit; i++) {
            _paginatedCommitments[i] = _commitmentIds[_offset + i];
        }

        return _paginatedCommitments;
    }

    /**
     * @notice Generate commitment ID.
     * @dev Duplicated commitment ID is not allowed.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _merkleRoot Root hash of Merkle tree
     * @return commitmentId Commitment ID
     */
    function _generateCommitmentId(
        Hash _modelContentId,
        Hash _merkleRoot
    ) internal view returns (Hash) {
        Hash _commitmentId = Hash.wrap(
            keccak256(
                abi.encodePacked(_modelContentId, _merkleRoot, msg.sender)
            )
        );

        require(
            Hash.unwrap(commitmentIdToCommitment[_commitmentId].id) == "",
            "commitment already exists"
        );

        return _commitmentId;
    }
}

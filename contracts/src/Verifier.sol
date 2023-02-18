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

    // number of digits (in base 16) of challenge
    uint8 private challengeLength;

    // array of content IDs of models
    Hash[] private models;
    // mapping of owner address to array of content IDs of models
    mapping(address => Hash[]) private ownerAddressToModels;
    // mapping of content ID of model to model details
    mapping(Hash => Model) private contentIdToModel;

    // mapping of content ID of model to array of commit IDs
    mapping(Hash => Hash[]) private commits;
    // mapping of prover address to array of commit IDs
    mapping(address => Hash[]) private proverAddressToCommits;
    // mapping of commit ID of commit details
    mapping(Hash => Commit) private commitIdToCommit;

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

    // event to be emitted when a commit is added
    event CommitAdded(Hash indexed commitId, address indexed proverAddress);
    // event to be emitted when challenge of a commit is updated
    event ChallengeUpdated(
        Hash indexed commitId,
        address indexed proverAddress
    );
    // event to be emitted when a commit is revealed
    event CommitRevealed(Hash indexed commitId, address indexed proverAddress);

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

    modifier checkIfCommitExists(Hash commitId) {
        require(
            Hash.unwrap(commitIdToCommit[commitId].id) != "",
            "commit not found"
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

    constructor(uint8 _challengeLength) {
        challengeLength = _challengeLength;
    }

    /*
        functions
    */

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
        validateOffsetParameter(offset, models.length)
        validateLimitParameter(limit)
        returns (ModelArrayElement[] memory paginatedModels)
    {
        return _paginateModels(models, offset, limit);
    }

    function getModelsByOwnerAddress(
        address ownerAddress,
        uint32 offset,
        uint32 limit
    )
        external
        view
        checkIfModelOwnerExists(ownerAddress)
        validateOffsetParameter(
            offset,
            ownerAddressToModels[ownerAddress].length
        )
        validateLimitParameter(limit)
        returns (ModelArrayElement[] memory paginatedModels)
    {
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
    {
        contentIdToModel[modelContentId].name = modelName;
        contentIdToModel[modelContentId].description = modelDescription;
    }

    function disableModel(
        Hash modelContentId
    ) external checkIfModelExists(modelContentId) isModelOwner(modelContentId) {
        contentIdToModel[modelContentId].isDisabled = true;
    }

    function commit(
        Hash _modelContentId,
        Hash _merkleRoot
    )
        external
        checkIfModelExists(_modelContentId)
        returns (Hash commitId, bytes memory challenge)
    {
        Hash _commitId = _generateCommitId(_modelContentId, _merkleRoot);
        bytes memory _challenge = Challenge.generateChallenge(challengeLength);

        commits[_modelContentId].push(_commitId);
        proverAddressToCommits[msg.sender].push(_commitId);
        commitIdToCommit[_commitId] = Commit({
            id: _commitId,
            modelContentId: _modelContentId,
            merkleRoot: _merkleRoot,
            challenge: _challenge,
            proverAddress: msg.sender,
            isRevealed: false
        });

        emit CommitAdded(_commitId, msg.sender);

        return (_commitId, _challenge);
    }

    /// @dev Duplicated commit ID is not allowed
    function _generateCommitId(
        Hash _modelContentId,
        Hash _merkleRoot
    ) internal view returns (Hash commitId) {
        Hash _commitId = Hash.wrap(
            keccak256(
                abi.encodePacked(_modelContentId, _merkleRoot, msg.sender)
            )
        );

        require(
            Hash.unwrap(commitIdToCommit[_commitId].id) == "",
            "commit already exists"
        );

        return _commitId;
    }

    function getCommit(
        Hash _commitId
    )
        external
        view
        checkIfCommitExists(_commitId)
        onlyOwner
        returns (Commit memory)
    {
        return commitIdToCommit[_commitId];
    }

    function getCommitsOfModel(
        Hash _modelContentId,
        uint32 _offset,
        uint32 _limit
    )
        external
        view
        checkIfModelExists(_modelContentId)
        validateOffsetParameter(_offset, commits[_modelContentId].length)
        validateLimitParameter(_limit)
        onlyOwner
        returns (Hash[] memory)
    {
        return _paginateCommits(commits[_modelContentId], _offset, _limit);
    }

    function getCommitsOfProver(
        address _proverAddress,
        uint32 _offset,
        uint32 _limit
    )
        external
        view
        validateOffsetParameter(
            _offset,
            proverAddressToCommits[_proverAddress].length
        )
        validateLimitParameter(_limit)
        isValidProver(_proverAddress)
        returns (Hash[] memory)
    {
        return
            _paginateCommits(
                proverAddressToCommits[_proverAddress],
                _offset,
                _limit
            );
    }

    /// @dev Paginate commits given array of commit IDs, offset and limit.
    function _paginateCommits(
        Hash[] memory _commitIds,
        uint32 _offset,
        uint32 _limit
    ) internal pure returns (Hash[] memory paginatedCommits) {
        if (_offset + _limit > _commitIds.length) {
            _limit = uint32(_commitIds.length - _offset);
        }

        Hash[] memory _paginatedCommits = new Hash[](_limit);
        for (uint32 i = 0; i < _limit; i++) {
            _paginatedCommits[i] = _commitIds[_offset + i];
        }

        return _paginatedCommits;
    }

    function updateChallenge(
        Hash _commitId
    )
        external
        checkIfCommitExists(_commitId)
        isValidProver(commitIdToCommit[_commitId].proverAddress)
        returns (bytes memory challenge)
    {
        bytes memory _challenge = Challenge.generateChallenge(challengeLength);
        commitIdToCommit[_commitId].challenge = _challenge;

        emit ChallengeUpdated(_commitId, msg.sender);

        return _challenge;
    }

    function getChallengeLength() external view onlyOwner returns (uint8) {
        return challengeLength;
    }

    function updateChallengeLength(uint8 _challengeLength) external onlyOwner {
        require(_challengeLength <= 32, "length of challenge must be <= 32");

        challengeLength = _challengeLength;
    }

    function reveal(
        Hash _commitId,
        bytes32[] calldata _merkleProofs,
        bool[] calldata _proofFlags,
        bytes32[] memory _leaves
    )
        external
        checkIfCommitExists(_commitId)
        isValidProver(commitIdToCommit[_commitId].proverAddress)
        returns (bool commitRevealed)
    {
        bytes memory _challenge = commitIdToCommit[_commitId].challenge;
        bool _leavesVerified = MerkleTree.verifyLeaves(_challenge, _leaves);

        require(_leavesVerified == true, "invalid leaves");

        bytes32 _merkleRoot = Hash.unwrap(
            commitIdToCommit[_commitId].merkleRoot
        );
        bool _commitRevealed = MerkleTree.verifyMerkleProofs(
            _merkleProofs,
            _proofFlags,
            _merkleRoot,
            _leaves
        );

        require(_commitRevealed == true, "invalid Merkle proofs");

        commitIdToCommit[_commitId].isRevealed = _commitRevealed;

        emit CommitRevealed(_commitId, msg.sender);

        return _commitRevealed;
    }

    // TODO: enable solhint
    /* solhint-disable */

    // TODO: implement function
    function verify(
        uint256 commitmentId,
        Zkp[] memory zkps
    ) external returns (ZkpWithValidity[] memory zkpVerifications) {}

    /* solhint-enable */
}

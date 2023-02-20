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
    uint256 private difficulty;

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

    constructor(uint8 _difficulty) {
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
    )
        external
        checkIfModelExists(_modelContentId)
        returns (Hash, Hash, uint256)
    {
        Hash _commitId = _generateCommitId(_modelContentId, _merkleRoot);
        Hash _challenge = Hash.wrap(Challenge.generateChallenge(difficulty));
        uint256 _difficulty = difficulty;

        commits[_modelContentId].push(_commitId);
        proverAddressToCommits[msg.sender].push(_commitId);
        commitIdToCommit[_commitId] = Commit({
            id: _commitId,
            modelContentId: _modelContentId,
            merkleRoot: _merkleRoot,
            challenge: _challenge,
            difficulty: _difficulty,
            proverAddress: msg.sender,
            isRevealed: false
        });

        emit CommitAdded(_commitId, msg.sender);

        return (_commitId, _challenge, _difficulty);
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

    function updateChallenge(
        Hash _commitId
    )
        external
        checkIfCommitExists(_commitId)
        isValidProver(commitIdToCommit[_commitId].proverAddress)
        returns (Hash)
    {
        uint256 _difficulty = difficulty;
        Hash _challenge = Hash.wrap(Challenge.generateChallenge(_difficulty));
        commitIdToCommit[_commitId].challenge = _challenge;
        commitIdToCommit[_commitId].difficulty = _difficulty;

        emit ChallengeUpdated(_commitId, msg.sender);

        return _challenge;
    }

    function getDifficulty() external view onlyOwner returns (uint256) {
        return difficulty;
    }

    function updateDifficulty(uint256 _difficulty) external onlyOwner {
        require(_difficulty <= 256, "difficulty must be <= 256");

        difficulty = _difficulty;
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
    {
        require(
            commitIdToCommit[_commitId].isRevealed == false,
            "commit already revealed"
        );

        bytes32 _challenge = Hash.unwrap(commitIdToCommit[_commitId].challenge);
        uint256 _difficulty = commitIdToCommit[_commitId].difficulty;
        require(
            MerkleTree.verifyLeaves(_challenge, _difficulty, _leaves) == true,
            "invalid leaves"
        );

        bytes32 _merkleRoot = Hash.unwrap(
            commitIdToCommit[_commitId].merkleRoot
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

        commitIdToCommit[_commitId].isRevealed = true;

        emit CommitRevealed(_commitId, msg.sender);
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

    /// @dev Paginate commits given array of commit IDs, offset and limit.
    function _paginateCommits(
        Hash[] memory _commitIds,
        uint32 _offset,
        uint32 _limit
    ) internal pure returns (Hash[] memory) {
        if (_offset + _limit > _commitIds.length) {
            _limit = uint32(_commitIds.length - _offset);
        }

        Hash[] memory _paginatedCommits = new Hash[](_limit);
        for (uint32 i = 0; i < _limit; i++) {
            _paginatedCommits[i] = _commitIds[_offset + i];
        }

        return _paginatedCommits;
    }

    /**
     * @notice Generate commit ID.
     * @dev Duplicated commit ID is not allowed.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _merkleRoot Root hash of Merkle tree
     * @return commitId Commit ID
     */
    function _generateCommitId(
        Hash _modelContentId,
        Hash _merkleRoot
    ) internal view returns (Hash) {
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
}

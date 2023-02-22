// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

/**
 * @title Interface of Verifier contract
 * @author Seiya Kobayashi
 */
interface IVerifier {
    /// @dev Type of keccak256 hash
    type Hash is bytes32;

    /// @dev Holds model details
    struct Model {
        Hash contentId;
        string name;
        string description;
        address ownerAddress;
        bool isDisabled;
    }

    /// @dev Holds simplified model details
    struct ModelArrayElement {
        Hash contentId;
        string name;
    }

    /// @dev Holds commit details
    struct Commit {
        Hash id;
        Hash modelContentId;
        Hash merkleRoot;
        Hash challenge;
        uint8 difficulty;
        address proverAddress;
        bool isRevealed;
    }

    // TODO: check exact types
    /// @dev Holds ZKP
    struct Zkp {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[16] input;
    }

    // TODO: check exact types
    /// @dev Holds ZKP and its validity
    struct ZkpWithValidity {
        Zkp zkp;
        bool isValid;
    }

    /**
     * @notice Register a model.
     * @dev Registered model is enabled by default.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _modelName Name of model
     * @param _modelDescription Description of model
     * @return model Registered model
     */
    function registerModel(
        Hash _modelContentId,
        string calldata _modelName,
        string calldata _modelDescription
    ) external returns (Model memory);

    /**
     * @notice Get info of the requested model.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @return model Info of the requested model
     */
    function getModel(
        Hash _modelContentId
    ) external view returns (Model memory);

    /**
     * @notice Get the list of models registered.
     * @dev Max value of `limit` parameter is 30 for the sake of performance.
     * @param _offset Starting index of array of models to be fetched
     * @param _limit Number of models to be fetched
     * @return models List of models
     */
    function getModels(
        uint32 _offset,
        uint32 _limit
    ) external view returns (ModelArrayElement[] memory);

    /**
     * @notice Get the list of models registered by the specified owner.
     * @dev Max value of `limit` parameter is 30 for the sake of performance.
     * @param _ownerAddress Address of model owner
     * @param _offset Starting index of array of models to be fetched
     * @param _limit Number of models to be fetched
     * @return models List of models
     */
    function getModelsByOwnerAddress(
        address _ownerAddress,
        uint32 _offset,
        uint32 _limit
    ) external view returns (ModelArrayElement[] memory);

    /**
     * @notice Update info of the requested model.
     * @dev 'contentId' & 'ownerAddress' cannot be updated.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _modelName Updated name of model
     * @param _modelDescription Updated description of model
     */
    function updateModel(
        Hash _modelContentId,
        string calldata _modelName,
        string calldata _modelDescription
    ) external;

    /**
     * @notice Disable the requested model.
     * @dev Model is logically disabled.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     */
    function disableModel(Hash _modelContentId) external;

    /**
     * @notice Store commit of testing results, and generate a challenge in return.
     * @dev 'commitId' is generated from '_modelContentId', '_merkleRoot' and sender's address.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _merkleRoot Root hash of Merkle tree of testing results
     * @return commitId Commit ID
     * @return challenge Challenge
     * @return difficulty Difficulty of challenge
     */
    function commit(
        Hash _modelContentId,
        Hash _merkleRoot
    ) external returns (Hash, Hash, uint8);

    /**
     * @notice Get commit details.
     * @dev This function can only be callable by the contract owner.
     * @param _commitId Commit ID
     * @return commit Commit details
     */
    function getCommit(Hash _commitId) external view returns (Commit memory);

    /**
     * @notice Get commit IDs of the specified model.
     * @dev This function can only be callable by the contract owner.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _offset Starting index of array of commits to be fetched
     * @param _limit Number of commits to be fetched
     * @return commits Array of commit IDs
     */
    function getCommitsOfModel(
        Hash _modelContentId,
        uint32 _offset,
        uint32 _limit
    ) external view returns (Hash[] memory);

    /**
     * @notice Get commit IDs of the specified prover.
     * @param _proverAddress Address of prover
     * @param _offset Starting index of array of commits to be fetched
     * @param _limit Number of commits to fetch
     * @return commits Array of commit IDs
     */
    function getCommitsOfProver(
        address _proverAddress,
        uint32 _offset,
        uint32 _limit
    ) external view returns (Hash[] memory);

    /**
     * @notice Update challenge of the specified commit.
     * @param _commitId Commit ID
     * @return challenge Updated challenge
     */
    function updateChallenge(Hash _commitId) external returns (Hash);

    /**
     * @notice Get difficulty of challenge (number of bits of challenge to be verified).
     * @dev This function can only be callable by the contract owner.
     * @return difficulty Difficulty of challenge
     */
    function getDifficulty() external view returns (uint8);

    /**
     * @notice Update difficulty of challenge (number of bits of challenge to be verified).
     * @dev This function can only be callable by the contract owner.
     *      Already generated (committed) challenges must not be modified.
     *      Max value is 256, because bytes32 consists of 256 bits.
     * @param _difficulty Difficulty of challenge
     */
    function updateDifficulty(uint8 _difficulty) external;

    /**
     * @notice Verify Merkle proofs of leaves matched with the challenge.
     * @param _commitId commit ID
     * @param _merkleProofs Array of Merkle proofs
     * @param _proofFlags Array of proof flags
     * @param _leaves Array of Merkle leaves
     */
    function reveal(
        Hash _commitId,
        bytes32[] calldata _merkleProofs,
        bool[] calldata _proofFlags,
        bytes32[] memory _leaves
    ) external;

    /**
     * @notice Receives and verifies ZKPs.
     * @dev Come up with a way to efficiently store verified ZKPs in smart contract (to be used by external contracts).
     * @param commitmentId commitment ID
     * @param zkps Array of client-generated ZKPs
     * @return zkpVerifications Array of validity of ZKPs
     */
    function verify(
        uint256 commitmentId,
        Zkp[] memory zkps
    ) external returns (ZkpWithValidity[] memory zkpVerifications);
}

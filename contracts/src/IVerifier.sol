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
        bytes challenge;
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
     * @notice Register a model in the verifier contract.
     * @dev Registered model is enabled by default.
     * @param modelContentId Hash (content ID / address of IPFS) of model
     * @param modelName Name of model
     * @param modelDescription Description of model
     * @return model Registered model
     */
    function registerModel(
        Hash modelContentId,
        string calldata modelName,
        string calldata modelDescription
    ) external returns (Model memory model);

    /**
     * @notice Get info of the requested model.
     * @param modelContentId Hash (content ID / address of IPFS) of model
     * @return model Info of the requested model
     */
    function getModel(
        Hash modelContentId
    ) external view returns (Model memory model);

    /**
     * @notice Get the list of models registered.
     * @dev Max value of `limit` parameter is 30 for the sake of performance.
     * @param offset Starting index of array of models to be fetched
     * @param limit Number of models to fetch
     * @return models List of models
     */
    function getModels(
        uint32 offset,
        uint32 limit
    ) external view returns (ModelArrayElement[] memory models);

    /**
     * @notice Get the list of models registered by the specified owner.
     * @dev Max value of `limit` parameter is 30 for the sake of performance.
     * @param ownerAddress Address of model owner
     * @param offset Starting index of array of models to be fetched
     * @param limit Number of models to fetch
     * @return models List of models
     */
    function getModelsByOwnerAddress(
        address ownerAddress,
        uint32 offset,
        uint32 limit
    ) external view returns (ModelArrayElement[] memory models);

    /**
     * @notice Update info of the requested model.
     * @dev 'contentId' & 'ownerAddress' cannot be updated.
     * @param modelContentId Hash (content ID / address of IPFS) of model
     * @param modelName Updated name of model
     * @param modelDescription Updated description of model
     */
    function updateModel(
        Hash modelContentId,
        string calldata modelName,
        string calldata modelDescription
    ) external;

    /**
     * @notice Disable the requested model.
     * @dev Model is logically disabled.
     * @param modelContentId Hash (content ID / address of IPFS) of model
     */
    function disableModel(Hash modelContentId) external;

    /**
     * @notice Store commit of testing results, and generate a challenge in return.
     * @dev 'commitId' is generated from 'modelContentId', 'merkleRoot' and sender's address.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _merkleRoot Root hash of Merkle tree of testing results
     * @return commitId Commit ID
     * @return challenge Challenge
     */
    function commit(
        Hash _modelContentId,
        Hash _merkleRoot
    ) external returns (Hash commitId, bytes memory challenge);

    /**
     * @notice Get commit details.
     * @param _commitId Commit ID
     */
    function getCommit(Hash _commitId) external view returns (Commit memory);

    /**
     * @notice Get commit IDs of the specified model.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _offset Starting index of array of commits to be fetched
     * @param _limit Number of commits to fetch
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
    function updateChallenge(
        Hash _commitId
    ) external returns (bytes memory challenge);

    /**
     * @notice Get the length (number of digits) of challenge.
     * @dev This function can only be callable by contract owner.
     */
    function getChallengeLength() external view returns (uint8);

    /**
     * @notice Update the length (number of digits) of challenge.
     * @dev This function can only be callable by contract owner.
     *      Already generated (committed) challenges must not be modified.
     *      Max length is 32, because bytes32 obviously consists of 32 bytes.
     * @param _challengeLength Length of challenge
     */
    function updateChallengeLength(uint8 _challengeLength) external;

    /**
     * @notice Verify Merkle proofs matched with the challenge.
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
    ) external returns (bool commitRevealed);

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

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

    /// @dev Holds value of the matched leaf node and its Merkle proof (values of its Merkle path)
    struct MerkleProof {
        Hash leaf;
        Hash[] proof;
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
     * @notice Registers a model in the verifier contract.
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
     * @notice Receives and stores commitments of testing results. Generates a random challenge in return.
     * @dev Need to consider setting thresholds when generating a random challenge. Fine-tune them accordingly.
     * @param commitmentModel Hash value of URL of targeted model
     * @param commitmentData Hash value of testing data
     * @param commitmentResults Root hash value of Merkle tree of testing results
     * @return commitmentId commitment ID (need to provide when calling 'reveal()' & 'verify()')
     * @return challenge Random challenge
     */
    function commit(
        bytes32 commitmentModel,
        bytes32 commitmentData,
        bytes32 commitmentResults
    ) external returns (uint256 commitmentId, bytes32 challenge);

    /**
     * @notice Receives and verifies Merkle proofs matched with the random challenge.
     * @dev Use https://docs.openzeppelin.com/contracts/4.x/api/utils#MerkleProof to verify Merkle proofs.
     * @param commitmentId commitment ID
     * @param merkleProofs Array of Merkle proofs matched with the random challenge
     * @return verifiedNodes Array of hash values of the verified nodes
     */
    function reveal(
        uint256 commitmentId,
        MerkleProof[] calldata merkleProofs
    ) external view returns (Hash[] memory verifiedNodes);

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

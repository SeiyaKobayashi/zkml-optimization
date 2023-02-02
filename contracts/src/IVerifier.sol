// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

/**
 * @title Interface of Verifier contract
 * @author Seiya Kobayashi
 */
interface IVerifier {
    /// @dev Type of hash
    type Hash is bytes32;

    /// @dev Holds model details
    struct Model {
        string name;
        string description;
        address owner;
    }

    /// @dev Holds model's hash value and name
    struct ModelCommitment {
        Hash commitment;
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
     * @dev Stores models as a mapping (key = commitment, value = name & description & address of caller) for lookups,
            and as an array to be able to get the list of models registered.
     * @param modelCommitment Hash value (address of IPFS) of model to be registered
     * @param modelName Name of model to be registered
     * @param modelDescription Description of model to be registered
     * @return modelInfo Registered model
     */
    function registerModel(
        Hash modelCommitment,
        string calldata modelName,
        string calldata modelDescription
    ) external returns (Model memory modelInfo);

    /**
     * @notice Get the list of models registered.
     * @dev Would be nice to add more fields (e.g. 'isAvailable') to 'Model' struct for filtering purpose.
     * @param ownerAddress Address of model owner (filtering purpose)
     * @param offset Starting index of array of models to be fetched
     * @param limit Number of models to fetch
     * @return modelCommitments List of models registered
     */
    function getModels(
        address ownerAddress,
        uint32 offset,
        uint32 limit
    ) external view returns (ModelCommitment[] memory modelCommitments);

    /**
     * @notice Get info of the requested model.
     * @param modelCommitment Hash value (address of IPFS) of model
     * @return modelInfo Info of the requested model
     */
    function getModelInfo(
        Hash modelCommitment
    ) external view returns (Model memory modelInfo);

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

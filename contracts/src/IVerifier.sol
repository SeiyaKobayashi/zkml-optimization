// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

/**
 * @title Interface of Verifier contract
 * @author Seiya Kobayashi
 */
interface IVerifier {
    /// @dev Holds model info
    struct Model {
        string modelName;
        string modelDescription;
        bytes32 modelCommitment;
    }

    /// @dev Holds hash value of node
    struct Node {
        bytes32 value;
    }

    /// @dev Holds hash value of the matched node and hash values of its Merkle path (to calculate root hash)
    struct MerkleProof {
        Node leaf;
        Node[] proof;
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
     * @dev Store models as a mapping (key = commitment, value = name & description),
            and as an array of commitments (to be able to get the list of models registered).
     * @param modelName Name of model to be registered
     * @param modelDescription Description of model to be registered
     * @param modelCommitment Hash value of URL (of IPFS) of model to be registered
     * @return model Registered model
     */
    function registerModel(
        string calldata modelName,
        string calldata modelDescription,
        bytes32 modelCommitment
    ) external returns (Model memory model);

    /**
     * @notice Get the list of models registered.
     * @dev Would be nice to add params (e.g. 'isAvailable') to 'Model' struct for filtering purpose.
     * @return models List of models registered
     */
    function getModels() external view returns (bytes32[] memory models);

    /**
     * @notice Get info of the requested model.
     * @param modelCommitment Hash value of URL (of IPFS) of model
     * @return model Info of the requested model
     */
    function getModelInfo(
        bytes32 modelCommitment
    ) external view returns (Model memory model);

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
    ) external view returns (Node[] memory verifiedNodes);

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

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

    /// @dev Holds commitment details
    struct Commitment {
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
     * @param _modelOwnerAddress Owner address of model
     */
    function registerModel(
        Hash _modelContentId,
        string calldata _modelName,
        string calldata _modelDescription,
        address _modelOwnerAddress
    ) external;

    /**
     * @notice Get info of the requested model.
     * @return model Info of the requested model
     */
    function getModel() external view returns (Model memory);

    /**
     * @notice Update info of the requested model.
     * @dev 'contentId' & 'ownerAddress' cannot be updated.
     * @param _modelName Updated name of model
     * @param _modelDescription Updated description of model
     */
    function updateModel(
        string calldata _modelName,
        string calldata _modelDescription
    ) external;

    /**
     * @notice Disable the requested model.
     * @dev Model is logically disabled.
     */
    function disableModel() external;

    /**
     * @notice Store commitment of testing results, and generate a challenge in return.
     * @dev 'commitmentId' is generated from '_modelContentId', '_merkleRoot' and sender's address.
     * @param _merkleRoot Root hash of Merkle tree of testing results
     */
    function commit(Hash _merkleRoot) external;

    /**
     * @notice Get commitment details.
     * @dev This function can only be callable by the contract owner.
     * @param _commitmentId commitment ID
     * @return commitment commitment details
     */
    function getCommitment(
        Hash _commitmentId
    ) external view returns (Commitment memory);

    /**
     * @notice Get commitment IDs of the specified model.
     * @dev This function can only be callable by the contract owner.
     * @param _offset Starting index of array of commitments to be fetched
     * @param _limit Number of commitments to be fetched
     * @return commitments Array of commitment IDs
     */
    function getCommitmentsOfModel(
        uint32 _offset,
        uint32 _limit
    ) external view returns (Hash[] memory);

    /**
     * @notice Get commitment IDs of the specified prover.
     * @param _offset Starting index of array of commitments to be fetched
     * @param _limit Number of commitments to fetch
     * @return commitments Array of commitment IDs
     */
    function getCommitmentsOfProver(
        uint32 _offset,
        uint32 _limit
    ) external view returns (Hash[] memory);

    /**
     * @notice Update challenge of the specified commitment.
     * @param _commitmentId Commitment ID
     */
    function updateChallenge(Hash _commitmentId) external;

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
     * @param _commitmentId commitment ID
     * @param _merkleProofs Array of Merkle proofs
     * @param _proofFlags Array of proof flags
     * @param _leaves Array of Merkle leaves
     */
    function reveal(
        Hash _commitmentId,
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

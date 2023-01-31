// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

/**
 * @title Interface of Verifier contract
 * @author Seiya Kobayashi
 */
interface IVerifier {
    /// @dev Holds hash value of node
    struct Node {
        bytes32 value;
    }

    /// @dev Holds hash value of the matched node and hash values of its Merkle path (to calculate root hash)
    struct MatchedNode {
        Node node;
        Node[] merklePath;
    }

    // TODO: check exect types
    /// @dev Holds ZKP
    struct Proof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[16] input;
    }

    // TODO: check exect types
    /// @dev Holds ZKP and its validity
    struct ProofWithValidity {
        Proof proof;
        bool isValid;
    }

    /**
     * @notice Receives and stores commitments of testing results. Generates a random challenge in return.
     * @dev Need to consider setting thresholds when generating a random challenge. Fine-tune them accordingly.
     * @param commitmentData Hash value of testing data
     * @param commitmentModel Hash value of URL of targeted model
     * @param commitmentResults Root hash value of Merkle-Patricia tree of testing results
     * @return c random challenge
     */
    function commit(
        bytes32 commitmentData,
        bytes32 commitmentModel,
        bytes32 commitmentResults
    ) external returns (bytes32 c);

    /**
     * @notice Receives and confirms nodes matched with the random challenge.
     * @dev To confirm, calculate root hash value from the given hash values and merkle paths.
     * @param matchedNodes Array of nodes matched with the random challenge
     * @return confirmedNodes Array of hash values of the confirmed nodes
     */
    function reveal(
        MatchedNode[] calldata matchedNodes
    ) external view returns (Node[] memory confirmedNodes);

    /**
     * @notice Receives and verifies ZKPs.
     * @dev Come up with a way to efficiently store verified ZKPs in smart contract (to be used by external contracts).
     * @param proofs Array of client-generated ZKPs
     * @return results Array of validity of ZKPs
     */
    function verify(
        Proof[] memory proofs
    ) external returns (ProofWithValidity[] memory results);
}

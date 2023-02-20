// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./Bytes.sol";

/**
 * @title Library of some useful Merkle tree operations
 * @author Seiya Kobayashi
 */
library MerkleTree {
    /**
     * @dev Check if tail of every leaf matches the given challenge and difficulty.
     * @param _challenge Challenge
     * @param _difficulty Difficulty of challenge
     * @param _leaves Leaves of Merkle tree
     * @return leavesVerified Returns true if all leaves are verified to contain substring of the challenge.
     */
    function verifyLeaves(
        bytes32 _challenge,
        uint256 _difficulty,
        bytes32[] memory _leaves
    ) internal pure returns (bool) {
        for (uint i = 0; i < _leaves.length; i++) {
            bytes32 _leafTail = Bytes.getLastNBits(_leaves[i], _difficulty);
            if (_leafTail != _challenge) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev Verify Merkle proofs.
     * @param _merkleProofs Merkle proofs
     * @param _proofFlags Proof flags
     * @param _merkleRoot Merkle root
     * @param _leaves Leaves of Merkle tree
     * @return merkleProofsVerified Returns true if all proofs are verified.
     */
    function verifyMerkleProofs(
        bytes32[] calldata _merkleProofs,
        bool[] calldata _proofFlags,
        bytes32 _merkleRoot,
        bytes32[] memory _leaves
    ) internal pure returns (bool) {
        return
            MerkleProof.multiProofVerifyCalldata(
                _merkleProofs,
                _proofFlags,
                _merkleRoot,
                _leaves
            );
    }
}

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
     * @dev Check if tail of every leaf matches the given challenge.
     * @param _challenge Challenge
     * @param _leaves Leaves of Merkle tree
     */
    function verifyLeaves(
        bytes memory _challenge,
        bytes32[] memory _leaves
    ) internal pure returns (bool) {
        for (uint i = 0; i < _leaves.length; i++) {
            bytes memory _leafTail = Bytes.getTailOfHash(
                _leaves[i],
                _challenge.length
            );
            if (!Bytes.equals(_leafTail, _challenge)) {
                return false;
            }
        }

        return true;
    }

    /// @dev Verify Merkle proofs
    function verifyMerkleProofs(
        bytes32[] calldata merkleProofs,
        bool[] calldata proofFlags,
        bytes32 merkleRoot,
        bytes32[] memory leaves
    ) internal pure returns (bool) {
        return
            MerkleProof.multiProofVerifyCalldata(
                merkleProofs,
                proofFlags,
                merkleRoot,
                leaves
            );
    }
}

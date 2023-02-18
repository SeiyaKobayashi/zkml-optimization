// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "hardhat/console.sol";

/**
 * @title Library of some useful bytes operations
 * @author Seiya Kobayashi
 */
library Bytes {
    /**
     * @dev Get tail of hash (of type bytes32).
     * @param _hash Hash value
     * @param _lengthFromTail Length of resulting bytes
     * @return tail Tail of hash of the specified length
     */
    function getTailOfHash(
        bytes32 _hash,
        uint _lengthFromTail
    ) internal pure returns (bytes memory tail) {
        bytes memory _tail = new bytes(_lengthFromTail);
        uint _hashLength = _hash.length;
        uint _startingIndex = _hashLength - _lengthFromTail;

        for (uint i = _startingIndex; i < _hashLength; i++) {
            _tail[i - _startingIndex] = _hash[i];
        }

        return _tail;
    }

    /// @dev Return true if two bytes are equal.
    function equals(
        bytes memory a,
        bytes memory b
    ) internal pure returns (bool) {
        return keccak256(a) == keccak256(b);
    }
}

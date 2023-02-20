// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "hardhat/console.sol";

/**
 * @title Library of some useful bytes operations
 * @author Seiya Kobayashi
 */
library Bytes {
    /**
     * @dev Get last N bits (not bytes) of the given hash value.
     * @param _hash Hash value
     * @param _n Length of bits to get
     * @return tail Last N bits of hash
     */
    function getLastNBits(
        bytes32 _hash,
        uint256 _n
    ) internal pure returns (bytes32) {
        return bytes32(uint256(_hash) % 2 ** _n);
    }
}

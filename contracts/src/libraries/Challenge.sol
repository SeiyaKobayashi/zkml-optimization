// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "./Bytes.sol";

/**
 * @title Library of challenge generation algorithm
 * @author Seiya Kobayashi
 */
library Challenge {
    /**
     * @notice Generate a random challenge.
     * @dev Generate a challenge of random 32 bytes (bytes32) of the given difficulty.
     * @param _difficulty Difficulty of challenge
     * @return challenge Generated challenge
     */
    function generateChallenge(
        uint256 _difficulty
    ) internal view returns (bytes32) {
        return
            Bytes.getLastNBits(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        block.timestamp,
                        msg.sender
                    )
                ),
                _difficulty
            );
    }
}

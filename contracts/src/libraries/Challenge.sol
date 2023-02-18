// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "./Bytes.sol";

/**
 * @title Library of challenge generation algorithm
 * @author Seiya Kobayashi
 */
library Challenge {
    /// @dev Generate a random challenge of the length of 'challengeLength'.
    function generateChallenge(
        uint8 challengeLength
    ) internal view returns (bytes memory challenge) {
        return
            Bytes.getTailOfHash(
                keccak256(abi.encodePacked(block.timestamp, msg.sender)),
                challengeLength
            );
    }
}

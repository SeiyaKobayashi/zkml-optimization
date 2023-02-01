// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "./IVerifier.sol";

/**
 * @title Verifier contract
 * @author Seiya Kobayashi
 */
// TODO: enable solhint
/* solhint-disable */
contract Verifier is IVerifier, Ownable {
    // TODO: add necessary types

    // TODO: add necessary state variables

    // TODO: add necessary events

    // TODO: implement constructor
    constructor() {}

    // TODO: add modifiers (if necessary)

    // TODO: implement function
    function commit(
        bytes32 commitmentData,
        bytes32 commitmentModel,
        bytes32 commitmentResults
    ) external returns (bytes32 c) {}

    // TODO: implement function
    function reveal(
        MerkleProof[] calldata merkleProofs
    ) external view returns (Node[] memory verifiedNodes) {}

    // TODO: implement function
    function verify(
        Zkp[] memory zkps
    ) external returns (ZkpWithValidity[] memory results) {}
}
/* solhint-enable */

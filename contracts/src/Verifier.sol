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
    function registerModel(
        string calldata modelName,
        string calldata modelDescription,
        bytes32 modelCommitment
    ) external returns (Model memory model) {}

    // TODO: implement function
    function getModels() external view returns (bytes32[] memory models) {}

    // TODO: implement function
    function getModelInfo(
        bytes32 modelCommitment
    ) external view returns (Model memory model) {}

    // TODO: implement function
    function commit(
        bytes32 commitmentModel,
        bytes32 commitmentData,
        bytes32 commitmentResults
    ) external returns (uint256 commitmentId, bytes32 challenge) {}

    // TODO: implement function
    function reveal(
        uint256 commitmentId,
        MerkleProof[] calldata merkleProofs
    ) external view returns (Node[] memory verifiedNodes) {}

    // TODO: implement function
    function verify(
        uint256 commitmentId,
        Zkp[] memory zkps
    ) external returns (ZkpWithValidity[] memory zkpVerifications) {}
}
/* solhint-enable */

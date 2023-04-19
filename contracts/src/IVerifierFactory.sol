// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "./IVerifier.sol";

/**
 * @title Interface of Verifier factory contract
 * @author Seiya Kobayashi
 */
interface IVerifierFactory {
    /// @dev Holds simplified model details
    struct ModelArrayElement {
        IVerifier.Hash contentId;
        string name;
        address contractAddress;
    }

    /**
     * @notice Create a child (proxy) contract.
     * @param _modelContentId Hash (content ID / address of IPFS) of model
     * @param _modelName Name of model
     * @param _modelDescription Description of model
     */
    function createChildContract(
        IVerifier.Hash _modelContentId,
        string calldata _modelName,
        string calldata _modelDescription
    ) external;

    /**
     * @notice Get the list of models registered.
     * @dev Max value of `limit` parameter is 30 for the sake of performance.
     * @param _offset Starting index of array of models to be fetched
     * @param _limit Number of models to be fetched
     * @return models List of models
     */
    function getModels(
        uint32 _offset,
        uint32 _limit
    ) external view returns (ModelArrayElement[] memory);

    /**
     * @notice Get the list of models registered by the specified owner.
     * @dev Max value of `limit` parameter is 30 for the sake of performance.
     * @param _ownerAddress Address of model owner
     * @param _offset Starting index of array of models to be fetched
     * @param _limit Number of models to be fetched
     * @return models List of models
     */
    function getModelsByOwnerAddress(
        address _ownerAddress,
        uint32 _offset,
        uint32 _limit
    ) external view returns (ModelArrayElement[] memory);

    /**
     * @notice Get address of the master (first) Verifier contract.
     */
    function getMasterVerifierContract() external view returns (address);

    /**
     * @notice Get address of the cloned Verifier contract.
     */
    function getClonedVerifierContract(
        IVerifier.Hash _modelContentId
    ) external view returns (address);
}

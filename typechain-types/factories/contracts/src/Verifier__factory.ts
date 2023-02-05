/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  Verifier,
  VerifierInterface,
} from "../../../contracts/src/Verifier";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "IVerifier.Hash",
        name: "contentId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "ownerAddress",
        type: "address",
      },
    ],
    name: "ModelDisabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "IVerifier.Hash",
        name: "contentId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "ownerAddress",
        type: "address",
      },
    ],
    name: "ModelRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "IVerifier.Hash",
        name: "contentId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "ownerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    name: "ModelUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "commitmentModel",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "commitmentData",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "commitmentResults",
        type: "bytes32",
      },
    ],
    name: "commit",
    outputs: [
      {
        internalType: "uint256",
        name: "commitmentId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "challenge",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "IVerifier.Hash",
        name: "modelContentId",
        type: "bytes32",
      },
    ],
    name: "disableModel",
    outputs: [
      {
        components: [
          {
            internalType: "IVerifier.Hash",
            name: "contentId",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "address",
            name: "ownerAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isDisabled",
            type: "bool",
          },
        ],
        internalType: "struct IVerifier.Model",
        name: "model",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "IVerifier.Hash",
        name: "modelContentId",
        type: "bytes32",
      },
    ],
    name: "getModel",
    outputs: [
      {
        components: [
          {
            internalType: "IVerifier.Hash",
            name: "contentId",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "address",
            name: "ownerAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isDisabled",
            type: "bool",
          },
        ],
        internalType: "struct IVerifier.Model",
        name: "model",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "offset",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "limit",
        type: "uint32",
      },
    ],
    name: "getModels",
    outputs: [
      {
        components: [
          {
            internalType: "IVerifier.Hash",
            name: "contentId",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
        ],
        internalType: "struct IVerifier.ModelArrayElement[]",
        name: "paginatedModels",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ownerAddress",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "offset",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "limit",
        type: "uint32",
      },
    ],
    name: "getModelsByOwnerAddress",
    outputs: [
      {
        components: [
          {
            internalType: "IVerifier.Hash",
            name: "contentId",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
        ],
        internalType: "struct IVerifier.ModelArrayElement[]",
        name: "paginatedModels",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "IVerifier.Hash",
        name: "modelContentId",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "modelName",
        type: "string",
      },
      {
        internalType: "string",
        name: "modelDescription",
        type: "string",
      },
    ],
    name: "registerModel",
    outputs: [
      {
        components: [
          {
            internalType: "IVerifier.Hash",
            name: "contentId",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "address",
            name: "ownerAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isDisabled",
            type: "bool",
          },
        ],
        internalType: "struct IVerifier.Model",
        name: "model",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "commitmentId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "IVerifier.Hash",
            name: "leaf",
            type: "bytes32",
          },
          {
            internalType: "IVerifier.Hash[]",
            name: "proof",
            type: "bytes32[]",
          },
        ],
        internalType: "struct IVerifier.MerkleProof[]",
        name: "merkleProofs",
        type: "tuple[]",
      },
    ],
    name: "reveal",
    outputs: [
      {
        internalType: "IVerifier.Hash[]",
        name: "verifiedNodes",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "IVerifier.Hash",
        name: "modelContentId",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "modelName",
        type: "string",
      },
      {
        internalType: "string",
        name: "modelDescription",
        type: "string",
      },
    ],
    name: "updateModel",
    outputs: [
      {
        components: [
          {
            internalType: "IVerifier.Hash",
            name: "contentId",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "address",
            name: "ownerAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isDisabled",
            type: "bool",
          },
        ],
        internalType: "struct IVerifier.Model",
        name: "model",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "commitmentId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256[2]",
            name: "a",
            type: "uint256[2]",
          },
          {
            internalType: "uint256[2][2]",
            name: "b",
            type: "uint256[2][2]",
          },
          {
            internalType: "uint256[2]",
            name: "c",
            type: "uint256[2]",
          },
          {
            internalType: "uint256[16]",
            name: "input",
            type: "uint256[16]",
          },
        ],
        internalType: "struct IVerifier.Zkp[]",
        name: "zkps",
        type: "tuple[]",
      },
    ],
    name: "verify",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256[2]",
                name: "a",
                type: "uint256[2]",
              },
              {
                internalType: "uint256[2][2]",
                name: "b",
                type: "uint256[2][2]",
              },
              {
                internalType: "uint256[2]",
                name: "c",
                type: "uint256[2]",
              },
              {
                internalType: "uint256[16]",
                name: "input",
                type: "uint256[16]",
              },
            ],
            internalType: "struct IVerifier.Zkp",
            name: "zkp",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isValid",
            type: "bool",
          },
        ],
        internalType: "struct IVerifier.ZkpWithValidity[]",
        name: "zkpVerifications",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5062000032620000266200003860201b60201c565b6200004060201b60201c565b62000104565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6130ae80620001146000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806395ee7a281161007157806395ee7a28146101a15780639d3a2407146101d1578063c46bfb1f14610201578063d7c7e94814610231578063e4e5b25814610261578063f2fde38b14610292576100b4565b8063109656fb146100b957806321e7c498146100e957806370bca45014610119578063715018a6146101495780638da5cb5b146101535780638e6906f014610171575b600080fd5b6100d360048036038101906100ce919061187c565b6102ae565b6040516100e09190611a89565b60405180910390f35b61010360048036038101906100fe9190611ad7565b6104d1565b6040516101109190611bab565b60405180910390f35b610133600480360381019061012e9190611ad7565b610704565b6040516101409190611bab565b60405180910390f35b610151610a0c565b005b61015b610a20565b6040516101689190611bdc565b60405180910390f35b61018b60048036038101906101869190612009565b610a49565b6040516101989190612368565b60405180910390f35b6101bb60048036038101906101b691906123e5565b610a51565b6040516101c891906124f4565b60405180910390f35b6101eb60048036038101906101e69190612516565b610a5a565b6040516101f89190611a89565b60405180910390f35b61021b600480360381019061021691906125ac565b610b7d565b6040516102289190611bab565b60405180910390f35b61024b600480360381019061024691906125ac565b610ede565b6040516102589190611bab565b60405180910390f35b61027b6004803603810190610276919061266d565b61129b565b6040516102899291906126de565b60405180910390f35b6102ac60048036038101906102a79190612707565b6112a6565b005b60608160008163ffffffff161180156102ce5750601e8163ffffffff1611155b61030d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161030490612791565b60405180910390fd5b6000600260008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208054905003610392576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610389906127fd565b60405180910390fd5b60008463ffffffff16101580156103f05750600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490508463ffffffff16105b61042f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104269061288f565b60405180910390fd5b6104c7600260008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208054806020026020016040519081016040528092919081815260200182805480156104bb57602002820191906000526020600020905b8154815260200190600101908083116104a7575b50505050508585611329565b9150509392505050565b6104d9611767565b8160006003600083815260200190815260200160002060010180546104fd906128de565b90500361053f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105369061295b565b60405180910390fd5b600360008481526020019081526020016000206040518060a001604052908160008201548152602001600182018054610577906128de565b80601f01602080910402602001604051908101604052809291908181526020018280546105a3906128de565b80156105f05780601f106105c5576101008083540402835291602001916105f0565b820191906000526020600020905b8154815290600101906020018083116105d357829003601f168201915b50505050508152602001600282018054610609906128de565b80601f0160208091040260200160405190810160405280929190818152602001828054610635906128de565b80156106825780601f1061065757610100808354040283529160200191610682565b820191906000526020600020905b81548152906001019060200180831161066557829003601f168201915b505050505081526020016003820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016003820160149054906101000a900460ff161515151581525050915050919050565b61070c611767565b816000600360008381526020019081526020016000206001018054610730906128de565b905003610772576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107699061295b565b60405180910390fd5b823373ffffffffffffffffffffffffffffffffffffffff166003600083815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610817576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161080e906129c7565b60405180910390fd5b60016003600086815260200190815260200160002060030160146101000a81548160ff021916908315150217905550600360008581526020019081526020016000206040518060a00160405290816000820154815260200160018201805461087e906128de565b80601f01602080910402602001604051908101604052809291908181526020018280546108aa906128de565b80156108f75780601f106108cc576101008083540402835291602001916108f7565b820191906000526020600020905b8154815290600101906020018083116108da57829003601f168201915b50505050508152602001600282018054610910906128de565b80601f016020809104026020016040519081016040528092919081815260200182805461093c906128de565b80156109895780601f1061095e57610100808354040283529160200191610989565b820191906000526020600020905b81548152906001019060200180831161096c57829003601f168201915b505050505081526020016003820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016003820160149054906101000a900460ff16151515158152505092505050919050565b610a1461161d565b610a1e600061169b565b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606092915050565b60609392505050565b60608160008163ffffffff16118015610a7a5750601e8163ffffffff1611155b610ab9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ab090612791565b60405180910390fd5b60008463ffffffff1610158015610ada57506001805490508463ffffffff16105b610b19576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b109061288f565b60405180910390fd5b610b746001805480602002602001604051908101604052809291908181526020018280548015610b6857602002820191906000526020600020905b815481526020019060010190808311610b54575b50505050508585611329565b91505092915050565b610b85611767565b8484848460008484905003610bcf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bc690612a33565b60405180910390fd5b60008282905003610c15576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c0c90612a9f565b60405180910390fd5b6000600360008c81526020019081526020016000206001018054610c38906128de565b905014610c7a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c7190612b0b565b60405180910390fd5b60018a9080600181540180825580915050600190039060005260206000200160009091909190915055600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208a908060018154018082558091505060019003906000526020600020016000909190919091505560006040518060a001604052808c81526020018b8b8080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050815260200189898080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505081526020013373ffffffffffffffffffffffffffffffffffffffff16815260200160001515815250905080600360008d8152602001908152602001600020600082015181600001556020820151816001019081610e089190612cd7565b506040820151816002019081610e1e9190612cd7565b5060608201518160030160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060808201518160030160146101000a81548160ff0219169083151502179055509050503373ffffffffffffffffffffffffffffffffffffffff168b7fc0bb3838ad72991f913b1a5c821da885948755a4ee450ec034e7a256e09aca5a60405160405180910390a3809550505050505095945050505050565b610ee6611767565b856000600360008381526020019081526020016000206001018054610f0a906128de565b905003610f4c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f439061295b565b60405180910390fd5b863373ffffffffffffffffffffffffffffffffffffffff166003600083815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610ff1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fe8906129c7565b60405180910390fd5b868686866000848490500361103b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161103290612a33565b60405180910390fd5b60008282905003611081576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161107890612a9f565b60405180910390fd5b8a8a600360008f815260200190815260200160002060010191826110a6929190612db4565b508888600360008f815260200190815260200160002060020191826110cc929190612db4565b50600360008d81526020019081526020016000206040518060a001604052908160008201548152602001600182018054611105906128de565b80601f0160208091040260200160405190810160405280929190818152602001828054611131906128de565b801561117e5780601f106111535761010080835404028352916020019161117e565b820191906000526020600020905b81548152906001019060200180831161116157829003601f168201915b50505050508152602001600282018054611197906128de565b80601f01602080910402602001604051908101604052809291908181526020018280546111c3906128de565b80156112105780601f106111e557610100808354040283529160200191611210565b820191906000526020600020905b8154815290600101906020018083116111f357829003601f168201915b505050505081526020016003820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016003820160149054906101000a900460ff161515151581525050965050505050505095945050505050565b600080935093915050565b6112ae61161d565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361131d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161131490612ef6565b60405180910390fd5b6113268161169b565b50565b6060835182846113399190612f45565b63ffffffff16111561135b578263ffffffff1684516113589190612f7d565b91505b60008263ffffffff1667ffffffffffffffff81111561137d5761137c611c32565b5b6040519080825280602002602001820160405280156113b657816020015b6113a36117b1565b81526020019060019003908161139b5790505b50905060005b8363ffffffff168163ffffffff161015611611576000600360008884896113e39190612f45565b63ffffffff16815181106113fa576113f9612fb1565b5b602002602001015181526020019081526020016000206040518060a001604052908160008201548152602001600182018054611435906128de565b80601f0160208091040260200160405190810160405280929190818152602001828054611461906128de565b80156114ae5780601f10611483576101008083540402835291602001916114ae565b820191906000526020600020905b81548152906001019060200180831161149157829003601f168201915b505050505081526020016002820180546114c7906128de565b80601f01602080910402602001604051908101604052809291908181526020018280546114f3906128de565b80156115405780601f1061151557610100808354040283529160200191611540565b820191906000526020600020905b81548152906001019060200180831161152357829003601f168201915b505050505081526020016003820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016003820160149054906101000a900460ff16151515158152505090506040518060400160405280826000015181526020018260200151815250838363ffffffff16815181106115f2576115f1612fb1565b5b602002602001018190525050808061160990612fe0565b9150506113bc565b50809150509392505050565b61162561175f565b73ffffffffffffffffffffffffffffffffffffffff16611643610a20565b73ffffffffffffffffffffffffffffffffffffffff1614611699576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161169090613058565b60405180910390fd5b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600033905090565b6040518060a00160405280600080191681526020016060815260200160608152602001600073ffffffffffffffffffffffffffffffffffffffff1681526020016000151581525090565b604051806040016040528060008019168152602001606081525090565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061180d826117e2565b9050919050565b61181d81611802565b811461182857600080fd5b50565b60008135905061183a81611814565b92915050565b600063ffffffff82169050919050565b61185981611840565b811461186457600080fd5b50565b60008135905061187681611850565b92915050565b600080600060608486031215611895576118946117d8565b5b60006118a38682870161182b565b93505060206118b486828701611867565b92505060406118c586828701611867565b9150509250925092565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b6000611910826118fb565b9050919050565b61192081611905565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015611960578082015181840152602081019050611945565b60008484015250505050565b6000601f19601f8301169050919050565b600061198882611926565b6119928185611931565b93506119a2818560208601611942565b6119ab8161196c565b840191505092915050565b60006040830160008301516119ce6000860182611917565b50602083015184820360208601526119e6828261197d565b9150508091505092915050565b60006119ff83836119b6565b905092915050565b6000602082019050919050565b6000611a1f826118cf565b611a2981856118da565b935083602082028501611a3b856118eb565b8060005b85811015611a775784840389528151611a5885826119f3565b9450611a6383611a07565b925060208a01995050600181019050611a3f565b50829750879550505050505092915050565b60006020820190508181036000830152611aa38184611a14565b905092915050565b611ab4816118fb565b8114611abf57600080fd5b50565b600081359050611ad181611aab565b92915050565b600060208284031215611aed57611aec6117d8565b5b6000611afb84828501611ac2565b91505092915050565b611b0d81611802565b82525050565b60008115159050919050565b611b2881611b13565b82525050565b600060a083016000830151611b466000860182611917565b5060208301518482036020860152611b5e828261197d565b91505060408301518482036040860152611b78828261197d565b9150506060830151611b8d6060860182611b04565b506080830151611ba06080860182611b1f565b508091505092915050565b60006020820190508181036000830152611bc58184611b2e565b905092915050565b611bd681611802565b82525050565b6000602082019050611bf16000830184611bcd565b92915050565b6000819050919050565b611c0a81611bf7565b8114611c1557600080fd5b50565b600081359050611c2781611c01565b92915050565b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611c6a8261196c565b810181811067ffffffffffffffff82111715611c8957611c88611c32565b5b80604052505050565b6000611c9c6117ce565b9050611ca88282611c61565b919050565b600067ffffffffffffffff821115611cc857611cc7611c32565b5b602082029050602081019050919050565b600080fd5b600080fd5b600067ffffffffffffffff821115611cfe57611cfd611c32565b5b602082029050919050565b6000611d1c611d1784611ce3565b611c92565b90508060208402830185811115611d3657611d35611cd9565b5b835b81811015611d5f5780611d4b8882611c18565b845260208401935050602081019050611d38565b5050509392505050565b600082601f830112611d7e57611d7d611c2d565b5b6002611d8b848285611d09565b91505092915050565b600067ffffffffffffffff821115611daf57611dae611c32565b5b602082029050919050565b6000611dcd611dc884611d94565b611c92565b90508060408402830185811115611de757611de6611cd9565b5b835b81811015611e105780611dfc8882611d69565b845260208401935050604081019050611de9565b5050509392505050565b600082601f830112611e2f57611e2e611c2d565b5b6002611e3c848285611dba565b91505092915050565b600067ffffffffffffffff821115611e6057611e5f611c32565b5b602082029050919050565b6000611e7e611e7984611e45565b611c92565b90508060208402830185811115611e9857611e97611cd9565b5b835b81811015611ec15780611ead8882611c18565b845260208401935050602081019050611e9a565b5050509392505050565b600082601f830112611ee057611edf611c2d565b5b6010611eed848285611e6b565b91505092915050565b60006103008284031215611f0d57611f0c611cde565b5b611f176080611c92565b90506000611f2784828501611d69565b6000830152506040611f3b84828501611e1a565b60208301525060c0611f4f84828501611d69565b604083015250610100611f6484828501611ecb565b60608301525092915050565b6000611f83611f7e84611cad565b611c92565b9050808382526020820190506103008402830185811115611fa757611fa6611cd9565b5b835b81811015611fd15780611fbc8882611ef6565b84526020840193505061030081019050611fa9565b5050509392505050565b600082601f830112611ff057611fef611c2d565b5b8135612000848260208601611f70565b91505092915050565b600080604083850312156120205761201f6117d8565b5b600061202e85828601611c18565b925050602083013567ffffffffffffffff81111561204f5761204e6117dd565b5b61205b85828601611fdb565b9150509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600060029050919050565b600081905092915050565b6000819050919050565b6120ba81611bf7565b82525050565b60006120cc83836120b1565b60208301905092915050565b6000602082019050919050565b6120ee81612091565b6120f8818461209c565b9250612103826120a7565b8060005b8381101561213457815161211b87826120c0565b9650612126836120d8565b925050600181019050612107565b505050505050565b600060029050919050565b600081905092915050565b6000819050919050565b600061216883836120e5565b60408301905092915050565b6000602082019050919050565b61218a8161213c565b6121948184612147565b925061219f82612152565b8060005b838110156121d05781516121b7878261215c565b96506121c283612174565b9250506001810190506121a3565b505050505050565b600060109050919050565b600081905092915050565b6000819050919050565b6000602082019050919050565b61220e816121d8565b61221881846121e3565b9250612223826121ee565b8060005b8381101561225457815161223b87826120c0565b9650612246836121f8565b925050600181019050612227565b505050505050565b6103008201600082015161227360008501826120e5565b5060208201516122866040850182612181565b50604082015161229960c08501826120e5565b5060608201516122ad610100850182612205565b50505050565b610320820160008201516122ca600085018261225c565b5060208201516122de610300850182611b1f565b50505050565b60006122f083836122b3565b6103208301905092915050565b6000602082019050919050565b600061231582612065565b61231f8185612070565b935061232a83612081565b8060005b8381101561235b57815161234288826122e4565b975061234d836122fd565b92505060018101905061232e565b5085935050505092915050565b60006020820190508181036000830152612382818461230a565b905092915050565b600080fd5b60008083601f8401126123a5576123a4611c2d565b5b8235905067ffffffffffffffff8111156123c2576123c161238a565b5b6020830191508360208202830111156123de576123dd611cd9565b5b9250929050565b6000806000604084860312156123fe576123fd6117d8565b5b600061240c86828701611c18565b935050602084013567ffffffffffffffff81111561242d5761242c6117dd565b5b6124398682870161238f565b92509250509250925092565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600061247d8383611917565b60208301905092915050565b6000602082019050919050565b60006124a182612445565b6124ab8185612450565b93506124b683612461565b8060005b838110156124e75781516124ce8882612471565b97506124d983612489565b9250506001810190506124ba565b5085935050505092915050565b6000602082019050818103600083015261250e8184612496565b905092915050565b6000806040838503121561252d5761252c6117d8565b5b600061253b85828601611867565b925050602061254c85828601611867565b9150509250929050565b60008083601f84011261256c5761256b611c2d565b5b8235905067ffffffffffffffff8111156125895761258861238a565b5b6020830191508360018202830111156125a5576125a4611cd9565b5b9250929050565b6000806000806000606086880312156125c8576125c76117d8565b5b60006125d688828901611ac2565b955050602086013567ffffffffffffffff8111156125f7576125f66117dd565b5b61260388828901612556565b9450945050604086013567ffffffffffffffff811115612626576126256117dd565b5b61263288828901612556565b92509250509295509295909350565b61264a816118fb565b811461265557600080fd5b50565b60008135905061266781612641565b92915050565b600080600060608486031215612686576126856117d8565b5b600061269486828701612658565b93505060206126a586828701612658565b92505060406126b686828701612658565b9150509250925092565b6126c981611bf7565b82525050565b6126d8816118fb565b82525050565b60006040820190506126f360008301856126c0565b61270060208301846126cf565b9392505050565b60006020828403121561271d5761271c6117d8565b5b600061272b8482850161182b565b91505092915050565b600082825260208201905092915050565b7f6c696d6974206d757374206265203e203020616e64203c3d2033300000000000600082015250565b600061277b601b83612734565b915061278682612745565b602082019050919050565b600060208201905081810360008301526127aa8161276e565b9050919050565b7f6d6f64656c206f776e6572206e6f7420666f756e640000000000000000000000600082015250565b60006127e7601583612734565b91506127f2826127b1565b602082019050919050565b60006020820190508181036000830152612816816127da565b9050919050565b7f6f6666736574206d757374203e3d203020616e64203c206c656e677468206f6660008201527f206c697374206f66206d6f64656c730000000000000000000000000000000000602082015250565b6000612879602f83612734565b91506128848261281d565b604082019050919050565b600060208201905081810360008301526128a88161286c565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806128f657607f821691505b602082108103612909576129086128af565b5b50919050565b7f6d6f64656c206e6f7420666f756e640000000000000000000000000000000000600082015250565b6000612945600f83612734565b91506129508261290f565b602082019050919050565b6000602082019050818103600083015261297481612938565b9050919050565b7f6f6e6c79206d6f64656c206f776e65722063616e206578656375746500000000600082015250565b60006129b1601c83612734565b91506129bc8261297b565b602082019050919050565b600060208201905081810360008301526129e0816129a4565b9050919050565b7f656d707479206d6f64656c4e616d650000000000000000000000000000000000600082015250565b6000612a1d600f83612734565b9150612a28826129e7565b602082019050919050565b60006020820190508181036000830152612a4c81612a10565b9050919050565b7f656d707479206d6f64656c4465736372697074696f6e00000000000000000000600082015250565b6000612a89601683612734565b9150612a9482612a53565b602082019050919050565b60006020820190508181036000830152612ab881612a7c565b9050919050565b7f6d6f64656c20616c726561647920657869737473000000000000000000000000600082015250565b6000612af5601483612734565b9150612b0082612abf565b602082019050919050565b60006020820190508181036000830152612b2481612ae8565b9050919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302612b8d7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82612b50565b612b978683612b50565b95508019841693508086168417925050509392505050565b6000819050919050565b6000612bd4612bcf612bca84611bf7565b612baf565b611bf7565b9050919050565b6000819050919050565b612bee83612bb9565b612c02612bfa82612bdb565b848454612b5d565b825550505050565b600090565b612c17612c0a565b612c22818484612be5565b505050565b5b81811015612c4657612c3b600082612c0f565b600181019050612c28565b5050565b601f821115612c8b57612c5c81612b2b565b612c6584612b40565b81016020851015612c74578190505b612c88612c8085612b40565b830182612c27565b50505b505050565b600082821c905092915050565b6000612cae60001984600802612c90565b1980831691505092915050565b6000612cc78383612c9d565b9150826002028217905092915050565b612ce082611926565b67ffffffffffffffff811115612cf957612cf8611c32565b5b612d0382546128de565b612d0e828285612c4a565b600060209050601f831160018114612d415760008415612d2f578287015190505b612d398582612cbb565b865550612da1565b601f198416612d4f86612b2b565b60005b82811015612d7757848901518255600182019150602085019450602081019050612d52565b86831015612d945784890151612d90601f891682612c9d565b8355505b6001600288020188555050505b505050505050565b600082905092915050565b612dbe8383612da9565b67ffffffffffffffff811115612dd757612dd6611c32565b5b612de182546128de565b612dec828285612c4a565b6000601f831160018114612e1b5760008415612e09578287013590505b612e138582612cbb565b865550612e7b565b601f198416612e2986612b2b565b60005b82811015612e5157848901358255600182019150602085019450602081019050612e2c565b86831015612e6e5784890135612e6a601f891682612c9d565b8355505b6001600288020188555050505b50505050505050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000612ee0602683612734565b9150612eeb82612e84565b604082019050919050565b60006020820190508181036000830152612f0f81612ed3565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000612f5082611840565b9150612f5b83611840565b9250828201905063ffffffff811115612f7757612f76612f16565b5b92915050565b6000612f8882611bf7565b9150612f9383611bf7565b9250828203905081811115612fab57612faa612f16565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000612feb82611840565b915063ffffffff820361300157613000612f16565b5b600182019050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b6000613042602083612734565b915061304d8261300c565b602082019050919050565b6000602082019050818103600083015261307181613035565b905091905056fea26469706673582212206d6c347b5f7d160a1ee7b48ea546c9c64d778933064e15bbeddb1f5f94452ea164736f6c63430008110033";

type VerifierConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VerifierConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Verifier__factory extends ContractFactory {
  constructor(...args: VerifierConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Verifier> {
    return super.deploy(overrides || {}) as Promise<Verifier>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Verifier {
    return super.attach(address) as Verifier;
  }
  override connect(signer: Signer): Verifier__factory {
    return super.connect(signer) as Verifier__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VerifierInterface {
    return new utils.Interface(_abi) as VerifierInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Verifier {
    return new Contract(address, _abi, signerOrProvider) as Verifier;
  }
}
# Model Developers

Setup procedures for using this program as model developers.

## Architecture Diagram

![Model Developer](../docs/v1/arch-diagram-model-developer.png "model developer")

## 0. Installation

Run the following commands **FOR THE FIRST TIME ONLY**, where `xxx` refers to the name of binary of your local environment. See the list of binaries available from [here](https://dist.ipfs.tech/#go-ipfs) (`setup-ipfs` command fetches masOS binary by default, if `IPFS_BINARY` is not specified).  

```sh
# setup circom (no need to execute this command more than once unless you manually deleted 'circom' directory)
$ yarn setup-circom

# setup go-ipfs (no need to execute this command if IPFS repo already exists in your environment)
$ yarn setup-ipfs --IPFS_BINARY=${xxx}
```

## 1. Compiling Circuit

Run the following command to compile circuit, where `xxx` refers to file name of the circuit you would like to compile (`compile-circuit` command compiles `./circuits/demo-circuit.circom` by default, if `CIRCUIT` is not specified).

```sh
$ yarn compile-circuit --CIRCUIT=${xxx}
```

## 2. Generating Z-Keys

We need a proving key for generating ZKPs, and a verification key for verifying ZKPs. Run the following command to generate those z-keys, where each argument refers to the following.

| Argument Name | Description | Default |
|--------------:|-------------|---------|
| **R1CS** | name of `.r1cs` file | `demo-circuit` |
| **PTAU** | name of `.ptau` file | `powersOfTau28_hez_final_17` |
| **ZKEY** | name of intermediate `.zkey` file | `demo_0000` |
| **ZKEY_FINAL** | name of final `.zkey` file | `demo_0001` |

```sh
$ yarn generate-keys --R1CS=${aaa} --PTAU=${bbb} --ZKEY=${ccc} --ZKEY_FINAL=${ddd}
```

## 3. Uploading Files to `IPFS`

We are using [IPFS](https://ipfs.tech/) for storing and sharing static assets in a distributive manner. Run the following commands to connect and upload files to IPFS, where each argument refers to the following.

| Argument Name | Description | Default |
|--------------:|-------------|---------|
| **CIRCUIT** | name of `.circom` file | `demo-circuit` |
| **MODEL** | name of `.h5` file | `demo` |
| **ZKEY_FINAL** | name of final `.zkey` file | `demo_0001` |

```sh
# connect to ipfs p2p network
$ yarn connect-to-ipfs

# upload files to ipfs
$ yarn upload-to-ipfs --CIRCUIT_NAME=${aaa} --MODEL_NAME=${bbb} --ZKEY_NAME=${ccc}
```

## 4. Registering Model to `CustomVerifier` Contract

Model developers interact with prover clients via our `CustomVerifier` contract. Run the following commands to register hash of the files uploaded to IPFS.

```sh
# cd into 'contracts' directory
$ cd ../contracts

# start hardhat blockchain in one window (FIRST TIME ONLY)
$ yarn run-hardhat

# open another window & deploy contracts (FIRST TIME ONLY)
$ yarn deploy-contracts localhost

# register model to the contract
$ yarn register-model localhost

# confirm model registration
$ yarn get-models localhost
```

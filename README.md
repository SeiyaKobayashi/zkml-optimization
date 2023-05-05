# zkml-optimization

Optimization of on-chain private machine learning (public model × private data).

## Architecture Diagrams

### Architecture Diagram of Verifier
![Verifier](./docs/v1/arch-diagram-verifier.png "verifier")

### Architecture Diagram of Prover
![Prover](./docs/v1/arch-diagram-prover.png "prover")

### Architecture Diagram of Model Developer
![Model Developer](./docs/v1/arch-diagram-model-developer.png "model developer")

## Prerequisites

All commands in this `README` (except this section) are assumed to be called from the root directory.

```sh
# cd into this repo
$ cd zkml-optimization
```

## How to Use Demo CLI App

### 0. Installation

Install all the dependencies using `yarn`.

```sh
$ yarn
```

### 1. Steps for Model Developers

#### 1-A. Demo Model & Circuit

We have a demo ML model called `demo.h5` in `./models` directory. This is a classical classification model for MNIST dataset, and is a slightly modified version of [this model](https://github.com/socathie/keras2circom/blob/main/models/best_practice.h5). If needed, you can take a look at its implementation from `demo.ipynb` in `./models` directory.

We are using [keras2circom](https://github.com/socathie/keras2circom) as a way to convert model files (`.h5`) into circom-compatible circuits. Follow the steps in keras2circom's [README](https://github.com/socathie/keras2circom#keras2circom) to convert models into circuits. The demo circuit files auto-generated from the demo model are `demo-circuit.circom` and `demo-circuit-json` in `./circuits/` directory.

We need a patu file for our trusted-setup. Clone `powersOfTau28_hez_final_17.ptau` from [this repo](https://github.com/iden3/snarkjs#7-prepare-phase-2), and place it in `./circuits` directory.

#### 1-B. Circuit Compilation, Z-Key Generation, IPFS, Model Registration

Go to `./model-developers` directory, and follow the instructions in `README.md` for compiling demo circuit, generating z-keys from them, uploading files to IPFS, and registering the resulting hash to our custom verifier contract.

### 2. Steps for Prover Clients

Go to `./provers` directory, and follow the instructions in `README.md` for encoding testing results as a Merkle tree, generating Merkle proofs and ZKPs given the random challenge, and sending proofs to our custom verifier contract for revealing/verification.

## Contributions

### Adding Packages

To minimize side-effects of changes to packages, make sure to pin exact versions when adding packages.

```sh
# example: add package 'xxx' to root project as a dev dependency 
$ yarn add -W -D -E xxx
```

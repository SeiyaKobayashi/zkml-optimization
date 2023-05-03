# Provers

Directory to place source code of prover clients of verifier contracts.

## Architecture Diagram

![Prover](../docs/v1/arch-diagram-prover.png "prover")

## 0. Installation

```sh
# install tensorflowjs via pip
$ pip3 install tensorflowjs

# convert model from keras format to tf format (e.g. converting demo model)
$ yarn convert-keras-to-tf demo demo-tfjs
```

## 1. Encoding Testing Results

```sh
$ yarn encode-testing-results
```

## 2. Interacting with Verifier Contract

```sh
# generate Merkle proofs 
$ yarn generate-merkle-proofs

# generate ZKPs
$ yarn generate-zkps
```

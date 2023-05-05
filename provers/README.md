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

## 2. Commit Merkle Root

```sh
# cd into 'contracts' directory
$ cd ../contracts

# start hardhat blockchain in one window (first time only)
$ yarn run-hardhat

# open another window & deploy contracts (first time only)
$ yarn deploy-contracts localhost

# commit Merkle root to the custom verifier
$ yarn commit-merkle-root localhost

# confirm commitment
$ yarn get-commitments localhost
```

## 3. Generating Merkle Proofs

```sh
$ yarn generate-merkle-proofs
```

## 4. Generating ZKPs

```sh
# generate ZKPs
$ yarn generate-zkps

# generate parameters for verifier contract
$ yarn parameterize-zkps
```

## 5. Send Merkle Proofs & ZKPs to Verifier for Verifications

```sh
# cd into 'contracts' directory
$ cd ../contracts

# start hardhat blockchain in one window (first time only)
$ yarn run-hardhat

# open another window & deploy contracts (first time only)
$ yarn deploy-contracts localhost

# send proofs to the custom verifier
$ yarn send-proofs localhost
```

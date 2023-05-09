# Optimization of Private Machine Learning

*This is a grant project of the PSE Team @ Ethereum Foundation*
*A blogpost and demo by [@SeiyaKobayashi](https://github.com/SeiyaKobayashi)*

## Introduction

Zero-knowledge proof (ZKP) has been one of the hottest topics in layer 2 solutions on public blockchains in the past few years. From enhancing scalability to securing privacy, ZKP plays a critical role to tackle the constraints of the public nature of blockchains.

**Zero-knowledge machine learning (ZK-ML)** is one of the cutting-edge research areas in the world of ZK, with the aim of applying zero-knowledge protocols to many aspects of machine learning model development. From the research and development side, one of the key milestones would be a project called [`zk-mnist`](https://github.com/0xZKML/zk-mnist) that researchers from [0xPARC](https://0xparc.org/) had done from 2021 to 2022. They conceptualized the idea of **private machine learning**, where machine learning operations are executed off-chain, and then its proof of computation is verified on-chain in a trustless manner, **while shielding either weights of a model or inputs to a model using ZKPs**. They implemented a demo ZK app that proves the computation of a simple CNN (Convolutional Neural Network) for handwritten digit recognition of MNIST dataset.

This blogpost, along with the associated GitHub [repo](https://github.com/SeiyaKobayashi/zkml-optimization), further explores how we could generalize and optimize such on-chain verification of off-chain machine learning computation.

## Motivation

Let's say we would like to develop a program for private machine learning with public models and private inputs using ZKPs. Recall that a ZKP is a proof that a given cryptographically verifiable statement is true while revealing nothing about the statement itself. In this case, we would like to prove that **a public model actually makes predictions for some private testing data, whether each of the predictions is correct or not**. In other words, only those who have access to some private testing data are able to compute valid ZKPs that are then verified by a verifier.

However, one of the most critical problems in ZK, especially in ZK-ML, is said to be **the high computation cost of generating a ZKP**. You can read an introductory yet detailed explanation of ZK-SNARKs (the most widely-used scheme of a non-interactive ZKP) from [here](https://zeroknowledge.fm/the-missing-explanation-of-zk-snarks-part-1/). What should be noted here is that the computation cost of generating a ZK-SNARK depends directly on the number of constraints of an arithmetic circuit. 

With respect to the circuit implementation of a machine learning model, the larger and more complex a model becomes, the more constraints a prover is required to compute. That's why the demo app of [`zk-mnist`](https://github.com/0xZKML/zk-mnist) takes up to only a few testing images to prove and verify. However, in practical situations, each party could be assumed to have at least tens of thousands of testing data. Even the MNIST dataset that we are using for our demo app has a testing dataset of 10,000 images, and our simple demo model results in having over a hundred thousand constraints. In other words, **it may take way too much time for generating a ZKP for every single testing image**, even with widely-used efficient proving systems such as `Groth16` or `PLONK`. 

Another room for enhancement would be the ability of taking a wide variety of models other than just a CNN for MNIST. To achieve this, we integrated a Circom transpiler called [keras2circom](https://github.com/socathie/keras2circom) that [*@Cathie*](https://twitter.com/drCathieSo_eth) from the PSE team of Ethereum Foundation had recently implemented into our program.

## Approach

Regarding the optimization of ZKPs, a great variety of optimization techniques have been proposed and implemented by many companies and organizations in the past years. Those range from software optimization, such as optimization of DSL (Domain-Specific Languages; e.g., [`halo 2`](https://github.com/zcash/halo2)) as well as that of proving systems (e.g., `PLONK`), to hardware optimization including the use of GPUs, FPGAs (Field Programmable Gate Arrays) and ZPUs (Zero-Knowledge Processing Units). Most recently, there even exist complete alternatives to ZK-SNARKs such as IVC (Incrementally Verifiable Computation) on a folding scheme called [`Nova`](https://www.notamonadtutorial.com/incrementally-verifiable-computation-nova/). Among all of them, we take the simplest approach; **reducing the number of ZKPs to generate in the first place**. Our intuition comes from the PoW (Proof of Work) algorithm. For the sake of scalability, PoW mining pools do not check every single proof of work miners perform, yet it instead asks them to give it just a few proofs. We applied this technique to our program. 

To achieve random selection of testing data, we first ask provers to add the testing results as data blocks of a Merkle tree. They then register the hash value of the Merkle root to our verifier contract, and in return, the verifier's `commit()` function generates a random binary string (we call it a **challenge**; e.g., `1001011110`). After receiving a random challenge, they search their Merkle leaves to find the nodes that satisfy the challenge. By doing this, we are able to reveal Merkle proofs of the matched nodes before verifying the associated ZKPs. In other words, provers are able to probabilistically convince the verifier of their computation **without proving everything yet only a subset of their testing results**.

#### Q: Why Using Merkle Tree?

![Merkle Tree](./merkle-tree.png "merkle tree")

<p style="text-align: center;">image from https://en.wikipedia.org/wiki/Merkle_tree</p>

A Merkle tree is basically a binary (not necessarily) hash tree, where leaf nodes are the hashes of data and inner nodes are the hashes of their children. What's remarkable about a Merkle tree is that it is computationally easy to prove that some data is contained in a tree (this is called a **Merkle proof**). For example, in order to prove that the `L1` data block in the image above is contained in a tree, we just compare the root hash to a Merkle proof of the array of [`Hash 0-1`, `Hash 1`]. This is why it's ideal for a commit-reveal scheme of a series of data. We used [`merkle-tree`](https://github.com/OpenZeppelin/merkle-tree) library from `OpenZeppelin` for Merkle tree operations.

#### Q: How Do We Search Merkle Tree?

We compare the last N bits of the random challenge to those of hash value of each leaf node to filter out the testing results. We set the size of `N` as `difficulty` when deploying a contract. For example, if `difficulty == 10`, we can expect ${x \over 2^{10}}$ (where x = size of testing data) leaf nodes to be selected. You can take a look at the source code below. As you may notice, we are using previous block hash and block timestamp as a source of randomness (NOTE: we should consider using **true source of randomness** in production). With this filtering logic, provers end up with significantly less number of testing results for generating a ZKP, meaning the total time of generating ZKPs gets substantially reduced. 

```solidity
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
```

```solidity
/**
 * @title Library of some useful bytes operations
 * @author Seiya Kobayashi
 */
library Bytes {
    /**
     * @dev Get last N bits (not bytes) of the given hash value.
     * @param _hash Hash value
     * @param _n Length of bits to get
     * @return tail Last N bits of hash
     */
    function getLastNBits(
        bytes32 _hash,
        uint256 _n
    ) internal pure returns (bytes32) {
        return bytes32(uint256(_hash) % 2 ** _n);
    }
}
```

## Program Architecture

Our program consists mainly of three parts: `verifiers`, `model-developers` and `prover-clients`. The following is the list of a brief description and an architecture diagram of each part. 

### 1. Verifier Contracts

As the name suggests, verifier contracts verify ZKPs with the given verification key. On top of ZKP verification, the contracts do a lot of things, including but not limited to registering models, generating random challenges and verifying Merkle proofs.

![Verifier](./arch-diagram-verifier.png "verifier")

We have the following three smart contracts. We could have a single gigantic contract combining `CustomVerifierFactory` and `CustomVerifier`, yet we intentionally separated it into two contracts for the sake of reducing code complexity. 

- **`CustomVerifierFactory`**: A contract model developers interact with. It spawns a proxy custom verifier contract from `CustomVerifier` when a new model is registered. 
- **`CustomVerifier`**: A contract prover clients interact with. It implements a commit-reveal scheme using a Merkle tree and all the other necessary logics for optimization. 
- **`Verifier`**: A contract that is called from `CustomVerifier` when verifying a ZKP. This contract is auto-generated by model developers via Circom. 

### 2. Model Developers

A model developer is one client of the verifier contracts. We assume they already have trained models, so they transpile models to Circom-compatible circuits and register the hashes returned from IPFS to the verifier.

![Model Developer](./arch-diagram-model-developer.png "model developer")

A model developer is responsible for the following, so that prover clients are easily able to generate ZKPs and send them to the verifier for verification.

- **Model Training**: They should have trained a model using their training data. The model is uploaded to IPFS later, thus a **public** model. Note that they don't have to upload their training data because what matters the most when it comes to machine learning models is **a set of the weights**, not the model architecture or data used for training.
- **Circuit Generation**: We use [`keras2circom`](https://github.com/socathie/keras2circom) as a way to convert a model into a Circom-compatible arithmetic circuit. It takes a '.h5' file and produces `.circom` as well as `.json` files.
- **ZKey Generation**: After compiling a circuit, they generate keys used for generating and verifying a ZKP. Specifically, a verification key is used when auto-generating a verifier contract. 
- **File Upload to IPFS**: It is generally not a good idea to store large data such as a model file on blockchain. Instead, we use [IPFS](https://ipfs.tech/) for storing and hashing large data. 
- **Model Registration**: They finally register a content ID (i.e., resulting hash value from IPFS) along with model details to the verifier. 

### 3. Prover Clients

A prover client is another yet the most important client of the verifier contracts. They fetch registered models and circuits from IPFS, encode testing results as a Merkle tree, and then generate and send ZKPs along with Merkle proofs of the randomly selected testing results to the verifier.

![Prover](./arch-diagram-prover.png "prover")

A prover client is responsible for the following.

- **Testing Results Encoding**: After fetching a model, a circuit and zkeys from IPFS, they run the model against their private testing data. We use a data structure called **Merkle tree** to encode the testing results.
- **Commitment of Merkle Root**: We use a commit-reveal scheme to ensure that provers are being honest about their testing results. Since a hash value of Merkle root can be computed from a valid Merkle proof, we only commit the Merkle root of the generated Merkle tree.
- **Generation of Merkle Proofs**: After committing the Merkle root, the verifier generates **a random challenge** of type `bytes32`. Using the challenge, they search their Merkle tree to find the matched leaf nodes and then generate a Merkle proof for each leaf node.
- **Generation of ZKPs**: After filtering the testing results, they generate ZKPs using the proving key fetched from IPFS. 
- **Providing Merkle Proofs and ZKPs**: Finally, they send both Merkle proofs and ZKPs to the verifier. The verifier reveals the commitment, verifies ZKPs and returns the verification result to them.

## Demo & Discussions

You can find our GitHub repo from [here](https://github.com/SeiyaKobayashi/zkml-optimization). Please follow the instructions in `README`s to set up and play with the demo CLI app in your local environment. Although we cover almost all the installation procedures, you may need to install and configure package installers such as `homebrew` and `pip`, if not installed yet.

The table below compares the actual time our program took for generating and verifying ZKPs with different `difficulty` (*executed on 8GB M1 Macbook Air*). As can be seen, the expected duration of both proving and verifying ZKPs with **appropriate `difficulty`** is significantly less than that without `difficulty` (i.e., without this optimization technique).

| Difficulty | # of ZKPs | Total Proving Time |  Total Verifying Time |
|-----------:|-----------|--------------------|------------------------|
| N/A (no optimization) | 10,000 | several hours | a couple of hours |
| `5` | 306 | 1029.05 seconds | 382.01 seconds |
| `10` | 6 | 21.41 seconds | 8.44 seconds |

However, keep in mind that these results are based on the following implicit assumptions. 

1. Provers **know the exact shape of testing data** to the model, and have done with pre-processing their testing data in advance.
2. Provers manually set the **appropriate `difficulty`** depending on the size of testing data.

There are also some other non-trivial issues.

3. Verifier has **no way to detect duplicate testing data**, because it generates a commitment ID from the given Merkle root and content ID from IPFS. 
4. It is still costly to prove and verify ZKPs of larger models, because **this is not the optimization of ZKP generation process par se**.

## Future Discussions

Our program is only for the demo purpose yet. There are some issues we should consider to make it suitable for more practical, real-world use cases. Each one of the following is an idea of future direction for the issues mentioned in the previous section, respectively.

#### 1. Shape of Testing Data

  After fetching a model from IPFS, provers have to pre-process their testing data to satisfy the interface of inputs to the model. We may use [TensorflowJS](https://github.com/tensorflow/tfjs) to infer the shape and type of testing data from a model. Currently, the demo app only accepts our demo model and demo testing data. 

#### 2. Value of `difficulty`

  The value of `difficulty` should be set dynamically depending on the size of testing data, yet otherwise provers might have to request the verifier to re-generate a random challenge again and again until they find at least one matched leaf node. For now, we set `difficulty` as a constant value, although provers can call a method `updateDifficulty` that updates the value of`difficulty`.

#### 3. Merkle Tree Encoding

  A Merkle tree is constructed by computing hashes from its leaf nodes, meaning **the resulting root hash depends directly on the order of its leaf nodes**. If this contract gets incentivized (e.g., minting tokens upon successful ZKP verification), malicious provers can just modify the order of the same testing data to generate a different root hash, which then allows them to send ZKPs as a different commitment for the rewards. 

#### 4. Circuit Implementation

  It is still far from being practical to transpile huge models with millions of layers to arithmetic circuits. Even if we end up having such a circuit with millions of constraints, the cost of generating zkeys as well as that of generating ZKPs are non-negligible and significantly high. There are some ongoing projects regarding circuit optimization of zero-knowledge machine learning, such as [`zator`](https://github.com/lyronctk/zator).
  
## Conclusion

Using smart contracts in conjunction with ZK-SNARKs and Merkle trees, we were able to successfully develop a working implementation of the optimized, universal architecture of zero-knowledge machine learning. While we implemented a demo app only for the combination of public model and private inputs, the implementation of the other way around (i.e., ZK-ML with private model and public inputs) would essentially be the same. We do have some potential enhancements for our program, however, we hope this project would be a first step to make ZK-ML much more practical and prevalent in the near future.

## References

- [GitHub Repo](https://github.com/SeiyaKobayashi/zkml-optimization)
- Find me on SNS: **Seiya Kobayashi**
    - [GitHub](https://github.com/SeiyaKobayashi)
    - [Facebook](https://www.facebook.com/seiya.kb)
    - Telegram: `@seiya_kobayashi`
    - Discord: `Seiya #9483`

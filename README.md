# zkml-optimization

Optimization for on-chain private machine learning.

## Architecture Diagrams

### Architecture Diagram of Verifier
![Verifier](./docs/v1/arch-diagram-verifier.png "verifier")

### Architecture Diagram of Prover
![Prover](./docs/v1/arch-diagram-prover.png "prover")

### Architecture Diagram of Model Developer
![Model Developer](./docs/v1/arch-diagram-model-developer.png "model developer")

## Prerequisite

All commands in this `README` (except this section) are assumed to be called from the root directory.

```sh
# cd into this repo
$ cd zkml-optimization
```

## Installation

```sh
# install dependencies
$ yarn
```

## Adding Packages

To minimize side-effects of changes to packages, make sure to pin exact versions when adding packages.

```sh
# example: add package 'xxx' to root project as a dev dependency 
$ yarn add -W -D -E xxx
```

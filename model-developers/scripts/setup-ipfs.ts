#! ./node_modules/.bin/ts-node

import 'zx/globals';

const IPFS_BINARY: string = argv.IPFS_BINARY || "darwin-arm64";
const IPFS_LINK: string = `https://dist.ipfs.tech/kubo/v0.19.1/kubo_v0.19.1_${IPFS_BINARY}.tar.gz`;

(async () => {
  console.log('\nSetting up go-ipfs...\n');

  // install go-ipfs
  await $`wget ${IPFS_LINK}`;
  await $`tar xvzf kubo_v0.19.1_${IPFS_BINARY}.tar.gz`;
  await $`cd kubo && sudo ./install.sh`;

  // initialize ipfs repo
  await $`ipfs init`;
})();

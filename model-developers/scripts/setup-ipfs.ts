#! ./node_modules/.bin/ts-node

import 'zx/globals';

const IPFS_BINARY: string = argv.IPFS_BINARY || "darwin-arm64";

(async (): Promise<void> => {
  echo('\nSetting up go-ipfs...');

  // install go-ipfs
  await $`wget https://dist.ipfs.tech/kubo/v0.19.1/kubo_v0.19.1_${IPFS_BINARY}.tar.gz`;
  await $`tar xvzf kubo_v0.19.1_${IPFS_BINARY}.tar.gz`;
  cd('kubo');
  await $`sudo ./install.sh`;

  // initialize ipfs repo
  await $`ipfs init`;

  echo('✅\n');
})();

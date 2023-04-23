#! ./node_modules/.bin/ts-node

import 'zx/globals';

(async () => {
  console.log('\nSetting up circom...\n');

  // clone circom repo
  await $`git clone https://github.com/iden3/circom.git`;

  // compile & install binary
  await $`cd circom && cargo build --release && cargo install --path circom`;
})();

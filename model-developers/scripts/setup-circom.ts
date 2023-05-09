#! ./node_modules/.bin/ts-node

import 'zx/globals';

(async (): Promise<void> => {
  echo('\nSetting up circom...');

  // clone circom repo
  await $`git clone https://github.com/iden3/circom.git`;

  // compile & install binary
  cd('./circom');
  await $`cargo build --release && cargo install --path circom`;

  echo('✅\n');
})();

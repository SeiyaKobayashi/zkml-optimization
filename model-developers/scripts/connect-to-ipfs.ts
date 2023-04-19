#! ./node_modules/.bin/ts-node

import 'zx/globals';

(async () => {
  console.log('\nConnecting to IPFS (DO NOT CLOSE THIS TAB)...\n');

  // connect to ipfs p2p networks
  await $`ipfs daemon`;
})();

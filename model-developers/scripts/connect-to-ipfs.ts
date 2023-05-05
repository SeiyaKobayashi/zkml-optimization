#! ./node_modules/.bin/ts-node

import 'zx/globals';

(async (): Promise<void> => {
  echo('\nConnecting to IPFS (Open another window to continue, and DO NOT CLOSE THIS WINDOW)...');

  // connect to ipfs p2p networks
  await $`ipfs daemon`;

  echo('✅\n');
})();

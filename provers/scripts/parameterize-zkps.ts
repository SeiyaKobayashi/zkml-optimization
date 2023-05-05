#! ./node_modules/.bin/ts-node

import 'zx/globals';

(async (): Promise<void> => {
  let paramsAll: any[] = [];

  // generate parameters for the auto-generated verifier contract
  fs.readdir('./circuit-inputs/', async (_, filenames) => {
    for (let i = 0; i < filenames.length - 1; i++) {
      if (filenames[i] !== '.gitkeep') {
        echo(`\nGenerating parameters of proof-${i}.json for verifier contract...`);
        // NOTE: renaming file names here because `snarkjs generatecall` only accepts certain file names
        fs.rename(`../circuits/proof-${i}.json`, '../circuits/proof.json');
        fs.rename(`../circuits/public-${i}.json`, '../circuits/public.json');
        cd('../circuits');
        const params = await $`yarn snarkjs generatecall`;
        paramsAll.push(params.stdout.split('generatecall')[1].trim());
        fs.rename('../circuits/proof.json', `../circuits/proof-${i}.json`);
        fs.rename('../circuits/public.json', `../circuits/public-${i}.json`);
        echo('✅');
      }
    }

    // save parameters as a JSON file
    echo('\nSaving parameters into \'../circuits/parameterized-zkps.json\'...');
    fs.writeFileSync(
      '../circuits/parameterized-zkps.json',
      JSON.stringify(
        { params: paramsAll }
      ),
    );
    echo('✅\n');
  });
})();

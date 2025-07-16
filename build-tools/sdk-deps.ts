import * as child_process from 'child_process';
import { promises as fs } from 'fs';

async function main() {
  let from = 0;
  let count = 0;
  let more = true;
  const prefix = '@aws-sdk/client-';
  const prefixRegex = '/@aws-sdk\\/client-';

  do {
    const output = await child_process.execFileSync('npm', ['search', prefixRegex, '--json', '--searchopts', `from=${from}`], {
      shell: false,
      encoding: 'utf-8',
    });
    const packages = JSON.parse(output) as Array<{ name: string, version: string }>;

    const pj = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    for (const pkg of packages) {
      if (pkg.name.startsWith(prefix)) {
        pj.dependencies[pkg.name] = `${pkg.version}`;
        count += 1;
      }
    }
    await fs.writeFile('package.json', JSON.stringify(pj, null, 2), 'utf-8');

    from += 20;
    if (packages.length < 20) {
      more = false;
    }
    process.stderr.write('.');
  } while (more);

  process.stderr.write('\n');
  console.log(`Updated package.json with ${count} AWS SDK dependencies.`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


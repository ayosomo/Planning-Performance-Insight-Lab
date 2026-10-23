import {copyFile, mkdir, readdir} from 'node:fs/promises';

// Preserve the public evidence URLs when Vercel builds directly from GitHub.
const root = new URL('../', import.meta.url);
const output = new URL('dist/evidence/', root);
await mkdir(output, {recursive: true});
for (const name of await readdir(new URL('docs/screenshots/', root))) {
  if (name.endsWith('.jpg')) {
    await copyFile(new URL(`docs/screenshots/${name}`, root), new URL(name, output));
  }
}
for (const name of ['architecture.png', 'architecture.svg']) {
  await copyFile(new URL(`docs/${name}`, root), new URL(name, output));
}

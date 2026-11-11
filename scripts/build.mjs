import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { check, root } from './check.mjs';

await check();
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of [
  'index.html',
  'styles.css',
  'app.js',
  'theme.js',
  'data',
  'assets',
]) {
  await cp(path.join(root, file), path.join(dist, file), { recursive: true });
}
await writeFile(path.join(dist, '.nojekyll'), '');
console.log('Статический сайт собран в dist/');

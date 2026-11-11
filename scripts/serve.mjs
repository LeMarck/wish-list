import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    const file = path.resolve(
      root,
      '.' + (pathname.endsWith('/') ? `${pathname}index.html` : pathname),
    );
    const relative = path.relative(root, file);
    if (
      relative.startsWith('..') ||
      relative.split(path.sep).some((part) => part.startsWith('.'))
    ) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const body = await readFile(file);
    res
      .writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      .end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});
server.listen(Number(process.env.PORT || 5173), '127.0.0.1', () =>
  console.log(`Local: http://127.0.0.1:${server.address().port}`),
);

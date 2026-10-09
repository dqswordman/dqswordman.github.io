import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, relative, sep, extname } from 'node:path';
import { buildSite, outputRoot, projectRoot } from './build.mjs';
import { normalizeBasePath } from '../src/content.mjs';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

export function createSiteServer({ basePath = process.env.BASE_PATH || '' } = {}) {
  basePath = normalizeBasePath(basePath);
  const root = fileURLToPath(outputRoot);
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }
    const send = async (path, status = 200) => {
      const body = await readFile(path);
      response.writeHead(status, {
        'Content-Type': mimeTypes[extname(path)] || 'application/octet-stream',
        'Content-Length': body.length,
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    };
    try {
      const url = new URL(request.url, 'http://localhost');
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        response.writeHead(400);
        response.end('Invalid URL');
        return;
      }
      if (pathname.includes('\0') || pathname.includes('\\')) {
        response.writeHead(400);
        response.end('Invalid path');
        return;
      }
      if (basePath && pathname === basePath) {
        response.writeHead(308, { Location: `${basePath}/${url.search}` });
        response.end();
        return;
      }
      if (basePath && !pathname.startsWith(`${basePath}/`)) {
        await send(resolve(root, '404.html'), 404);
        return;
      }
      pathname = pathname.slice(basePath.length);
      let target = resolve(root, `.${pathname}`);
      const local = relative(root, target);
      if (
        local === '..' ||
        local.startsWith(`..${sep}`) ||
        resolve(target) === resolve(root, '..')
      ) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      let info;
      try {
        info = await stat(target);
      } catch {
        await send(resolve(root, '404.html'), 404);
        return;
      }
      if (info.isDirectory()) {
        if (!url.pathname.endsWith('/')) {
          response.writeHead(308, { Location: `${url.pathname}/${url.search}` });
          response.end();
          return;
        }
        target = resolve(target, 'index.html');
      }
      try {
        await send(target);
      } catch {
        await send(resolve(root, '404.html'), 404);
      }
    } catch (error) {
      if (!response.headersSent) {
        response.writeHead(500);
        response.end('Preview server error');
      } else response.end();
      console.error(error.message);
    }
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('--port');
  const port = Number(portIndex === -1 ? process.env.PORT || 4173 : args[portIndex + 1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Choose a port between 1 and 65535');
  const basePath = normalizeBasePath(process.env.BASE_PATH || '');
  await buildSite({ basePath });
  const server = createSiteServer({ basePath });
  server.on('error', (error) => {
    console.error(`Could not start preview: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () =>
    console.log(`Preview → http://127.0.0.1:${port}${basePath}/`),
  );

  const watchers = [];
  if (args.includes('--watch')) {
    let timer;
    let building = false;
    let queued = false;
    const rebuild = async () => {
      if (building) {
        queued = true;
        return;
      }
      building = true;
      try {
        const { stdout } = await promisify(execFile)(
          process.execPath,
          [fileURLToPath(new URL('build.mjs', import.meta.url))],
          {
            cwd: fileURLToPath(projectRoot),
            env: { ...process.env, BASE_PATH: basePath },
          },
        );
        console.log(stdout.trim());
        console.log('Rebuilt. Refresh the browser to see your changes.');
      } catch (error) {
        console.error(`Build failed: ${error.message}`);
      } finally {
        building = false;
        if (queued) {
          queued = false;
          await rebuild();
        }
      }
    };
    for (const folder of ['src', 'content', 'public'])
      watchers.push(
        watch(new URL(`${folder}/`, projectRoot), { recursive: true }, () => {
          clearTimeout(timer);
          timer = setTimeout(rebuild, 150);
        }),
      );
    console.log('Watching src/, content/, and public/.');
  }
  const shutdown = () => {
    for (const watcher of watchers) watcher.close();
    server.close();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

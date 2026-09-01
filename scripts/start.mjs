import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, normalize, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import worker from '../dist/server/index.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '0.0.0.0';
const publicDirectory = resolve('dist/client');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function resolvePublicFile(pathname) {
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = normalize(decodedPath).replace(/^([/\\])+/, '');
  const filePath = resolve(publicDirectory, relativePath);

  if (filePath !== publicDirectory && !filePath.startsWith(`${publicDirectory}${sep}`)) {
    return null;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }

  return filePath;
}

function contentType(filePath) {
  if (filePath.endsWith('.js.descarga')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css.descarga')) return 'text/css; charset=utf-8';
  return mimeTypes.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream';
}

function servePublicFile(request, response, filePath) {
  const stats = statSync(filePath);
  const isImmutableAsset = filePath.includes(`${sep}_next${sep}static${sep}`);

  response.statusCode = 200;
  response.setHeader('Content-Type', contentType(filePath));
  response.setHeader('Content-Length', stats.size);
  response.setHeader(
    'Cache-Control',
    isImmutableAsset ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
  );

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

async function handleWorkerRequest(request, response) {
  const forwardedProtocol = request.headers['x-forwarded-proto'];
  const protocol = forwardedProtocol === 'https' ? 'https' : 'http';
  const authority = request.headers.host ?? `localhost:${port}`;
  const url = new URL(request.url ?? '/', `${protocol}://${authority}`);
  const method = request.method ?? 'GET';
  const init = { method, headers: request.headers };

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = Readable.toWeb(request);
    init.duplex = 'half';
  }

  const pendingTasks = new Set();
  const executionContext = {
    waitUntil(task) {
      const promise = Promise.resolve(task).finally(() => pendingTasks.delete(promise));
      pendingTasks.add(promise);
    },
    passThroughOnException() {},
  };

  const workerResponse = await worker.fetch(new Request(url, init), {}, executionContext);
  response.statusCode = workerResponse.status;
  response.statusMessage = workerResponse.statusText;

  for (const [name, value] of workerResponse.headers) {
    if (name !== 'set-cookie') response.setHeader(name, value);
  }

  const cookies = workerResponse.headers.getSetCookie?.() ?? [];
  if (cookies.length > 0) response.setHeader('Set-Cookie', cookies);

  if (!workerResponse.body || method === 'HEAD') {
    response.end();
    return;
  }

  Readable.fromWeb(workerResponse.body).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

    if (pathname === '/health') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end('{"status":"ok"}');
      return;
    }

    if (request.method === 'GET' || request.method === 'HEAD') {
      const filePath = resolvePublicFile(pathname);
      if (filePath) {
        servePublicFile(request, response, filePath);
        return;
      }
    }

    await handleWorkerRequest(request, response);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    response.end('Internal Server Error');
  }
});

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});

function shutdown() {
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import packageInfo from '../package.json' with { type: 'json' };
import { NO_RESPONSE } from './no.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();
const publicPath = resolve(__dirname, '../public');

app.use(express.static(publicPath));

app.use('/health', (req, res, next) => {
  if (req.method !== 'GET') {
    next();
    return;
  }

  res.status(200).json({ status: NO_RESPONSE, version: packageInfo.version });
});

app.all('/api/no', (req, res) => {
  res.status(200).type('text/plain').send(NO_RESPONSE);
});

app.use((req, res) => {
  res.status(200).type('text/plain').send(NO_RESPONSE);
});

export function resolveListenPort(address, fallbackPort) {
  return typeof address === 'object' && address ? address.port : fallbackPort;
}

export function resolveServerPort(port = process.env.PORT || 3000) {
  return port;
}

export function startServer(port = resolveServerPort()) {
  const server = app.listen(port, () => {
    const actualPort = resolveListenPort(server.address(), port);

    console.log(`NaaS listening on http://localhost:${actualPort}`);
  });

  return server;
}

export function runIfMain({
  moduleUrl = import.meta.url,
  argvPath = process.argv[1],
  start = startServer
} = {}) {
  if (moduleUrl === pathToFileURL(resolve(argvPath)).href) {
    start();
  }
}

runIfMain();

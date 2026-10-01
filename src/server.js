import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import packageInfo from '../package.json' with { type: 'json' };
import { NO_RESPONSE } from './no.js';
import { createRateLimitMiddleware } from './rate-limit.js';
import { parseRateLimitConfig, validateRateLimitConfig } from './rate-limit-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp({ rateLimitConfig } = {}) {
  const app = express();
  const publicPath = resolve(__dirname, '../public');
  const resolvedRateLimitConfig = rateLimitConfig
    ? validateRateLimitConfig(rateLimitConfig)
    : parseRateLimitConfig();

  app.use(express.static(publicPath));

  app.all('/health', (req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    res.status(200).json({ status: NO_RESPONSE, version: packageInfo.version });
  });

  app.use(createRateLimitMiddleware(resolvedRateLimitConfig));

  app.all('/api/no', (req, res) => {
    res.status(200).type('text/plain').send(NO_RESPONSE);
  });

  app.use((req, res) => {
    res.status(200).type('text/plain').send(NO_RESPONSE);
  });

  return app;
}

export const app = createApp();

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

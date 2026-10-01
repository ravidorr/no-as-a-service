import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { after, before, test } from 'node:test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import packageInfo from '../package.json' with { type: 'json' };
import { app, resolveListenPort, resolveServerPort, runIfMain, startServer } from '../src/server.js';

const serverPath = resolve('src/server.js');

let server;
let baseUrl;

function requestServer(url, method) {
  return new Promise((resolve, reject) => {
    const request = httpRequest(url, { method }, (response) => {
      let body = '';

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ body, headers: response.headers, status: response.statusCode });
      });
    });

    request.on('error', reject);
    request.end();
  });
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test('returns health status and version as JSON', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.deepEqual(await response.json(), { status: 'No!', version: packageInfo.version });
});

test('returns No! for unmatched paths below health', async () => {
  const response = await fetch(`${baseUrl}/health/anything`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal(await response.text(), 'No!');
});

test('returns No! for POST /health', async () => {
  const response = await fetch(`${baseUrl}/health`, { method: 'POST' });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal(await response.text(), 'No!');
});

test('returns plain-text fallback headers for HEAD /health', async () => {
  const response = await fetch(`${baseUrl}/health`, { method: 'HEAD' });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
});

test('returns No! for any path', async () => {
  const response = await fetch(`${baseUrl}/anything/really?x=1`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal(await response.text(), 'No!');
});

test('serves the OpenAPI specification', async () => {
  const response = await fetch(`${baseUrl}/openapi.yaml`);
  const document = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/yaml; charset=utf-8');
  assert.match(document, /^openapi: 3\.1\.1$/m);
  assert.match(document, /^  title: NaaS API$/m);
  assert.match(document, /^  \/health:$/m);
  assert.match(document, /^  \/api\/no:$/m);
  assert.match(document, /^                required: \[status, version\]$/m);
  assert.match(document, /^        text\/plain:$/m);
  assert.match(document, /^    head:\n      responses:\n        '200':\n          description: No response body$/m);
  assert.match(document, /^x-naas-catch-all:$/m);
  assert.match(document, /^  description: Every unmatched request path and HTTP method returns `200 text\/plain` with `No!`\.$/m);

  for (const method of ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']) {
    assert.match(document, new RegExp(`^    ${method}:$`, 'm'));
  }
});

test('serves the UI at root', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.match(body, /<title>NaaS<\/title>/);
  assert.match(body, /<h1 id="title">NaaS - No as a Service<\/h1>/);
  assert.match(body, /id="naas-form"/);
  assert.match(body, /What do you want to ask NaaS\?/);
  assert.match(body, />Ask NaaS<\/button>/);
  assert.match(body, /id="share-link"/);
  assert.match(body, /id="copy-url-button"/);
  assert.match(body, />Copy link<\/button>/);
  assert.match(body, /id="preview-link-button"/);
  assert.match(body, />Preview link<\/button>/);
  assert.match(body, /id="share-status"/);
  assert.match(body, /id="share-x-link"/);
  assert.match(body, /aria-label="Share on X"/);
  assert.match(body, /id="share-facebook-link"/);
  assert.match(body, /aria-label="Share on Facebook"/);
  assert.match(body, /id="share-linkedin-link"/);
  assert.match(body, /aria-label="Share on LinkedIn"/);
  assert.match(body, /id="share-email-link"/);
  assert.match(body, /aria-label="Share by email"/);
  assert.match(body, /id="share-whatsapp-link"/);
  assert.match(body, /aria-label="Share on WhatsApp"/);
  assert.match(body, />Share link<\/p>/);
  assert.match(body, /All done\. Share the link below\./);
  assert.match(body, /Opening this link shows the question and the NaaS reply\./);
});

test('returns No! from the UI API endpoint', async () => {
  const response = await fetch(`${baseUrl}/api/no`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: 'yes' })
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal(await response.text(), 'No!');
});

test('returns No! for every documented API method', async () => {
  for (const method of ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH', 'TRACE']) {
    const response = await requestServer(`${baseUrl}/api/no`, method);

    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
    assert.equal(response.body, method === 'HEAD' ? '' : 'No!');
  }
});

test('returns No! for any payload', async () => {
  const response = await fetch(`${baseUrl}/api`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ answer: 'yes', nested: { still: true } })
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'No!');
});

test('returns No! for other HTTP methods', async () => {
  for (const method of ['PUT', 'PATCH', 'DELETE']) {
    const response = await fetch(`${baseUrl}/nope`, {
      method,
      body: method === 'DELETE' ? undefined : 'whatever'
    });

    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'No!');
  }
});

test('resolveListenPort uses the socket address when available', () => {
  assert.equal(resolveListenPort({ port: 4242 }, 3000), 4242);
});

test('resolveListenPort falls back when the address is not an object', () => {
  assert.equal(resolveListenPort('/tmp/naas.sock', 3000), 3000);
  assert.equal(resolveListenPort(null, 3000), 3000);
});

test('resolveServerPort falls back to 3000 when PORT is unset', () => {
  const previousPort = process.env.PORT;

  try {
    delete process.env.PORT;
    assert.equal(resolveServerPort(), 3000);
  } finally {
    if (previousPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = previousPort;
    }
  }
});

test('resolveServerPort uses PORT from the environment', () => {
  const previousPort = process.env.PORT;

  try {
    process.env.PORT = '8080';
    assert.equal(resolveServerPort(), '8080');
  } finally {
    if (previousPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = previousPort;
    }
  }
});

test('runIfMain starts the server for the executed module', (t) => {
  const start = t.mock.fn();

  runIfMain({
    moduleUrl: pathToFileURL(serverPath).href,
    argvPath: serverPath,
    start
  });

  assert.equal(start.mock.calls.length, 1);
});

test('runIfMain skips startup when imported as a dependency', (t) => {
  const start = t.mock.fn();

  runIfMain({
    moduleUrl: pathToFileURL(serverPath).href,
    argvPath: resolve('test/server.test.js'),
    start
  });

  assert.equal(start.mock.calls.length, 0);
});

test('startServer uses PORT from the environment by default', async (t) => {
  const previousPort = process.env.PORT;

  try {
    process.env.PORT = '0';
    const log = t.mock.method(console, 'log');
    const startedServer = startServer();

    await new Promise((resolvePromise) => startedServer.once('listening', resolvePromise));

    const { port } = startedServer.address();
    assert.equal(log.mock.calls[0]?.arguments[0], `NaaS listening on http://localhost:${port}`);

    await new Promise((resolvePromise, reject) => {
      startedServer.close((error) => (error ? reject(error) : resolvePromise()));
    });
  } finally {
    if (previousPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = previousPort;
    }
  }
});

test('startServer listens and logs the assigned URL', async (t) => {
  const log = t.mock.method(console, 'log');
  const startedServer = startServer(0);

  await new Promise((resolvePromise) => startedServer.once('listening', resolvePromise));

  const { port } = startedServer.address();
  assert.notEqual(port, 0);
  assert.equal(log.mock.calls[0]?.arguments[0], `NaaS listening on http://localhost:${port}`);

  await new Promise((resolvePromise, reject) => {
    startedServer.close((error) => (error ? reject(error) : resolvePromise()));
  });
});

test('server entrypoint starts when executed directly', async () => {
  const child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdout = '';

  const ready = new Promise((resolvePromise, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('server startup timed out')), 5000);

    child.stdout.on('data', (chunk) => {
      stdout += chunk;

      if (stdout.includes('NaaS listening on http://localhost:')) {
        clearTimeout(timeoutId);
        resolvePromise();
      }
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code !== null && code !== 0) {
        clearTimeout(timeoutId);
        reject(new Error(`server exited early with code ${code}`));
      }
    });
  });

  await ready;

  const portMatch = stdout.match(/http:\/\/localhost:(\d+)/);
  assert.ok(portMatch);

  const response = await fetch(`http://127.0.0.1:${portMatch[1]}/anything`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'No!');

  child.kill();
  await new Promise((resolvePromise) => child.on('close', resolvePromise));
});

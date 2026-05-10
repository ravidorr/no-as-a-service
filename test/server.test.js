import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { app } from '../src/server.js';

let server;
let baseUrl;

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

test('returns No! for any path', async () => {
  const response = await fetch(`${baseUrl}/anything/really?x=1`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal(await response.text(), 'No!');
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

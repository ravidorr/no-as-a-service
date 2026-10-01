import assert from 'node:assert/strict';
import express from 'express';
import { test } from 'node:test';
import { createMetrics, normalizeRoute } from '../src/metrics.js';

async function startApp(configure) {
  const app = express();
  configure(app);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  };
}

test('normalizeRoute maps known service paths and collapses everything else', () => {
  assert.equal(normalizeRoute('/version'), 'version');
  assert.equal(normalizeRoute('/health'), 'health');
  assert.equal(normalizeRoute('/metrics'), 'metrics');
  assert.equal(normalizeRoute('/api/no'), 'api_no');
  assert.equal(normalizeRoute('/anything'), 'fallback');
  assert.equal(normalizeRoute('/health/anything'), 'fallback');
});

test('createMetrics exposes isolated registries with default and custom metric families', async () => {
  const first = createMetrics();
  const second = createMetrics();

  const firstText = await first.metrics();
  const secondText = await second.metrics();

  assert.notEqual(firstText, secondText);
  assert.match(firstText, /# HELP process_cpu_user_seconds_total/);
  assert.match(firstText, /# HELP naas_http_requests_total/);
  assert.match(firstText, /# HELP naas_http_request_duration_seconds/);
  assert.match(firstText, /# HELP naas_http_requests_in_flight/);
  assert.match(secondText, /# HELP naas_http_requests_total/);
});

test('middleware records normalized labels and decrements in-flight gauge on finish', async () => {
  const metrics = createMetrics();
  const { baseUrl, close } = await startApp((app) => {
    app.use(metrics.middleware);
    app.post('/api/no', (_req, res) => {
      res.status(201).send('created');
    });
  });

  try {
    const response = await fetch(`${baseUrl}/api/no`, { method: 'POST' });
    assert.equal(response.status, 201);

    const text = await metrics.metrics();

    assert.match(text, /naas_http_requests_total\{route="api_no",method="POST",status_code="201"\} 1/);
    assert.match(text, /naas_http_request_duration_seconds_count\{route="api_no",method="POST",status_code="201"\} 1/);
    assert.match(text, /naas_http_requests_in_flight\{route="api_no",method="POST"\} 0/);
  } finally {
    await close();
  }
});

test('middleware does not observe /metrics scrape traffic', async () => {
  const metrics = createMetrics();
  const { baseUrl, close } = await startApp((app) => {
    app.use(metrics.middleware);
    app.get('/metrics', (_req, res) => {
      res.status(200).send('metrics');
    });
  });

  try {
    const response = await fetch(`${baseUrl}/metrics`);
    assert.equal(response.status, 200);

    const text = await metrics.metrics();

    assert.doesNotMatch(text, /naas_http_requests_total\{route="metrics"/);
    assert.doesNotMatch(text, /naas_http_requests_in_flight\{route="metrics"/);
  } finally {
    await close();
  }
});

test('middleware normalizes unmatched paths to fallback', async () => {
  const metrics = createMetrics();
  const { baseUrl, close } = await startApp((app) => {
    app.use(metrics.middleware);
    app.use((_req, res) => {
      res.status(200).type('text/plain').send('No!');
    });
  });

  try {
    await fetch(`${baseUrl}/anything/really`);

    const text = await metrics.metrics();

    assert.match(text, /naas_http_requests_total\{route="fallback",method="GET",status_code="200"\} 1/);
  } finally {
    await close();
  }
});

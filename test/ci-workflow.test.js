import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const ciWorkflowPath = resolve('.github/workflows/ci.yml');

test('CI smoke job starts the app and checks public endpoint contracts', () => {
  const workflow = readFileSync(ciWorkflowPath, 'utf8');
  const smokeJob = workflow.match(/^  smoke:\n(?<body>(?:    .*\n|\n)*)/m)?.groups?.body;

  assert.ok(smokeJob);
  assert.match(smokeJob, /^    runs-on: ubuntu-latest$/m);
  assert.match(smokeJob, /^      - name: Set up Node\.js\n        uses: actions\/setup-node@v7\n        with:\n          node-version: 22\n          cache: npm$/m);
  assert.match(smokeJob, /^      - name: Install dependencies\n        run: npm ci$/m);
  assert.match(smokeJob, /npm start > server\.log 2>&1 &/);
  assert.match(smokeJob, /trap cleanup EXIT/);
  assert.match(smokeJob, /curl --fail --silent --show-error http:\/\/127\.0\.0\.1:3000\/health > health\.json/);
  assert.match(smokeJob, /cat server\.log/);
  assert.match(smokeJob, /http:\/\/127\.0\.0\.1:3000\/api\/no/);
  assert.match(smokeJob, /http:\/\/127\.0\.0\.1:3000\/health/);
  assert.match(smokeJob, /http:\/\/127\.0\.0\.1:3000\/version/);
  assert.match(smokeJob, /\[ "\$\(cat api-no\.txt\)" = "No!" \]/);
  assert.match(smokeJob, /health\.status !== "No!"/);
  assert.match(smokeJob, /EXPECTED_VERSION="\$expected_version"/);
  assert.match(smokeJob, /\[ "\$\(cat version\.txt\)" = "\$expected_version" \]/);
});

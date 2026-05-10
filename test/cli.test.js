import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { test } from 'node:test';

const cliPath = resolve('src/cli.js');

test('CLI returns No!', () => {
  const result = spawnSync(process.execPath, [cliPath], { encoding: 'utf8' });

  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'No!\n');
  assert.equal(result.stderr, '');
});

test('CLI ignores arguments and stdin', () => {
  const result = spawnSync(process.execPath, [cliPath, '--payload', 'yes'], {
    encoding: 'utf8',
    input: '{"question":"please?"}'
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'No!\n');
  assert.equal(result.stderr, '');
});

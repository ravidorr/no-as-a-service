import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shouldSyncPackageLock } from '../scripts/sync-package-lock.mjs';

test('shouldSyncPackageLock runs when package.json is staged', () => {
  assert.equal(shouldSyncPackageLock(['README.md', 'package.json']), true);
});

test('shouldSyncPackageLock skips commits without package.json', () => {
  assert.equal(shouldSyncPackageLock(['README.md', 'src/server.js']), false);
});

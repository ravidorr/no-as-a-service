import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compareVersions,
  hasChangelogEntry,
  parseVersion,
  validateReleaseNotes
} from '../scripts/release-notes.mjs';

test('parseVersion reads semver triples', () => {
  assert.deepEqual(parseVersion('1.2.3'), [1, 2, 3]);
});

test('compareVersions detects newer versions', () => {
  assert.equal(compareVersions('0.1.1', '0.1.0') > 0, true);
  assert.equal(compareVersions('0.1.0', '0.1.0'), 0);
  assert.equal(compareVersions('0.1.0', '0.2.0') < 0, true);
});

test('hasChangelogEntry matches release headings', () => {
  const changelog = `# Changelog

## 0.1.1 - 2026-10-01

- Add docs.
`;

  assert.equal(hasChangelogEntry(changelog, '0.1.1'), true);
  assert.equal(hasChangelogEntry(changelog, '0.1.0'), false);
});

test('validateReleaseNotes requires a version bump and changelog entry', () => {
  const errors = validateReleaseNotes({
    headVersion: '0.1.0',
    baseVersion: '0.1.0',
    changelog: '# Changelog\n'
  });

  assert.deepEqual(errors, [
    'package.json version must be bumped above 0.1.0, found 0.1.0.',
    'CHANGELOG.md must include a release entry heading for version 0.1.0 (for example: ## 0.1.0 - YYYY-MM-DD).'
  ]);
});

test('validateReleaseNotes passes when version and changelog are updated', () => {
  const errors = validateReleaseNotes({
    headVersion: '0.1.1',
    baseVersion: '0.1.0',
    changelog: '# Changelog\n\n## 0.1.1 - 2026-10-01\n\n- Add docs.\n'
  });

  assert.deepEqual(errors, []);
});

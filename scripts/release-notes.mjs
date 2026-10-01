import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseVersion(version) {
  const match = VERSION_PATTERN.exec(version);

  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] - rightParts[index];
    }
  }

  return 0;
}

export function readPackageVersionAtRef(ref = 'HEAD') {
  const contents =
    ref === 'HEAD'
      ? readFileSync('package.json', 'utf8')
      : execSync(`git show ${ref}:package.json`, { encoding: 'utf8' });

  return JSON.parse(contents).version;
}

export function readChangelogAtRef(ref = 'HEAD') {
  return ref === 'HEAD'
    ? readFileSync('CHANGELOG.md', 'utf8')
    : execSync(`git show ${ref}:CHANGELOG.md`, { encoding: 'utf8' });
}

export function hasChangelogEntry(changelog, version) {
  const escapedVersion = version.replace(/\./g, '\\.');
  const pattern = new RegExp(`^## ${escapedVersion} - `, 'm');

  return pattern.test(changelog);
}

export function validateReleaseNotes({
  headVersion,
  baseVersion,
  changelog
}) {
  const errors = [];

  if (compareVersions(headVersion, baseVersion) <= 0) {
    errors.push(
      `package.json version must be bumped above ${baseVersion}, found ${headVersion}.`
    );
  }

  if (!hasChangelogEntry(changelog, headVersion)) {
    errors.push(
      `CHANGELOG.md must include a release entry heading for version ${headVersion} (for example: ## ${headVersion} - YYYY-MM-DD).`
    );
  }

  return errors;
}

export function verifyReleaseNotesAgainstBase(baseRef) {
  const headVersion = readPackageVersionAtRef('HEAD');
  const baseVersion = readPackageVersionAtRef(baseRef);
  const changelog = readChangelogAtRef('HEAD');

  return validateReleaseNotes({
    headVersion,
    baseVersion,
    changelog
  });
}

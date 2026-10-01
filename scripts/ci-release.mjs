import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { extractChangelogSection, readPackageVersionAtRef } from './release-notes.mjs';

const beforeSha = process.env.GITHUB_EVENT_BEFORE;
const version = readPackageVersionAtRef('HEAD');

if (!beforeSha || /^0+$/.test(beforeSha)) {
  console.log('Skipping release: no previous commit to compare.');
  process.exit(0);
}

let beforeVersion;

try {
  beforeVersion = readPackageVersionAtRef(beforeSha);
} catch (error) {
  console.log(`Skipping release: unable to read previous package.json (${error.message}).`);
  process.exit(0);
}

if (beforeVersion === version) {
  console.log(`Skipping release: version unchanged at ${version}.`);
  process.exit(0);
}

const tag = `v${version}`;
const existingTags = execSync('git tag --list', { encoding: 'utf8' })
  .split('\n')
  .map((entry) => entry.trim())
  .filter(Boolean);

if (existingTags.includes(tag)) {
  console.log(`Release tag ${tag} already exists.`);
  process.exit(0);
}

const changelog = execSync('git show HEAD:CHANGELOG.md', { encoding: 'utf8' });
const releaseNotes = extractChangelogSection(changelog, version);
const notesPath = 'release-notes.md';

writeFileSync(notesPath, releaseNotes);

execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: 'inherit' });
execSync(`git push origin ${tag}`, { stdio: 'inherit' });

console.log(`::set-output name=version::${version}`);
console.log(`::set-output name=tag::${tag}`);
console.log(`::set-output name=notes_path::${notesPath}`);
console.log(`Prepared release ${tag}.`);

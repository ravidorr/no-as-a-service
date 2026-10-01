import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function listStagedFiles() {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });

  return output
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function shouldSyncPackageLock(stagedFiles) {
  return stagedFiles.includes('package.json');
}

export function syncPackageLock() {
  const stagedFiles = listStagedFiles();

  if (!shouldSyncPackageLock(stagedFiles)) {
    return false;
  }

  execSync('npm install', { stdio: 'inherit' });
  execSync('git add package-lock.json', { stdio: 'inherit' });

  return true;
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  syncPackageLock();
}

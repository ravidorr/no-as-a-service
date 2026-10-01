import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export function normalizePath(path) {
  return path.split(sep).join('/');
}

export function listSourceFiles(directory = 'src') {
  const entries = readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(path);
    }

    return entry.name.endsWith('.js') ? [normalizePath(relative('src', path))] : [];
  });
}

export function extractCoverageReport(output) {
  const start = output.indexOf('# start of coverage report');
  const end = output.indexOf('# end of coverage report');

  if (start === -1 || end === -1 || end <= start) {
    return '';
  }

  return output.slice(start, end);
}

export function parseCoverageFiles(output) {
  const files = new Set();
  const report = extractCoverageReport(output);
  const rowPattern = /^# {2}([A-Za-z0-9._/-]+\.js)\s+\|/gm;

  for (const match of report.matchAll(rowPattern)) {
    files.add(normalizePath(match[1].trim()));
  }

  return files;
}

export function findCoverageInventoryMismatches(output, expectedFiles = listSourceFiles()) {
  const reportedFiles = [...parseCoverageFiles(output)].sort();
  const expected = [...expectedFiles].sort();

  return {
    missingFiles: expected.filter((file) => !reportedFiles.includes(file)),
    unexpectedFiles: reportedFiles.filter((file) => !expected.includes(file))
  };
}

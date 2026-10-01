# Contributing to NaaS

Thanks for helping improve No as a Service.

## Prerequisites

- Node.js 22 or newer
- npm

## Setup

```sh
git clone https://github.com/ravidorr/no-as-a-service.git
cd no-as-a-service
npm install
```

`npm install` also installs the Husky pre-commit hook.

## Validation

Run the fast test suite:

```sh
npm test
```

Before opening a pull request, run the coverage gate that CI and the pre-commit hook use:

```sh
npm run test:coverage
```

Release requirements:

- bump the `"version"` field in `package.json` above the version on `main`
- add a matching release entry to `CHANGELOG.md` using the format `## X.Y.Z - YYYY-MM-DD`

Verify release notes locally:

```sh
npm run verify:release-notes
```

The pre-push hook and CI pull request checks enforce the same rules.

Coverage requirements:

- 100% line, branch, and function coverage for every file under `src/`
- every `src/**/*.js` file must appear in the coverage report

## Pull request expectations

1. Branch from the latest `main`.
2. Keep changes focused on one fix or feature.
3. Update or add tests when behavior changes.
4. Open a pull request against `main`.
5. Ensure the `test` and `release-notes` CI checks pass.
6. Request review and resolve all review conversations before merge.

Protected `main` requires:

- passing `test` and `release-notes` checks
- at least one approving review
- resolved review conversations

## Releases

When a version bump merges to `main`, GitHub Actions creates a GitHub Release and publishes `@ravidorr/naas` to npm.

Maintainers must configure the repository secret `NPM_TOKEN` with an npm automation token that can publish `@ravidorr/naas`.

## Git hooks

The pre-commit hook runs `npm install` and stages `package-lock.json` whenever `package.json` is part of the commit.

The pre-commit hook also runs `npm run test:coverage`. Commits are blocked if tests fail or coverage drops below 100% for `src/`.

The pre-push hook runs `npm run verify:release-notes`. Pushes are blocked unless `package.json` is version-bumped and `CHANGELOG.md` includes a matching release entry.

To skip a hook in an emergency only:

```sh
HUSKY=0 git commit ...
HUSKY=0 git push ...
```

Use that sparingly. CI will still enforce the same checks.

## Code style

Match the existing code in the file you are editing. Keep changes minimal and readable.

## Questions

Open a [GitHub issue](https://github.com/ravidorr/no-as-a-service/issues) if something is unclear.

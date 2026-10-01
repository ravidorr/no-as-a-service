# Changelog

## 0.2.5 - 2026-10-01

- Add `GET /health`, returning JSON NaaS status and the package version.

## 0.2.4 - 2026-10-01

- Add ROADMAP.md with completed work, Phase 3 plan, and release reminders.
- Link the roadmap from README.

## 0.2.3 - 2026-10-01

- Publish as `@ravidor/naas` to match the npm account scope (GitHub org/user remains `ravidorr`).
- Parse Node.js 24 info-prefixed coverage reports in the inventory check.
- Run coverage explicitly in the release workflow before publishing without lifecycle scripts.

## 0.2.2 - 2026-10-01

- Preserve non-workflow paths when classifying renamed files for release-note validation.

## 0.2.1 - 2026-10-01

- Skip release-note validation for pull requests that only update GitHub workflows.

## 0.2.0 - 2026-10-01

- Publish the package to npm as `@ravidor/naas` with global `naas` and `naas-mcp` binaries.
- Automate GitHub Releases and npm publish when a version bump lands on `main`.
- Split release-notes verification into its own required CI job for pull requests and pushes.
- Add Dependabot updates for npm dependencies and GitHub Actions.
- Refresh the README with Node.js 22+, npm install instructions, and community doc links.
- Skip Husky setup during CI and non-git installs so global npm installs stay clean.

## 0.1.1 - 2026-10-01

- Enforce 100% `src/` coverage in tests, CI, and the pre-commit hook.
- Verify every `src/**/*.js` file appears in the coverage report.
- Require Node.js 22 for coverage threshold support.
- Add community docs: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `PRIVACY.md`, and `SUPPORT.md`.
- Block pushes and pull requests unless `package.json` is version-bumped and `CHANGELOG.md` has a matching release entry.
- Regenerate and stage `package-lock.json` automatically when `package.json` is committed.

## 0.1.0 - 2026-05-10

- Initial NaaS API.
- Return `No!` as plain text for any request path, method, or payload.
- Add `naas` CLI that returns `No!`.
- Add `naas-mcp` stdio MCP server with a `no` tool.
- Add vanilla HTML, CSS, and JavaScript UI.
- Clear the UI response when the request input is cleared.
- Add UI timeout/error handling for stuck or failed requests.
- Add shareable NaaS links that autoplay a request and response.
- Move the share link below the response and explain what it does.
- Reveal sharing controls only after a successful NaaS reply and add Preview.
- Clarify the request field label and primary action copy.
- Rename the share action to `Copy link`.
- Rename `Preview` to `Preview link`.
- Add social share links for X, Facebook, LinkedIn, Email, and WhatsApp.
- Replace social share text labels with accessible icon links.
- Rename the social share label to `Share link`.
- Replace rough social SVG paths with package-sourced icons.
- Add MIT license.
- Replace social icons with Font Awesome Free icons.
- Match social icon buttons to service colors.
- Use black for the email share icon.
- Simplify the generated link explanation.

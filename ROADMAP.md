# NaaS roadmap

Living plan for [no-as-a-service](https://github.com/ravidorr/no-as-a-service). Update this file when scope or priorities change.

**Current release:** [`@ravidor/naas`](https://www.npmjs.com/package/@ravidor/naas) — version on `main` lives in [`package.json`](./package.json); tags and notes on [GitHub Releases](https://github.com/ravidorr/no-as-a-service/releases).

## Decisions (locked in)

| Topic | Choice |
| --- | --- |
| npm package | `@ravidor/naas` (matches npm user `ravidor`; GitHub stays `ravidorr`) |
| CI publish | [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) via `release.yml` (no `NPM_TOKEN`) |
| Required checks on `main` | `test`, `release-notes` |
| Rate limit (when built) | HTTP `429`, body `No!` (plain text) |
| Container registry | Local `docker build` only for now; [GHCR](https://ghcr.io) later |

## Done

- [x] Core API, CLI, MCP, and web UI
- [x] 100% `src/` coverage enforced (pre-commit + CI)
- [x] Community docs (`CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`, `PRIVACY`, `SUPPORT`)
- [x] Branch protection (review, resolved threads, required CI)
- [x] Release notes guard (pre-push + CI)
- [x] Auto lockfile sync from staged `package.json`
- [x] Dependabot (npm + GitHub Actions)
- [x] GitHub Releases on version bump to `main`
- [x] npm publish `@ravidor/naas` + Trusted Publisher for `ravidorr/no-as-a-service` / `release.yml`
- [x] README install and contributor guidance
- [x] Phase 3a: Health endpoint (`GET /health` JSON status and version)
- [x] Phase 3b: OpenAPI specification at `GET /openapi.yaml`
- [x] Phase 3c: Production Docker image with `/health` health check
- [x] Phase 3d: IP-keyed rate limiting with env-configured limits and `429` + `No!`
- [x] Graceful shutdown (SIGTERM/SIGINT) for containers with draining `/health`
- [x] `GET /version` plain-text package version endpoint
- [x] E2E smoke in CI (`curl /api/no`, `/health`, `/version`)

## Next

Phase 3 product work is complete. Optional follow-ups:

- GHCR publish on release
- Prometheus `/metrics`

## Release process (reminder)

1. Branch from `main`
2. Implement + tests (keep 100% `src/` coverage)
3. Bump `package.json` version and add `## X.Y.Z - date` to `CHANGELOG.md`
4. Open PR → pass `test` + `release-notes` → review → merge
5. Merge triggers GitHub Release + npm publish (Trusted Publishing)

Manual publish is only needed for bootstrap or recovery; routine releases are automated.

## Tracking

- **This file:** high-level plan and status
- **GitHub issues:** create one issue per Phase 3 PR when work starts (optional but recommended)
- **CHANGELOG.md:** shipped work per version

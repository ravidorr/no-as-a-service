# NaaS roadmap

Living plan for [no-as-a-service](https://github.com/ravidorr/no-as-a-service). Update this file when scope or priorities change.

**Current release:** `@ravidor/naas@0.2.3` on [npm](https://www.npmjs.com/package/@ravidor/naas)

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

## Next (Phase 3 — product)

Ship as **small PRs**, each with version bump + `CHANGELOG.md` entry.

| Order | Work | Deliverable | Target bump |
| --- | --- | --- | --- |
| 3a | Health endpoint | `GET /health` → `200` JSON (`status`, `version`); registered before catch-all | patch |
| 3b | OpenAPI | `openapi.yaml` + serve or static path; documents `/health`, `/api/no`, catch-all behavior | patch |
| 3c | Docker | `Dockerfile`, `.dockerignore`, README run instructions; `HEALTHCHECK` on `/health` | patch |
| 3d | Rate limiting | Middleware (env-configured); exempt `/health` and static assets; `429` + `No!` | minor |

### Optional follow-ups (after 3a–3d)

- Graceful shutdown (SIGTERM) for containers
- `GET /version` (if not redundant with `/health`)
- E2E smoke in CI (`curl /health`, `/api/no`)
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

# Rate limiting design

## Goal

Add process-local, IP-keyed HTTP rate limiting for the NaaS service. Throttled
requests return `429 text/plain` with the body `No!`, matching the roadmap
contract.

## Delivery

- Add `express-rate-limit` as a direct dependency.
- Add configuration parsing for positive-integer `RATE_LIMIT_WINDOW_MS` and
  `RATE_LIMIT_MAX` environment variables.
- Install the limiter after static assets and `GET /health`, but before
  `/api/no` and the fallback middleware.
- Document runtime configuration in README and the throttling contract in
  OpenAPI.
- Reconcile ROADMAP.md so completed Phase 3a through 3c items move to Done.

## Defaults and configuration

- Default window: 15 minutes (`900000` ms).
- Default max requests per client IP per window: `100`.
- Override with `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`.
- Invalid, zero, fractional, or negative configured values fail application
  startup with a clear error.
- Express proxy trust is not enabled in this task. Client identity is the
  direct peer IP.

## Exemptions

The limiter does not run for:

- Static assets served from `public/`, including `/openapi.yaml` and the UI.
- `GET /health`.

Non-GET requests to `/health` continue through the fallback and are rate
limited.

## Throttled response

When a client exhausts its quota:

- HTTP status: `429`
- Content type: `text/plain; charset=utf-8`
- Body: `No!`
- Headers: modern `RateLimit-*` and `Retry-After`
- Legacy `X-RateLimit-*` headers: disabled

## Tests

Add integration coverage for:

- Static asset and `GET /health` exemptions
- `/api/no` and fallback throttling
- Exact throttled response body and content type
- Modern rate-limit headers
- Per-client separation when client identity differs
- Configured limit and window behavior via injected configuration
- Invalid configuration startup failures

Keep the repository's 100% `src/` coverage requirement.

## Release

This is the roadmap's Phase 3d minor release. Bump `package.json` and
`package-lock.json` from `0.2.7` to `0.3.0`, and add a matching entry to
`CHANGELOG.md`.

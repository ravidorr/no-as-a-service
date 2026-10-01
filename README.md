# NaaS

No as a Service.

Every request returns:

```text
No!
```

## Requirements

- Node.js 22 or newer
- npm

## Install

Install globally from npm:

```sh
npm install -g @ravidor/naas
```

Or clone and run locally:

```sh
git clone https://github.com/ravidorr/no-as-a-service.git
cd no-as-a-service
npm install
```

## Run

```sh
npm start
```

The API listens on `http://localhost:3000` by default.

The UI is available at `http://localhost:3000`.
Use `?request=` to open a shareable NaaS flow that types and submits the request automatically.

Health check:

```sh
curl http://localhost:3000/health
```

Output:

```json
{"status":"No!","version":"0.6.1"}
```

Prometheus metrics:

```sh
curl http://localhost:3000/metrics
```

Output is Prometheus text format (`text/plain; charset=utf-8; version=0.0.4`).
The endpoint is public, exempt from rate limiting, and remains available during
graceful shutdown.

Custom HTTP metrics:

- `naas_http_requests_total{route,method,status_code}`
- `naas_http_request_duration_seconds{route,method,status_code}`
- `naas_http_requests_in_flight{route,method}`

Route labels are normalized to `version`, `health`, `metrics`, `api_no`, or
`fallback`. Scrape traffic to `/metrics` is not counted in the custom HTTP
metrics.

Standard Node.js process and runtime metrics (CPU, memory, event loop, GC) are
also included.

Treat `/metrics` as an internal operations endpoint. On the public internet,
bind to a private network, restrict access at your reverse proxy, or scrape
from an internal URL only. See [SECURITY.md](SECURITY.md) for deployment
guidance.

Version:

```sh
curl http://localhost:3000/version
```

Output:

```text
0.6.1
```

OpenAPI specification:

```sh
curl http://localhost:3000/openapi.yaml
```

```sh
curl -X POST http://localhost:3000/anything \
  -H 'content-type: application/json' \
  -d '{"question":"Can I?"}'
```

Output:

```text
No!
```

Use a different port:

```sh
PORT=8080 npm start
```

Rate limiting applies to `/api/no` and fallback routes. Static assets,
`GET /health`, and `GET /metrics` are exempt. Throttled requests return `429`
with the body `No!`.

Configure the limit with environment variables:

```sh
RATE_LIMIT_WINDOW_MS=900000 RATE_LIMIT_MAX=100 npm start
```

Defaults are 100 requests per client IP every 15 minutes. Limits are stored in
process memory, so multiple instances do not share quota state. With N replicas,
the effective limit is roughly N times the configured maximum unless you use a
shared store (for example Redis; see [ROADMAP.md](ROADMAP.md)).

Behind a reverse proxy or ingress, set `TRUST_PROXY` so limits key on the
client IP from `X-Forwarded-For` instead of the proxy IP:

```sh
TRUST_PROXY=1 npm start
```

Accepted values are `true`, `false`, or a non-negative integer hop count. When
unset, Express trust proxy stays disabled.

Graceful shutdown applies when the process receives `SIGTERM` or `SIGINT`, such
as `docker stop` or local `Ctrl+C`. The server marks itself as draining and
continues accepting connections briefly so orchestrators can observe `503` on
`GET /health` with the same JSON body. After a readiness grace period, it stops
accepting new connections, reaps idle keep-alive sockets, and waits for active
requests to finish.

Configure the drain deadline and readiness grace with:

```sh
SHUTDOWN_TIMEOUT_MS=30000 SHUTDOWN_READINESS_GRACE_MS=1000 npm start
```

The default drain deadline is 30 seconds. The default readiness grace is 1
second. After the deadline, remaining HTTP connections are force-closed before
exit. A second signal during shutdown exits immediately with a non-zero status.

## Docker

Pull the published release image:

```sh
docker pull ghcr.io/ravidorr/no-as-a-service:0.6.1
```

Run the container:

```sh
docker run --rm -p 3000:3000 ghcr.io/ravidorr/no-as-a-service:0.6.1
```

The version tag is immutable. `latest` tracks the newest release:

```sh
docker pull ghcr.io/ravidorr/no-as-a-service:latest
docker run --rm -p 3000:3000 ghcr.io/ravidorr/no-as-a-service:latest
```

Build the image locally:

```sh
docker build -t naas .
docker run --rm -p 3000:3000 naas
```

Verify the health check:

```sh
curl http://localhost:3000/health
```

Inspect container health status:

```sh
docker inspect --format='{{.State.Health.Status}}' "$(docker ps -q --filter ancestor=naas)"
```

Use a different port:

```sh
docker run --rm -e PORT=8080 -p 8080:8080 naas
```

The image runs Node directly as PID 1 so container stop signals reach the HTTP
server. `docker stop` triggers bounded graceful draining using the same
`SHUTDOWN_TIMEOUT_MS` behavior as local runs.

## CLI

After a global install:

```sh
naas anything at all
```

For local development:

```sh
npm link
naas anything at all
```

Output:

```text
No!
```

## MCP

Run the stdio MCP server:

```sh
npm run mcp
```

After a global install or `npm link`, MCP clients can use:

```sh
naas-mcp
```

It exposes one tool:

- `no`: returns `No!` and ignores all arguments.

## Test

```sh
npm test
```

Contributors should also run the coverage gate before opening a pull request:

```sh
npm run test:coverage
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for completed work and the release process.

## Community

- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Privacy](PRIVACY.md)

Release policy: every merged change must bump the version in `package.json` and add a matching entry to `CHANGELOG.md`. See [Contributing](CONTRIBUTING.md) for details.

## License

MIT

Social icons are from Font Awesome Free.

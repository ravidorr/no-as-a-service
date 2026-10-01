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

See [ROADMAP.md](ROADMAP.md) for completed work, Phase 3 plan, and release process.

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

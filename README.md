# NaaS

No as a Service.

Every request returns:

```text
No!
```

## Run

```sh
npm install
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

After `npm link`, MCP clients can use:

```sh
naas-mcp
```

It exposes one tool:

- `no`: returns `No!` and ignores all arguments.

## Test

```sh
npm test
```

## License

MIT

Social icons are from Font Awesome Free.

# OpenAPI specification design

## Goal

Publish a machine-readable OpenAPI document for the NaaS HTTP service and make
it available from a running instance at `GET /openapi.yaml`.

## Delivery

- Add `public/openapi.yaml` as an OpenAPI 3.1 document.
- Rely on the existing static middleware to serve it at `/openapi.yaml`.
- Include the YAML file in the npm package's published files.
- Link to the specification from the README.
- Cover the served specification with server tests.

## API contract

The specification will describe:

- `GET /health`, returning `200 application/json` with:
  - `status`, a string whose current value is `No!`
  - `version`, the package version
- `/api/no`, where `GET`, `PUT`, `POST`, `DELETE`, `OPTIONS`, `HEAD`,
  `PATCH`, and `TRACE` each return `200 text/plain` with the body `No!`

The application fallback handles every unmatched path and method with
`200 text/plain` and `No!`. OpenAPI path templates cannot express an
arbitrary-depth catch-all route without misrepresenting the behavior. The
document will state this behavior in its API description and an
`x-naas-catch-all` vendor extension instead of adding an inaccurate path item.
Static assets, `/health`, and `/api/no` take precedence over the fallback.

## Implementation boundaries

No Express route will be added. `express.static(publicPath)` already exposes
the public directory before the API and catch-all middleware, which ensures
the YAML document is served with an appropriate YAML content type.

## Tests

Add a server test that requests `/openapi.yaml` and verifies:

- HTTP status `200`
- A YAML content type
- The OpenAPI document identity and documented endpoint names

Existing tests remain responsible for the runtime behavior described by the
document.

## Release

This is the roadmap's Phase 3b patch release. Update `package.json` and
`package-lock.json` by one patch version, and add a matching entry to
`CHANGELOG.md`.

# OpenAPI Specification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an OpenAPI 3.1 document for NaaS at `GET /openapi.yaml`.

**Architecture:** Store the YAML document in `public/`, which the existing Express static middleware serves before API and fallback handlers. The document describes the health endpoint and all explicitly supported `/api/no` operations, while declaring the arbitrary-depth fallback with an `x-naas-catch-all` extension because OpenAPI path templates cannot accurately model it.

**Tech Stack:** Node.js 22+, Express 5 static middleware, Node.js built-in test runner, OpenAPI 3.1 YAML.

## Global Constraints

- Do not add a YAML parser or an OpenAPI UI dependency.
- Preserve the existing `200 text/plain` `No!` behavior for all unmatched requests.
- The published npm package already includes `public/`; adding `public/openapi.yaml` therefore requires no `files` list change.
- Bump the package from `0.2.5` to `0.2.6` and add the matching changelog entry dated `2026-10-01`.
- Maintain 100% `src/` coverage.

---

### Task 1: Publish and document the OpenAPI specification

**Files:**
- Create: `public/openapi.yaml`
- Modify: `test/server.test.js:51-57`
- Modify: `README.md:43-65`
- Modify: `package.json:2-28`
- Modify: `package-lock.json:1-10`
- Modify: `CHANGELOG.md:1-5`

**Interfaces:**
- Consumes: `express.static(publicPath)` in `src/server.js`, which serves files in `public/` before `/health`, `/api/no`, and the fallback middleware.
- Produces: `GET /openapi.yaml` returning the OpenAPI YAML document as `text/yaml`.
- Produces: an OpenAPI 3.1 document with `GET /health`, all eight OpenAPI HTTP operations for `/api/no`, and a root-level `x-naas-catch-all` extension documenting unmatched-request behavior.

- [ ] **Step 1: Write the failing server test**

Insert this test in `test/server.test.js` after the existing catch-all request test:

```js
test('serves the OpenAPI specification', async () => {
  const response = await fetch(`${baseUrl}/openapi.yaml`);
  const document = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/yaml; charset=utf-8');
  assert.match(document, /^openapi: 3\.1\.1$/m);
  assert.match(document, /^  title: NaaS API$/m);
  assert.match(document, /^  \/health:$/m);
  assert.match(document, /^  \/api\/no:$/m);
  assert.match(document, /^x-naas-catch-all:$/m);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```sh
node --test --test-name-pattern="serves the OpenAPI specification" test/server.test.js
```

Expected: the new test fails because `/openapi.yaml` reaches the existing fallback and returns `text/plain; charset=utf-8` with `No!`.

- [ ] **Step 3: Add the minimal OpenAPI document**

Create `public/openapi.yaml` with this complete document:

```yaml
openapi: 3.1.1
info:
  title: NaaS API
  version: 0.2.6
  description: |
    Every unmatched path and HTTP method returns `200 text/plain` with `No!`.
    Static assets, `GET /health`, and `/api/no` take precedence over that fallback.
paths:
  /health:
    get:
      summary: Return service health and package version
      responses:
        '200':
          description: NaaS health status
          content:
            application/json:
              schema:
                type: object
                required: [status, version]
                properties:
                  status:
                    type: string
                    const: No!
                  version:
                    type: string
  /api/no:
    get:
      responses:
        '200':
          $ref: '#/components/responses/NoResponse'
    put:
      responses:
        '200':
          $ref: '#/components/responses/NoResponse'
    post:
      responses:
        '200':
          $ref: '#/components/responses/NoResponse'
    delete:
      responses:
        '200':
          $ref: '#/components/responses/NoResponse'
    options:
      responses:
        '200':
          $ref: '#/components/responses/NoResponse'
    head:
      responses:
        '200':
          $ref: '#/components/responses/NoResponse'
    patch:
      responses:
        '200':
          $ref: '#/components/responses/NoResponse'
    trace:
      responses:
        '200':
          $ref: '#/components/responses/NoResponse'
components:
  responses:
    NoResponse:
      description: NaaS response
      content:
        text/plain:
          schema:
            type: string
            const: No!
x-naas-catch-all:
  description: Every unmatched request path and HTTP method returns `200 text/plain` with `No!`.
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```sh
node --test --test-name-pattern="serves the OpenAPI specification" test/server.test.js
```

Expected: one passing test, with `/openapi.yaml` served as `text/yaml; charset=utf-8`.

- [ ] **Step 5: Update human-facing release documentation**

Make these exact changes:

```diff
*** README.md
@@
 Health check:
@@
 {"status":"No!","version":"0.2.6"}
 ```
+
+OpenAPI specification:
+
+```sh
+curl http://localhost:3000/openapi.yaml
+```

*** package.json
@@
-  "version": "0.2.5",
+  "version": "0.2.6",

*** package-lock.json
@@
-  "version": "0.2.5",
+  "version": "0.2.6",
@@
-      "version": "0.2.5",
+      "version": "0.2.6",

*** CHANGELOG.md
@@
 # Changelog
+
+## 0.2.6 - 2026-10-01
+
+- Publish an OpenAPI specification at `GET /openapi.yaml` for health, `/api/no`, and fallback behavior.
```

- [ ] **Step 6: Run the full verification suite**

Run:

```sh
npm test && npm run test:coverage && npm run verify:release-notes
```

Expected: all tests pass, all `src/` files remain at 100% coverage, and release-note validation accepts version `0.2.6` with its matching changelog entry.

- [ ] **Step 7: Commit the completed Phase 3b deliverable**

Run:

```sh
git add public/openapi.yaml test/server.test.js README.md package.json package-lock.json CHANGELOG.md
git commit -m "feat: publish OpenAPI specification"
```

Expected: the commit succeeds without bypassing hooks.

## Self-review

- Spec coverage: Task 1 delivers the static served file, endpoint documentation, catch-all extension, server test, README link, patch version, lockfile version, and changelog entry.
- Placeholder scan: no incomplete requirements or generic test steps remain.
- Interface consistency: the test, static file path, API URL, content type, and version use `/openapi.yaml`, `text/yaml; charset=utf-8`, and `0.2.6` consistently.

# Typographist

Typography libraries for JavaScript and components for Vue, React, and Solid.

The Nx workspace contains four ESM packages under `packages/`. Their public entry points are currently empty.

Use the Node.js version in `.nvmrc`, then run `npm ci`.

- `npm run build` builds all packages and declaration files.
- `npm run typecheck` checks source and tool configurations.
- `npm run lint` and `npm run format:check` check code and formatting.
- `npm test` runs the Vitest projects, including release automation tests. Library test targets need real tests before CI can pass.
- `npm run docs` generates TypeDoc after `npm run build`.

Releases and documentation publication run in GitHub Actions after updates to `master`. All four packages share one version, with patch releases by default.

For a minor or major release, add `.release/request.json` with `{"type":"minor"}` or `{"type":"major"}` and format it with `npm run format`. The release Action consumes the request once.

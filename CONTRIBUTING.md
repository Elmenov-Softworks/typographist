# Contributing

Open an issue for a bug or feature request. For a proposed change, fork this
repository and open a pull request against `master`.
Discuss changes to public behavior before implementing them.

Keep pull requests focused. Add tests for behavior changes and update the
relevant documentation. Maintainers control merges, releases, and deployments;
external contributions do not grant write access.

## Local checks

Use the Node.js version in `.nvmrc`, then run:

```sh
npm ci
npm run build
npm run lint
npm run format:check
npm run typecheck
npm test
```

List the checks you ran in the pull request. Do not include generated releases,
credentials, or unrelated changes.

Report security vulnerabilities through the Security tab rather than a public
issue. See [SECURITY.md](SECURITY.md).

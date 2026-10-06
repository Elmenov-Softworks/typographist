# TypeScript Dependencies

Use npm and commit package-lock.json. Do not introduce competing lockfiles.

Use ESM and modern supported tooling in new projects. CommonJS output requires an explicit compatibility requirement.

Use Node.js LTS and record the selected version in .nvmrc. Prefer dedicated configuration files where supported. Use engines only for a meaningful consumer compatibility contract, not merely duplicate pinning.

Compatible dependency ranges are allowed; exact versions are not mandatory.

Inspect existing dependencies before adding packages. Check for suitable packages in @elmenov-softworks and prefer them. If a user-owned package only partially fits, ask rather than silently adding workarounds.

If no suitable user-owned package exists, obtain approval before adding a third-party dependency. No packages are currently confirmed as mandatory: verify availability and never invent names or APIs.

Avoid dependencies for trivial functionality, but do not reimplement complex or security-sensitive functionality merely to avoid one.

Prefer suitable Rust-based tooling when an equivalent meets requirements. Do not introduce unnecessary tools or migrations solely because they use Rust.

## Detailed engineering guidance

## Dependencies

Prefer platform and language capabilities when they solve the problem clearly.

Do not add a package for trivial functionality.

Use established libraries for complex areas where custom implementations are risky or wasteful.

Examples include:

- parsing complex standards;
- cryptography;
- schema validation;
- date and timezone edge cases;
- protocol implementations.

Evaluate dependency cost instead of following a blanket "no dependencies" rule.

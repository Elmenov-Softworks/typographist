# Testing

Use Vitest for unit and integration tests. Do not introduce Jest or node:test in new projects.

Use Cypress when E2E testing is required; do not add E2E tests speculatively.

Place *.spec.ts beside the tested module. Integration tests may use a dedicated directory next to the module whose integration is tested.

Use vitest.config.ts. Enable globals and configure the matching TypeScript and ESLint test environments. Do not explicitly import test globals.

Run tests in ESM and check types separately with TypeScript.

Use the transformation pipeline supported by the tooling. Prefer suitable Rust-based equivalents when transformation is needed; do not add extra transformers by default. swc-jest is a Jest adapter and must not be added to Vitest.

Do not collect coverage, impose thresholds, or add coverage providers by default.

Test observable behavior, boundaries, and failure paths. Keep tests deterministic. Separate setup, execution, and assertions with whitespace rather than ceremonial comments.

Mock or fake external, expensive, or nondeterministic boundaries. Unit tests must not use real network services. Do not mock every internal collaborator or couple tests to private implementation details.

Do not change production architecture solely for testing unless the design also improves. Avoid meaningless tests.

## Detailed engineering guidance

## Testing

Test observable behavior.

Keep tests readable and deterministic.

Use blank lines to separate setup, execution, and verification when useful.

Prefer:

```ts
const service = createService();
const command = createCommand();

const result = await service.execute(command);

expect(result.status).toBe('success');
```

over:

```ts
const service = createService();
const command = createCommand();
const result = await service.execute(command);
expect(result.status).toBe('success');
```

Do not add ceremonial comments such as:

```ts
// Arrange
// Act
// Assert
```

when whitespace already makes the phases obvious.

Do not create tests that simply reproduce the implementation.

Do not mock every collaborator.

Mock or fake external, expensive, nondeterministic, or difficult boundaries as appropriate.

Avoid coupling tests to private implementation details.

Test important boundaries and failure cases.

Do not add meaningless tests or collect coverage by default.

Do not change production architecture solely for testing unless the design also improves.

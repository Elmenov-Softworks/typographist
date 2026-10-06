# ESLint

Use flat configuration in eslint.config.ts.

Start with ESLint recommended and typescript-eslint strict type-checked rules. Configure type-aware linting for source, tests, and tool configuration files.

Override preset rules that contradict inferred function return types, naming, or class conventions.

Enforce prohibitions on non-null assertions and restrictions on any and type assertions. Permit safe const assertions.

After explicit user approval, narrowly suppress the relevant rule for unavoidable any or assertions, with a short reason. Never disable restrictions project-wide.

Run Prettier separately. Disable conflicting formatting rules; do not execute Prettier as an ESLint rule.

Detect circular imports with tooling that understands TypeScript and aliases.

Prefer external, internal, then relative import groups. Ordering is secondary; do not add alphabetic sorting or noisy import-only changes.

Allow unused contract-required parameters prefixed with _. Do not retain unnecessary local variables this way.

Allow console. Prohibit debugger.

Ignore generated and vendored files, not application source merely to make checks pass.

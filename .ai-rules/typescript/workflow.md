# Development Workflow

Inspect project instructions, relevant source, configuration, dependencies, and tests before changing code.

For new projects, use an applicable setup skill when available. If missing, report that and obtain approval before manual setup. Do not invent or claim to run unavailable skills.

Migrate existing tooling or conventions only on explicit user request. Preserve established behavior during focused changes.

Keep CI, Husky, and publication procedures in separately requested skills.

After changes, proactively run applicable type checks, lint, formatting checks, and tests. Start with affected tests and expand appropriately.

Use non-mutating verification commands. Fix formatting deliberately.

Verify aliases in relevant execution environments and the public entry point of library output.

If an unrelated pre-existing issue blocks verification, report its impact and offer concrete solution options. Do not fix it without a request.

Review the diff for unintended behavior changes, unnecessary dependencies, circular imports, overloaded responsibilities, and unapproved type-safety escapes.

Report checks actually run and validation that could not be completed. Never claim a check passed without evidence.

## Detailed engineering guidance

## Before finishing

Before completing a TypeScript change, check that:

- source files have not grown into oversized multi-responsibility files;
- normal application files approaching 1000 lines have been decomposed;
- functions and methods have visible logical structure;
- meaningful blank lines separate distinct stages;
- fields, constructors, accessors, and methods are grouped clearly;
- any and type assertions have explicit user approval and no safe practical alternative;
- no non-null assertions or explicit return-type annotations were introduced;
- type assertions are justified;
- external data is validated where required;
- internal contracts rely on the type system instead of redundant runtime checks;
- types reflect real domain states;
- `null` and `undefined` are used consistently;
- async operations have deliberate sequencing or concurrency;
- no unnecessary classes or generic abstractions were added;
- files still have clear responsibilities;
- utilities have not become dumping grounds;
- services have not become oversized orchestration containers;
- module boundaries remain explicit;
- imports do not introduce circular dependencies;
- no type-level cleverness makes the code harder to understand.

# Specification review checklist

- [x] Record current behavior and the repository baseline.
- [x] Pin the reference package and Spec Kit template revision.
- [x] Catalogue all public reference rules and mark scope exclusions.
- [x] Separate universal locale contracts from optional hyphenation data.
- [x] Include configuration, compatibility, failure, and performance verification scenarios.
- [x] Resolve bundled-locale coverage: Russian and English.
- [x] Exclude content and number conversions from the supported rule scope.
- [x] Record symbolic-only formatting and content-preservation acceptance requirements.
- [x] Obtain owner approval of the final saved draft on 2026-10-08.

These checks describe specification preparation, not implementation or test completion.

## Workspace verification — 2026-10-08

This historical verification predates bundled quotation support. The completed
quotation workspace verification below supersedes its implementation gaps.

Verified on `feature/typography` at `c5302a39a12a661ce647b3fe5e882cdfe4f6a413`
with Node v24.21.0. The working tree was clean before verification.

| Command                                   | Result                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                | Passed: 57 files, 1,519 tests.                                                                                            |
| `npm run typecheck`                       | Passed; Nx reused cached task results.                                                                                    |
| `NX_SKIP_NX_CACHE=true npm run typecheck` | Passed: root TypeScript check and all five project checks, including the core build prerequisite, without Nx cache reuse. |
| `npm run lint`                            | Passed; the TypeScript resolver emitted its multiple-project performance warning.                                         |
| `npm run format:check`                    | Passed.                                                                                                                   |
| `npm run build`                           | Passed; one of five project tasks reused the Nx cache.                                                                    |
| `NX_SKIP_NX_CACHE=true npm run build`     | Passed: all five projects without Nx cache reuse.                                                                         |

A Node ESM smoke check imported `packages/typographist/dist/index.js` and
passed ten assertions across both algorithms: English and Russian
hyphenation-only outputs, punctuation-only ellipsis formatting without soft
hyphens, and exact input preservation with every category disabled.
This checks emitted import resolution in Node; it is not a browser runtime test.

An additional quotation smoke assertion failed: selecting `categories: ['quotes']`
left `"hello"` unchanged instead of applying English quotation marks.
The registry currently prepares bundled spacing, dash, punctuation and
nonbreaking-spacing rules, but has no bundled quotation handler. TP-R056
(`common/punctuation/quote`) therefore remains unimplemented. The green suite
does not establish quotation acceptance under US1 or FR-003.

Feature acceptance remains open. Implement and verify bundled quotation
behavior, then finish the reference-rule coverage audit. The README now documents
the category default change, hyphenation-only migration, settings, protection and
consumer text locales, and explicitly identifies the missing bundled quote handler.
The existing benchmark report explicitly measures an earlier implementation;
it does not establish performance of the completed feature.

## Reference coverage audit — 2026-10-08

[The source coverage audit](reference-coverage.md) accounts for all 107 inventory
entries: 64 of the 65 included or adapted entries have bundled implementations,
including the shared English mapping for TP-R034. TP-R056 remains missing.
The audit does not claim complete behavior coverage and records the remaining
quotation, CR/LF preparation, browser and final benchmark checks.

## Completed quotation workspace verification — 2026-10-08

Verified at `7e1de4d7fb6450351dfee82d1065da34dc0d875c` with Node v24.21.0,
matching `.nvmrc`. The working tree was clean before verification.

| Command                                   | Result                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `npm test`                                | Passed: 59 files, 1,640 tests.                                                   |
| `NX_SKIP_NX_CACHE=true npm run build`     | Passed: all five projects without Nx cache reuse.                                |
| `NX_SKIP_NX_CACHE=true npm run typecheck` | Passed: root and all five project checks, plus the core build prerequisite.      |
| `npm run lint`                            | Passed; the resolver emitted its multiple-project performance warning.           |
| `npm run format:check`                    | Passed before this record update; targeted formatting also passed after editing. |

A Node ESM smoke check imported the freshly built core entry point and passed
24 assertions across Russian and English, both algorithms, and cache budgets
of zero and 64 MiB. Quotes-only formatting applied the locale quotation pair;
combined default formatting preserved the quoted word after removing permitted
soft hyphens; all-disabled formatting preserved the exact input, including
leading spaces and CR/LF. This verifies emitted imports and the previously
failing quotation scenario in Node. It does not verify a browser runtime.

All 65 included or adapted entries now have bundled handler declarations, as
recorded in [the coverage audit](reference-coverage.md). Feature acceptance
remains open for the per-rule behavior audit, the documented CR/LF preparation
gap, browser runtime verification, and benchmarks of the completed feature.
No runtime implementation was changed in this verification slice.

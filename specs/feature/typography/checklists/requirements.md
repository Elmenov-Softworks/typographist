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

## Completed quotation benchmarks — 2026-10-08

Freshly built the core with Node v24.21.0 at
`72bd385fdf343503ad968014eaa04c734dfa05d8`; the working tree was clean during
build and measurement. The existing benchmark harness completed all 24
configurations and 144 workload pairs with its assertions passing. The
[report](../benchmarks/README.md) and raw results now include bundled quotation
formatting. Workloads are unchanged from the earlier run. Setup and repeated
formatting remain separate, with both algorithms, both cache settings and both
locales. Heap observations retain the documented measurement limitations.

No runtime code changed. The per-rule behavior audit, CR/LF preparation and
browser runtime verification remain open. The full test suite and workspace
checks were not rerun for this benchmark-data slice; the core build passed.

## Workspace verification after line-ending preparation — 2026-10-08

Verified at `84b2d425b969e43ac7b1971a736cd7beb1506220` with Node v24.21.0,
matching `.nvmrc`. The working tree was clean before verification.

| Command                                   | Result                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| `npm test`                                | Passed: 69 files, 1,768 tests.                                              |
| `NX_SKIP_NX_CACHE=true npm run build`     | Passed: all five projects without Nx cache reuse.                           |
| `NX_SKIP_NX_CACHE=true npm run typecheck` | Passed: root and all five project checks, plus the core build prerequisite. |
| `npm run lint`                            | Passed; the resolver emitted its multiple-project performance warning.      |
| `npm run format:check`                    | Passed before this record update; targeted formatting passed after editing. |

A Node ESM check imported the freshly built core entry point and passed 32
assertions across Russian and English, both algorithms, and zero/64 MiB cache
budgets. Spacing plus hyphenation matched hyphenation-only formatting of explicitly
LF-normalized input. The hyphenation-only profile preserved CR/LF after removing
soft hyphens; all-disabled formatting preserved the exact input. Default formatting
preserved configured literal content containing CRLF, lone CR and indentation.

This verifies emitted imports and line-ending behavior in Node, not a browser
runtime. No runtime code changed in this slice. Browser verification and final
acceptance review remain open; these passing checks do not establish completion
of every reference behavior scenario. The benchmark report still predates the
line-ending preparation change.

## Benchmarks after line-ending preparation — 2026-10-08

Freshly built the core with Node v24.21.0 at
`0ee270b797d89c6a83c9eeac1db6329d86440b76`; the working tree was clean during
build and measurement. The existing harness completed all 24 configurations and
144 workload pairs. Every assertion passed: lexical/digit preservation,
deterministic output, uncached equivalence and exact disabled-profile output.
The saved report and raw results now measure the implementation including CR/LF
normalization. All six inputs are unchanged from the preceding run and contain
no CR/LF; this measures the added preparation pass on those inputs, not a
line-ending-heavy workload. Setup and repeated calls remain separate, and the
existing process-wide heap measurement limitations still apply.

No runtime or harness code changed. Core build, report integrity checks, targeted
formatting and diff checks passed. Workspace tests, lint and type checks were
not rerun for this data/documentation slice. Browser runtime verification and
final acceptance review remain open.

## Completed browser verification — 2026-10-08

The owner reported a successful host run of
`/tmp/typographist-browser-acceptance.mjs` against the current built core package:
Chromium 156.0.8078.4, Node v24.21.0, 181 assertions passed, and
`pageErrors: []`. The host served the emitted ESM files on `127.0.0.1` and ran
Chromium with its sandbox enabled. Its environment set
`PLAYWRIGHT_BROWSERS_PATH=/tmp/typographist-browser-cache` and
`LD_LIBRARY_PATH=/tmp/typographist-browser-libs/usr/lib/x86_64-linux-gnu`.

The worker inspected the corrected temporary harness but did not rerun it.
The earlier worker attempt was blocked by `listen EPERM`; the successful host
run supplies browser runtime evidence without changing repository source or
bypassing worker restrictions. The host corrected the harness to use actual
Unicode and CR/LF escapes and to expect the existing `Invalid text rule` error.
The temporary harness is not a committed repository artifact.

The assertions cover English and Russian, both algorithms, zero/64 MiB cache
budgets, quotation-only and default formatting, repeated formatting, disabled
categories, CR/LF preparation, protected literals, URLs and emails, and the
specified lexical and numeric preservation examples. They also cover missing
locales, input validation, a custom typography-only locale, locale replacement,
failed-registration rollback and invalid synchronous handler results.

Browser runtime verification is complete on the reported Chromium version.
Final acceptance review and independent reviews remain open; this browser check
does not establish reference parity for every rule or coverage of other browsers.
No publication is authorized.

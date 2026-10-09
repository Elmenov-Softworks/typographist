# Specification review checklist

Owner correction — 2026-10-09: punctuation formatting retains apostrophe and ellipsis
glyph conversion only. TP-R053, TP-R054, TP-R058 and TP-R060 are removed from
the bundle; repeated signs and their order remain as supplied. Earlier audit,
benchmark and acceptance evidence predates this reduced scope. Other owner
scope corrections remain pending implementation in subsequent slices.

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

## Consumer rule contract review — 2026-10-08

Reviewed the public text rule and locale types, service registration, pipeline
preparation and their existing tests against US2 and FR-006, FR-008, FR-011,
FR-013 and FR-014. Shared rules precede locale rules at equal priority;
preparation copies configuration and freezes settings; recognized addresses and
literal protected spans are excluded before handlers run. Registration prepares
the replacement before mutating service state. Formatting performs no network,
filesystem or DOM operations. Consumer handlers remain responsible for their
own symbolic-only behavior and private state.

Seven added service assertions cover consumer quotation pairs with a non-bundled
alphabet, shared/locale ordering at equal priority, protected content, and null,
numeric, boolean, object and Promise handler results. Invalid results throw;
a later valid call remains usable. The quotation fixture accepts text normalized
by the shared spacing rule, so its output also verifies ordering through the
public service API without requiring hyphenation data.

All 26 tests in the three contract/pipeline test files, package type checking,
targeted ESLint, formatting and diff checks passed on Node v24.21.0. ESLint emitted
the existing multiple-project resolver warning. No production source changed;
workspace-wide checks and builds were not rerun. The owner-reported browser
verification remains complete. Final acceptance and independent reviews remain
open; this focused review does not replace them.

## Consolidated acceptance evidence — 2026-10-08

Reviewed the specification against the inventory, coverage audit, public migration
documentation, consumer contracts, test suites and saved benchmark report at
`5fa1dc00c77154a0b663a2e0b6000dfd0f101fb9`. The working tree was clean before
verification. Earlier entries above retain their historical gaps; use this record
and the completed browser record for the current verification status.

| Criterion | Current evidence                                                                                                                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SC-001    | All 107 reference entries have dispositions; 65 included/adapted entries have bundled handlers and recorded behavior audits. Default-profile exclusion tests cover inactive conversions. The inventory documents settings, defaults and deviations. |
| SC-002    | Service and pipeline tests cover independent quotation, nonbreaking-spacing and hyphenation selection, combined defaults and all-disabled output.                                                                                                   |
| SC-003    | Consumer contract tests cover custom quotation pairs and alphabets without hyphenation data. Only Russian and English typography is bundled.                                                                                                        |
| SC-004    | Algorithm regressions cover both algorithms, default and hyphenation-only profiles, and zero/64 MiB cache budgets.                                                                                                                                  |
| SC-005    | The post-CR/LF benchmark report records 24 configurations and 144 workload pairs, setup and repeated calls, both locales and algorithms, cache modes, input sizes, repetitions and heap-measurement limits.                                         |
| SC-006    | Current workspace verification is recorded below. Public migration examples document category defaults, existing `rules` semantics, settings, locale capabilities and protection boundaries.                                                        |

Browser evidence remains the owner-reported Chromium run: 181 passing assertions,
no page errors, Chromium sandbox enabled. It was not rerun inside the worker
sandbox. Built-in repeated-formatting deviations remain documented; no universal
idempotence promise or implicit algorithm/locale fallback was added.

This consolidation is an implementation-worker evidence review. Coordinator
independent reviews and final owner acceptance remain open. It does not authorize
publication and does not claim exhaustive parity for arbitrary text or handlers.

Current checks ran with Node v24.21.0, matching `.nvmrc`: `npm test` passed all
69 files and 1,775 tests; `npm run lint` passed with the existing multiple-project
resolver warning. Fresh `NX_SKIP_NX_CACHE=true npm run build` and
`NX_SKIP_NX_CACHE=true npm run typecheck` passed all five projects, including
the type-check build prerequisite. Workspace `npm run format:check` and
`git diff --check` also passed after the documentation update. No production
source changed in this slice.

## Owner scope correction: punctuation slice — 2026-10-09

Removed TP-R053, TP-R054, TP-R058 and TP-R060 handlers and their obsolete
positive fixtures. Public-service tests preserve repeated punctuation, sign order,
spaces, tabs and CR/LF in the punctuation-only profile; removed settings fail
with an unknown-rule error. Apostrophe and ellipsis conversion, protection,
category selection and deterministic ordering remain covered.

Under Node v24.21.0, all 2,078 tests and workspace type checking, lint,
formatting and build passed. This validates this slice only. Bundled spacing,
NBSP replacement, quotation correction and algorithm-data contract changes still
require subsequent slices, followed by independent review of the reduced scope.

Owner scope correction (2026-10-09), N1: bundled `common/nbsp/replaceNbsp` is removed, including its settings and standalone tests. Existing NBSPs must remain instead of being normalized to ordinary spaces before retained language bindings. Historical verification and timings predate this correction. Other approved scope corrections are tracked in subsequent implementation slices.

N1 slice validation on Node v24.21.0: all 2,095 tests passed; workspace typecheck, lint, formatting, build and diff checks passed. Nx reused one of six typecheck tasks and two of five build tasks. Spacing removal, quotation correction and required dual-dataset restoration remain pending. Default whitespace-only NBSP preservation still depends on the pending spacing-factory removal; the N1 slice verifies that boundary with nonbreaking bindings selected. No publication or Git mutation was performed.

Owner scope correction (2026-10-09), A8: declarative `RuleSets` and
`TypographistRules` require both standard and fast datasets. Independent
single-dataset construction is removed. Subclass `compile(useFast)` remains
available, both algorithms remain supported without fallback, and typography-only
locales still require no hyphenation data. Historical audit and benchmark evidence
predates this correction; spacing and quotation corrections remain pending.

A8 correction validation: Node v24.21.0; all 2,096 tests, workspace type checks,
lint, formatting, builds and diff checks passed. Public boundary tests reject
missing declarative datasets at runtime and compile time; existing subclass,
typography-only locale, algorithm and cache regressions remain passing. Changes
are uncommitted for coordinator review. This validates A8 only; the remaining
owner corrections and full independent review are still open.

Owner scope correction (2026-10-09), quotation multiplicity: remove duplicate-quote
deletion and reject the removed `removeDuplicateQuotes` setting. Preserve source
quote counts during locale glyph replacement, nesting and unmatched-quote handling.
Historical duplicate-removal audit evidence predates this correction. Builtin
spacing removal and the Q6 quote-boundary spacing correction remain pending.

Quotation multiplicity correction validation: Node v24.21.0; all 2,133 tests,
workspace type checks, lint, formatting, builds and diff checks passed. The targeted
quotation integration suite passed 129 tests. Changes are left uncommitted for the
coordinator. Remaining owner corrections and full independent review are open.

Range-whitespace correction, 2026-10-09: year, century, weekday and month handlers preserve matched boundary whitespace. Public-service regressions cover asymmetric gaps, existing NBSPs, repeated spaces, tabs, CR/LF, protected content and repeat formatting across both algorithms and cache modes. Builtin spacing removal and Q6 quotation spacing remain pending; previous full-feature benchmark and audit evidence does not validate this reduced implementation.

Validation for this correction under Node v24.21.0: all 2,169 tests, workspace build, typecheck, lint, formatting and diff checks passed. Changes remain uncommitted for the coordinator; full independent review of the revised scope is still required.

Direct-speech preservation correction, 2026-10-09: TP-R048 no longer treats literal pipes as whitespace or converts existing NBSPs to ordinary spaces. It preserves the following gap after quote/comma dashes and the preceding gap after sentence punctuation. Public-service regressions cover additional spaces, tabs, CR/LF, protected content and repeat formatting across both algorithms and cache modes. Builtin spacing removal, Q6 quotation spacing and full independent review remain pending. Historical full-feature measurements predate this correction.

Direct-speech slice validation under Node v24.21.0: all 2,205 tests, workspace typecheck, lint, formatting, build and diff checks passed. Nx reused one of six typecheck tasks and two of five build tasks. Changes remain uncommitted for the coordinator; publication is not authorized.

### Line-ending preservation correction (2026-10-09)

The bundled CRLF/lone-CR normalization handler and obsolete cleanup tests are
removed. The former `common/space/normalizeLineEndings` setting is invalid.
Public-service regressions cover exact CR/LF sequences with both algorithms,
cache enabled and disabled, protected content and repeated formatting.
Earlier normalization evidence is historical and does not validate the reduced
scope. Remaining bundled spacing removal and default quotation spacing are pending.

### Final-newline preservation correction (2026-10-09)

TP-R020 (`common/space/insertFinalNewline`) is removed from the bundle and its
settings are rejected. Formatting never appends a final newline implicitly.
The reference metadata remains for provenance; earlier final-newline audit and
benchmark evidence predates this correction. Remaining spacing removal and
default quotation spacing are pending.

Final-newline slice validation under Node v24.21.0: all 2,284 tests passed;
workspace typecheck, build, formatting and diff checks passed. The final adapted
interaction test passed separately (8 tests). Initial concurrent lint reported
unresolved built-package types; lint passed when rerun after builds completed.
Changes remain uncommitted for the coordinator. Remaining spacing and quotation
corrections and full independent review are open; publication is not authorized.

### Tab preservation correction (2026-10-09)

TP-R011 (`common/space/replaceTab`) is removed from the bundle and its settings
are rejected. Tabs are no longer expanded into four ordinary spaces. Other
bundled whitespace cleanup remains pending removal, so this slice tests interior
single tabs independently of those rules. Earlier tab-expansion audits and
benchmarks predate the reduced scope and do not validate this behavior.

Tab-expansion removal validation under Node v24.21.0: all 2,330 tests passed,
along with workspace typecheck, lint, formatting, build and diff checks.
The new public-service regressions cover both locales, algorithms and cache
modes, repeat formatting, existing NBSPs, CR/LF and protected content. Changes
remain uncommitted for the coordinator; remaining spacing removal, default
quotation spacing and full independent review are open.

### Outer-whitespace preservation correction (2026-10-09)

TP-R012 (`common/space/trimLeft`) and TP-R013 (`common/space/trimRight`)
are removed, including their settings. The bundle no longer trims whole-text
boundaries. Other spacing cleanup remains pending removal; preservation tests
isolate it where needed. Earlier trimming audits and benchmarks predate this
correction and do not validate the reduced scope.

Until TP-R017 is removed, the retained Russian year-spacing handler can insert
its gap on the second pass after leading indentation is removed on the first.
The locale interaction regression records this temporary behavior explicitly.

### Empty-line preservation correction (2026-10-09)

TP-R016 (`common/space/delRepeatN`) and its settings are removed. Repeated
empty lines and mixed CR/LF sequences remain intact. Public-service tests cover
both locales, algorithms, cache modes, protected content and repeat formatting.
Earlier cleanup audits and benchmarks predate this correction. Remaining builtin
spacing removal and default quotation spacing are pending.

### Trailing-whitespace preservation correction (2026-10-09)

Removed TP-R014 and its settings; replaced obsolete cleanup fixtures with public
service preservation tests for both locales, algorithms and cache modes, including
protected fragments and repeat formatting. Earlier cleanup evidence predates the
reduced scope. Remaining spacing removal and default quotation spacing are open.

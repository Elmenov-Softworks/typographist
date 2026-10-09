# Text typography

Owner correction — 2026-10-09: punctuation formatting retains apostrophe and ellipsis
glyph conversion only. TP-R053, TP-R054, TP-R058 and TP-R060 are removed from
the bundle; repeated signs and their order remain as supplied. Earlier audit,
benchmark and acceptance evidence predates this reduced scope. Other owner
scope corrections remain pending implementation in subsequent slices.

**Branch:** `feature/typography`

**Date:** 2026-10-08

**Status:** Approved — owner confirmed on 2026-10-08

## Goal and current behavior

Extend Typographist from a hyphenation service into a text typography service. Use Typograf 7.8.0 as the capability reference and implement the behavior in this repository. Typograf must not become a runtime dependency.

The current synchronous `format(text, locale)` inserts soft hyphens. `useFast` selects Khristov instead of Knuth–Liang. The service supports bundled and custom rule data, exclusions, locale registration, and a shared bounded LRU word cache. The baseline is commit `bb71204`.

The owner approved standard language typography on text, with all formatting categories enabled by default. The main service configuration selects which categories run, including hyphenation, nonbreaking spacing, and quotation marks. Only rules inside the symbolic-formatting scope may run. Content-changing reference rules are excluded even when every supported category is enabled.

## Scope

Implement symbolic typography from [the revised reference inventory](typograf-rule-inventory.md): quotation marks and apostrophes, dashes, existing lexical hyphen/minus glyph normalization, ellipses, punctuation cleanup, ordinary and nonbreaking spacing, and the existing soft hyphenation algorithms. Preserve the composition of the text: letters, case, word order, digit sequences, numeric notation, currency labels, dates, and unit labels must not be rewritten.

Do not convert currencies or numeric representations, group numbers, change decimal separators, turn digit fractions into single glyphs, rewrite dates or phone numbers, correct spelling or keyboard layouts, add accents, delete repeated words, expand abbreviations, or join words by inferred spelling rules. Number formatting may be addressed separately in the future; it is not part of this task. Pure spacing around unchanged numbers or currency labels remains whitespace formatting, not conversion.

Punctuation and whitespace may change under enabled rules. Range separators and minus glyphs may change without modifying digits or numeric notation. Do not infer missing grammatical punctuation from words. Ship bundled Russian and English typography only; keep contracts open to consumer-supplied locales.
Existing hyphenation becomes part of the same rule execution mechanism. Locale and rule contracts support adding any language without changing the core implementation. This does not promise linguistic data for every language.

Exclude the 13 reference rules that generate, inspect, or transform HTML, including markup-based optical alignment. Do not clone the Typograf editor, plugins, complete constructor API, HTML entity modes, or framework adapters. Plain-text formatting is not HTML sanitization.

## User scenarios and testing

### US1 — Configure text formatting (P1)

A caller selects formatting categories through the main service configuration.

- Given default configuration and supported locale data, when `format` runs, then the applicable typography categories and hyphenation run.
- Given only hyphenation selected, when existing regression inputs run, then output and failure behavior match the current hyphenation service.
- Given quotes selected and hyphenation disabled, when text contains quoted words, then locale quotation rules apply without inserting soft hyphens.
- Given every category disabled, when valid text is formatted for a registered locale, then the original string is returned.

### US2 — Connect a language (P1)

A consumer supplies language data and rules using public contracts.

- Given a custom locale with quotation and spacing rules but no hyphenation data, when registered and formatted, then those supplied rules work without fabricated hyphenation patterns.
- Given different quotation pairs or alphabets, when custom locale data changes, then core source files do not need edits.
- Given an unknown locale, when formatting is requested, then the established missing-locale error remains observable.

### US3 — Combine typography and hyphenation (P1)

A caller uses one formatting pipeline and can select either existing hyphenation algorithm.

- Given punctuation and spacing are normalized, when hyphenation runs, then it analyzes the unchanged lexical content and uses the existing word cache.
- Given identical category selection, when `useFast` changes, then only hyphenation algorithm selection changes.
- Given only hyphenation selected, when exclusions, URLs, email addresses, identifiers, existing soft hyphens, Unicode graphemes, or exceptions occur, then current protections remain effective.

### US4 — Match the reference and measure cost (P2)

A maintainer can trace implemented behavior to the pinned reference and verify performance.

- Given an included or adapted reference rule, when positive, negative, interaction, and settings scenarios run, then reference behavior matches or an approved deviation is documented.
- Given rules are disabled, when benchmarks run, then their cost is measured separately from enabled formatting.

## Requirements

- **FR-001:** Provide a synchronous, string-in/string-out text formatting API for Node and browsers. Preserve existing input validation.
- **FR-002:** Implement the included and explicitly adapted reference capabilities without a Typograf runtime dependency. Preserve exact reference IDs in the traceability catalogue; internal naming need not clone upstream.
- **FR-003:** Select categories in the main service configuration. Quotation marks, nonbreaking spacing, and hyphenation must be independently selectable. Document the remaining category mapping and individual rule settings.
- **FR-004:** Distinguish category selection from the existing `rules` property supplying hyphenation data. Document API changes and migration examples without silently changing the meaning of existing data.
- **FR-005:** Default to all applicable formatting categories. Exclude every content-changing transformation regardless of category selection. Document individual defaults for the supported symbolic rules; do not add broader rules through an “all” profile.
- **FR-006:** Support shared rules and locale-specific rules through universal public contracts. A locale may support text typography without either hyphenation algorithm.
- **FR-007:** Supply bundled Russian and English typography only. Preserve current `en` and `ru` compatibility; document how reference `en-US` and `en-GB` relate to the existing `en` identifier. Do not add undocumented locale fallback or automatic language detection.
- **FR-008:** Execute rules in a deterministic order that preserves reference interactions. Run applicable symbolic typography before hyphenation without introducing word-changing transformations. Document ordering and protection behavior for custom rules.
- **FR-009:** Keep `useFast`, both algorithms, minima, exceptions, and custom rule compilation available. Do not silently fall back between algorithms when selected hyphenation data is missing.
- **FR-010:** Preserve the hyphenation-only profile's existing behavior. Full typography may change punctuation, whitespace and soft hyphen positions only as prescribed by enabled rules; lexical and numeric content must remain unchanged.
- **FR-011:** Preserve URLs, email addresses, and configured protected content as defined by the text rule contract. Existing `excludedWords` semantics remain hyphenation exclusions; they do not automatically disable all typography. Identifier filters must not prevent supported spacing or punctuation formatting; numeric and mixed-script conversion remains excluded.
- **FR-012:** Keep word caching shared across languages, bounded by the existing configurable approximate memory limit, and managed by LRU. Preserve zero-size disabling and atomic locale mutation/invalidation. Do not add persistent or whole-text caching.
- **FR-013:** Validate configuration and rule data at public boundaries. Failed registration must leave the previous service state usable. Custom text handlers must obey the synchronous string result contract; invalid results must not be silently accepted.
- **FR-014:** Keep prepared rules and state owned by the service. Formatting must not perform network requests, filesystem access, or require DOM APIs.
- **FR-015:** Use native JavaScript and browser capabilities where they preserve behavior and reduce measured cost. Avoid repeated preparation per call and unnecessary passes for disabled categories. Do not introduce WASM or dependencies without a concrete reason and separate scope approval.
- **FR-016:** Document each implemented reference rule's scope, defaults, settings, supported locale data, and intentional deviations. Include required third-party notices when adapting reference material.

## Edge cases

Cover empty and whitespace-only strings, CR/LF variants, supplementary Unicode characters and combining marks, nested and unmatched quotes, existing nonbreaking spaces and soft hyphens, adjacent punctuation, numeric ranges versus minus signs, dates versus ordinary numbers, URLs and emails inside punctuation, and rule interactions.

Check repeated formatting for supported built-in scenarios. Do not promise idempotence for arbitrary consumer handlers or silently alter reference behavior to enforce it. Document any built-in case where a second pass changes output.

Check a custom locale without hyphenation data, missing selected algorithm data, invalid settings, failed registration, and cache invalidation after locale changes. Missing capabilities must be documented; they must not be replaced with another language's data.

## Content-preservation acceptance

Under the default profile, confirm that `$100`, `100 руб.`, `12345`, `1.25`, `1/2`, `2026-10-08`, phone-number digit sequences, repeated words, mixed-script words, and original letter case receive no numeric or lexical rewriting. Supported surrounding whitespace may change. Protect date delimiters, URLs, emails and identifier hyphens from dash/minus normalization. Test a prose dash, a numeric range separator and a unary minus separately so their glyph selection does not depend on indiscriminate hyphen replacement.

For abbreviation rules adapted to spacing, confirm that only whitespace changes: letters, case and abbreviation punctuation remain as supplied. Soft hyphen insertion remains the explicitly allowed algorithmic change within words.

## Key entities and contracts

The service configuration selects categories and settings. A locale definition supplies language data and supported capabilities. A text rule declares applicability, settings, ordering, and synchronous transformation behavior. Existing hyphenation data describes algorithm-specific matching and remains distinct from general typography data.

These are domain contracts, not a mandate to introduce particular classes. See [rules and locales](contracts/rules-and-locales.md).

## Success criteria

- **SC-001:** Every one of the 107 reference rules has a recorded disposition. Included symbolic rules have behavior tests; adapted spacing rules have content-preservation tests; excluded conversions remain inactive under the default profile.
- **SC-002:** Independent configuration scenarios cover quotes, nonbreaking spacing, hyphenation, the combined default, and all-disabled formatting.
- **SC-003:** A consumer-defined locale with typography and no hyphenation data works without editing core source, while the built-in typography bundle is limited to Russian and English.
- **SC-004:** The existing hyphenation-only regression suite passes for both algorithms, with caching enabled and disabled.
- **SC-005:** Benchmarks report cold setup and repeated formatting separately, for both algorithms, with and without caching, using equivalent selected categories. Include long text, repeated words, mostly unique words, and multiple supported locales. Record runtime, inputs, repetitions, memory measurement limitations, and results; do not invent a numerical target.
- **SC-006:** Applicable type checks, lint, formatting, tests, and builds pass, and public migration examples explain the new default behavior.

## Verification

Research already completed: inspected the current service and rule contracts; downloaded Typograf 7.8.0 without lifecycle scripts; extracted its public rule metadata; reviewed its rule handlers and documentation; inspected GitHub Spec Kit templates at the pinned revision. No implementation validation has been performed for this feature.

Future implementation checks, using the repository's required Node version:

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Add reference comparison scenarios for every in-scope rule, category interactions, custom locale contracts, both algorithms, and cache behavior. Reference comparison may use an isolated development fixture or temporary installation; it must not add a production dependency.

## Constraints and decisions

Follow existing repository and TypeScript rules. Keep externally exposed TypeScript contracts documented in English; do not add JSDoc to private entities merely for coverage. Prefer existing module boundaries and simple explicit code. No implementation, commit, orchestrator launch, or publication is authorized by approval of this document alone.

This specification adapts GitHub Spec Kit's specification structure to the repository's branch-based `specs` convention. Provenance is recorded in [research](research.md).

## Owner decisions and approval

- Typograf is a capability reference; implementation is local and optimized.
- Only symbolic typography is in scope. Lexical content and numeric representations remain unchanged.
- Bundle Russian and English only; retain universal locale contracts.
- All supported categories are enabled by default and independently selectable through the main service configuration.

No blocking scope questions remain. The owner explicitly approved this version on 2026-10-08 and separately authorized its documentation commit. Implementation and orchestrator execution have not been requested for this specification.

Owner scope correction (2026-10-09), N1: bundled `common/nbsp/replaceNbsp` is removed, including its settings and standalone tests. Existing NBSPs must remain instead of being normalized to ordinary spaces before retained language bindings. Historical verification and timings predate this correction. Other approved scope corrections are tracked in subsequent implementation slices.

Owner scope correction (2026-10-09), A8: declarative `RuleSets` and
`TypographistRules` require both standard and fast datasets. Independent
single-dataset construction is removed. Subclass `compile(useFast)` remains
available, both algorithms remain supported without fallback, and typography-only
locales still require no hyphenation data. Historical audit and benchmark evidence
predates this correction; spacing and quotation corrections remain pending.

Owner scope correction (2026-10-09), quotation multiplicity: remove duplicate-quote
deletion and reject the removed `removeDuplicateQuotes` setting. Preserve source
quote counts during locale glyph replacement, nesting and unmatched-quote handling.
Historical duplicate-removal audit evidence predates this correction. Builtin
spacing removal and the Q6 quote-boundary spacing correction remain pending.

Owner correction, 2026-10-09: retained range glyph rules must preserve existing whitespace rather than deleting gaps. Russian year, century, weekday and month handlers now retain their matched boundary spaces, including existing NBSPs. Their existing recognition boundaries, separator settings and protection contracts remain in force. Builtin spacing removal and quotation-boundary corrections remain pending.

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

### Tab preservation correction (2026-10-09)

TP-R011 (`common/space/replaceTab`) is removed from the bundle and its settings
are rejected. Tabs are no longer expanded into four ordinary spaces. Other
bundled whitespace cleanup remains pending removal, so this slice tests interior
single tabs independently of those rules. Earlier tab-expansion audits and
benchmarks predate the reduced scope and do not validate this behavior.

### Outer-whitespace preservation correction (2026-10-09)

TP-R012 (`common/space/trimLeft`) and TP-R013 (`common/space/trimRight`)
are removed, including their settings. The bundle no longer trims whole-text
boundaries. Other spacing cleanup remains pending removal; preservation tests
isolate it where needed. Earlier trimming audits and benchmarks predate this
correction and do not validate the reduced scope.

### Empty-line preservation correction (2026-10-09)

TP-R016 (`common/space/delRepeatN`) and its settings are removed. Repeated
empty lines and mixed CR/LF sequences remain intact. Public-service tests cover
both locales, algorithms, cache modes, protected content and repeat formatting.
Earlier cleanup audits and benchmarks predate this correction. Remaining builtin
spacing removal and default quotation spacing are pending.

### Trailing-whitespace preservation correction (2026-10-09)

TP-R014 (`common/space/delTrailingBlanks`) and its settings are removed.
Trailing ordinary spaces, tabs and existing NBSPs remain before line endings.
Earlier cleanup audits and benchmarks predate this correction. Remaining spacing
removal and default quotation spacing are pending. Reference metadata is retained
for provenance; historical handler and ordering rows do not describe this rule
as an active capability.

### Repeated-space preservation correction (2026-10-09)

TP-R015 (`common/space/delRepeatSpace`) and its settings are removed.
Repeated ordinary spaces and tabs remain between content characters. The
public-service preservation matrix covers both locales, both algorithms, cache
modes, protected content and repeated formatting. Earlier cleanup audits and
benchmarks predate this correction. Remaining spacing removal and default
quotation spacing are pending.

### Indentation preservation correction (2026-10-09)

TP-R021 (`common/space/delLeadingBlanks`) and its settings are removed.
Line-leading ordinary spaces and tabs remain intact, including after CR, LF,
CR/LF and Unicode line separators. Public-service tests cover both locales,
algorithms, cache modes, protected boundaries and repeated formatting. Earlier
cleanup audits and benchmarks predate this correction. Remaining spacing removal
and default quotation spacing are pending.

TP-R024 (`common/space/delBeforePercent`) and its settings are removed by the
owner correction of 2026-10-09. Ordinary spaces, existing NBSPs, tabs and line
endings before `%`, `‰` and `‱` remain intact. Public-service preservation tests
cover both locales, algorithms and cache modes. Earlier cleanup audits and
benchmark timings predate this reduced scope.

TP-R025 (`common/space/delBeforeDot`) and its settings are removed by the
owner correction of 2026-10-09. Preserve whitespace before dots; retained
ellipsis conversion changes only the glyphs. Public-service regressions cover
Russian, English, both algorithms, cache modes, protection and repeat formatting.
Earlier audit and benchmark evidence predates this correction.

TP-R019 (`common/space/squareBracket`) and its settings are removed by the
owner correction of 2026-10-09. Preserve spaces, tabs, line endings and existing
NBSPs inside square brackets. Public-service regressions cover both locales,
algorithms and cache modes, protection, repeated formatting and invalid settings.

TP-R022 (`common/space/delBetweenExclamationMarks`) and its settings are removed
by the owner correction of 2026-10-09. Preserve repeated exclamation and question
marks and their single intervening spaces, tabs, line endings and existing NBSPs.
Public-service regressions cover both locales, algorithms and cache modes,
protection, repeated formatting and invalid settings. Earlier cleanup audits and
benchmark timings predate this correction. Remaining spacing removals and default
quotation spacing are pending.

TP-R023 (`common/space/delBeforePunctuation`) and its settings are removed by
the owner correction of 2026-10-09. Preserve ordinary spaces, tabs, line endings
and existing NBSPs before punctuation, including repeated signs. Public-service
regressions cover both locales, algorithms, cache modes, protected content and
repeat formatting. Earlier cleanup audits and benchmarks predate this correction.
Remaining spacing removals and default quotation spacing are pending.

Owner correction, 2026-10-09: TP-R026 (`common/space/bracket`) and its
settings are removed. Round-bracket interior spaces, tabs, line endings and
existing NBSPs are preserved. Public-service regressions cover both locales,
algorithms, cache modes, protected content, repeat formatting and invalid removed
settings. Earlier bracket cleanup audits and benchmarks predate this removal.
Remaining spacing removals and default quotation spacing are pending.

Owner correction, 2026-10-09: TP-R027 (`common/space/beforeBracket`) and its
settings are removed. Opening parentheses preserve the supplied boundary gap,
including no gap, repeated spaces, tabs, line endings and existing NBSPs.
Custom spacing rules remain supported. Historical audits and timings predate
this removal.

Owner correction, 2026-10-09: TP-R028 (`common/space/afterSemicolon`) and its
settings are removed. Semicolons preserve the supplied boundary gap, including
no gap, repeated spaces, tabs, CR/LF and existing NBSPs. Repeated signs and
protected bytes remain unchanged. Custom spacing rules remain supported.
Historical audits and timings predate this removal. Remaining spacing removals
and default quotation spacing are pending.

Owner correction, 2026-10-09: TP-R029 (`common/space/afterExclamationMark`)
and its settings are removed. Exclamation marks preserve the supplied boundary
gap, including no gap, repeated spaces, tabs, CR/LF and existing NBSPs. Repeated
signs and protected bytes remain unchanged. Custom spacing rules remain supported.
Historical audits and timings predate this removal. Remaining spacing removals
and default quotation spacing are pending.

Owner correction, 2026-10-09: TP-R030 (`common/space/afterQuestionMark`)
and its settings are removed. Question marks preserve supplied boundary gaps,
including no gap, repeated spaces, tabs, CR/LF and existing NBSPs. Repeated signs
and protected bytes remain unchanged. Custom spacing rules remain supported.
Historical audits and timings predate this removal. Remaining spacing removals
and default quotation spacing are pending.

Owner correction, 2026-10-09: TP-R031 (`common/space/afterComma`)
and its settings are removed. Commas preserve supplied boundary gaps, including
no gap, repeated spaces, tabs, CR/LF and existing NBSPs. Repeated signs and
protected bytes remain unchanged. Custom spacing rules remain supported.
Historical audits and timings predate this removal. Remaining spacing removals
and default quotation spacing are pending.

Owner correction, 2026-10-09: TP-R032 (`common/space/afterColon`)
and its settings are removed. Colons preserve supplied boundary gaps, including
no gap, repeated spaces, tabs, CR/LF and existing NBSPs. Repeated signs and
protected bytes remain unchanged. Custom spacing rules remain supported.
Historical audits and timings predate this removal. Russian year and ellipsis
spacing removal and default quotation spacing remain pending.

Owner correction, 2026-10-09: TP-R017 (`ru/space/year`) and its settings
are removed. Joined year labels such as `2027год` retain their supplied gap;
existing spaces, tabs, CR/LF and NBSPs are preserved by this removal. Retained
nonbreaking bindings still apply where their own boundaries match. Custom spacing
rules remain supported. Historical audits and timings predate this removal.
Russian ellipsis spacing removal and default quotation spacing remain pending.

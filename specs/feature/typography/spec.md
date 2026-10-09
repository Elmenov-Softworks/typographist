# Text typography

**Branch:** `feature/typography`

**Date:** 2026-10-08

**Status:** Approved — corrected by the owner on 2026-10-09

## Goal and current behavior

Typographist is a fast language-aware symbol formatter with hyphenation. It preserves user mistakes; it does not clean text, proofread it or prepare it for publication. Use Typograf 7.8.0 as the capability reference and implement the behavior in this repository. Typograf must not become a runtime dependency.

The current synchronous `format(text, locale)` inserts soft hyphens. `useFast` selects Khristov instead of Knuth–Liang. The service supports bundled and custom rule data, exclusions, locale registration, and a shared bounded LRU word cache. The baseline is commit `bb71204`.

The owner approved standard language typography on text, with all retained builtin categories enabled by default. The main service configuration selects which categories run, including hyphenation, nonbreaking spacing, and quotation marks. Only rules inside the symbolic-formatting scope may run. Content-changing reference rules are excluded even when every supported category is enabled.

## Scope

Implement symbolic typography from [the revised reference inventory](typograf-rule-inventory.md): quotation marks and apostrophes, dashes, existing lexical hyphen/minus glyph normalization, ellipsis glyph conversion, retained language nonbreaking bindings, and the existing soft hyphenation algorithms. Preserve the composition of the text: letters, case, word order, digit sequences, numeric notation, currency labels, dates, and unit labels must not be rewritten.

Do not convert currencies or numeric representations, group numbers, change decimal separators, turn digit fractions into single glyphs, rewrite dates or phone numbers, correct spelling or keyboard layouts, add accents, delete repeated words, expand abbreviations, or join words by inferred spelling rules. Number formatting may be addressed separately in the future; it is not part of this task. Pure spacing around unchanged numbers or currency labels remains whitespace formatting, not conversion.

Selected glyphs and nonbreaking bindings may change under enabled retained rules. Preserve repeated punctuation and quotes, extra spaces, tabs, indentation, trailing whitespace, CR/LF and empty lines. Existing NBSPs remain intact. Ordinary whitespace cleanup is excluded. Range separators and minus glyphs may change without modifying digits or numeric notation. Do not infer missing grammatical punctuation from words. Ship bundled Russian and English typography only; keep contracts open to consumer-supplied locales.
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

- Given selected glyphs and nonbreaking bindings are formatted, when hyphenation runs, then it analyzes the unchanged lexical content and uses the existing word cache.
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
- **FR-005:** Default to quotes, dashes, punctuation, nonbreaking spacing and hyphenation. Keep the spacing category available only for explicitly selected consumer rules; no builtin spacing factory remains. Exclude every content-changing transformation regardless of category selection. Document individual defaults for the supported symbolic rules; do not add broader rules through an “all” profile.
- **FR-006:** Support shared rules and locale-specific rules through universal public contracts. A locale may support text typography without either hyphenation algorithm.
- **FR-007:** Supply bundled Russian and English typography only. Preserve current `en` and `ru` compatibility; document how reference `en-US` and `en-GB` relate to the existing `en` identifier. Do not add undocumented locale fallback or automatic language detection.
- **FR-008:** Execute rules in a deterministic order that preserves reference interactions. Run applicable symbolic typography before hyphenation without introducing word-changing transformations. Document ordering and protection behavior for custom rules.
- **FR-009:** Keep `useFast`, both algorithms, minima, exceptions, and custom rule compilation available. Do not silently fall back between algorithms when selected hyphenation data is missing.
- **FR-010:** Preserve the hyphenation-only profile's existing behavior. Full typography may replace selected glyphs, insert or replace nonbreaking bindings and insert soft hyphens only as prescribed by retained rules; preserve source repetitions and whitespace sequences; lexical and numeric content must remain unchanged.
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

Research already completed: inspected the current service and rule contracts; downloaded Typograf 7.8.0 without lifecycle scripts; extracted its public rule metadata; reviewed its rule handlers and documentation; inspected GitHub Spec Kit templates at the pinned revision. Implementation validation is recorded in the acceptance checklist. Evidence predating the owner correction is historical and does not validate removed capabilities or describe current performance.

Required implementation checks, using the repository's required Node version:

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
- All retained builtin categories are enabled by default and independently selectable through the main service configuration. Consumer spacing requires explicit selection.

No blocking scope questions remain. The owner approved the original specification on 2026-10-08 and explicitly superseded its cleanup scope on 2026-10-09. Local corrections and checks are authorized. The coordinator owns Git mutations and independent review; publication requires separate owner approval after review.

## Owner scope correction — 2026-10-09

Remove P3–P6 (`common/punctuation/delDoublePunctuation`, `ru/punctuation/hellipQuestion`, `ru/punctuation/exclamation`, `ru/punctuation/exclamationQuestion`). Retain P1 apostrophes and P2 ellipsis glyph conversion. Preserve duplicate signs and their order.

Remove all 23 spacing capabilities and their obsolete settings and standalone tests: `normalizeLineEndings`, `insertFinalNewline`, `replaceTab`, `trimLeft`, `trimRight`, `delTrailingBlanks`, `delRepeatSpace`, `delRepeatN`, `delLeadingBlanks`, `squareBracket`, `delBetweenExclamationMarks`, `delBeforePunctuation`, `delBeforePercent`, `delBeforeDot`, `bracket`, `beforeBracket`, `afterSemicolon`, `afterExclamationMark`, `afterQuestionMark`, `afterComma`, `afterColon`, `ru/space/year` and `ru/space/afterHellip`. Remove the entire bundled spacing factory. Retain the public consumer spacing contract.

Remove N1 (`common/nbsp/replaceNbsp`); preserve existing NBSPs. Retain N2–N25 and D1–D10 without whitespace cleanup before prose or range dashes. Preserve letters, case, digit sequences, numeric notation, currency labels, dates and repetition.

Remove A8 independent algorithm datasets: declarative `RuleSets` and `TypographistRules` require both standard and fast datasets. Keep subclass `compile(useFast)`, both algorithms without fallback, and typography-only locales without fabricated hyphenation data. Retain H1–H4 exclusions, minima, exceptions and the shared configurable LRU cache, and A1–A7 public rule, protection and locale contracts.

Q6 enables nonbreaking quote/content boundary spacing by default for ru/en, using the configured nonbreaking space (narrow NBSP by default). Replace the nearest ordinary boundary space, or insert a gap when none exists. Preserve additional spaces, tabs, line endings and existing NBSPs; never insert a gap across a line or transform protected bytes. Retain explicit `spacing: false`, locale pairs, nesting, custom pairs and symbolic unmatched-quote handling. Remove duplicate-quote deletion and reject `removeDuplicateQuotes`; glyph replacement preserves source quote multiplicity.

Public-service acceptance covers exact preservation of repeated signs, extra whitespace, CR/LF, tabs and existing NBSPs; quote spacing defaults and overrides; both algorithms and cache modes; protection, Unicode, ordering, registration and invalid removed settings. Delete only tests obsolete under the reduced scope and adapt remaining interactions. Check supported repeat-formatting stability without promising it for arbitrary consumer handlers.

The full 107-rule inventory and pinned metadata remain provenance, with removed capabilities distinguished from retained ones. Historical full-feature benchmarks and audit results predate this scope reduction and must not be presented as measurements or acceptance of the revised implementation. Full independent review of the corrected scope remains required.

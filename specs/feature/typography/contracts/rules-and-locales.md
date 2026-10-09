# Rules and locale contracts

Owner correction — 2026-10-09: punctuation formatting retains apostrophe and ellipsis
glyph conversion only. TP-R053, TP-R054, TP-R058 and TP-R060 are removed from
the bundle; repeated signs and their order remain as supplied. Earlier audit,
benchmark and acceptance evidence predates this reduced scope. Other owner
scope corrections remain pending implementation in subsequent slices.

**Status:** Approved, part of the text typography specification.

## Language independence

Contracts must not hardcode Russian or English alphabets, quotation pairs, abbreviations, or word lists. Shared behavior consumes locale data; language-specific behavior can be supplied as rules. Support Unicode text and consumer-defined locale identifiers through the existing public typing model.

Typography capabilities and hyphenation capabilities are separate. Registering a locale for quotes or spacing must not require Knuth–Liang patterns, vowel/consonant sets, or hyphenation minima. Selecting a hyphenation algorithm still requires its own valid data; no cross-algorithm fallback is introduced.

The supported-locale catalogue must distinguish available typography and available hyphenation. A default category selection applies available capabilities; absence of hyphenation data must not make typography-only locales unusable. An explicit request for unavailable behavior must have a documented outcome rather than fabricated results.

## Configuration

The main service configuration controls category selection, including independent quote, nonbreaking-spacing, and hyphenation selection. Rule-specific settings and optional individual overrides must have documented precedence. The default selection includes all categories; individual settings apply only to supported symbolic formatting. No setting may activate excluded content or number conversions.

Preserve the distinction between existing hyphenation rule data supplied through `rules` and selection of text transformations. Provide examples for the default profile, typography without hyphenation, and the legacy hyphenation-only profile. Exact property names and type layout are implementation design choices to be reviewed against the existing API.

## Rule execution

A rule's applicability, settings, processing order, and transformation contract must be explicit. A rule operates synchronously and produces text. Ordering must be deterministic even when rules have equal priority. Consumer rules and compiled locale data must not depend on mutable global registration state.

Protect addresses and explicitly protected content consistently across relevant transformations. Do not use hyphenation's word eligibility filters to block supported spacing and punctuation typography. Content-changing corrections are excluded. Preserve existing case-sensitive `excludedWords` behavior for hyphenation.

Apply symbolic transformations before hyphenation while preserving lexical and numeric content. The cache stores existing hyphenation results for the transformed word, not complete typography output. Existing locale mutation must remain atomic and clear the shared cache as prescribed by its current contract.

## Reference compatibility

The inventory records reference IDs, language scopes, enabled defaults, priorities, queues, and settings. These are evidence for observable behavior, not mandatory internal architecture. Do not reproduce upstream HTML machinery, static mutable registries, or accidental implementation defects merely for structural parity.

Each intentional difference in text output needs a documented reason and owner approval when it changes the agreed behavior. Do not claim that English aliases, region fallback, locale lists, or additional languages behave identically until their mapping is specified and tested.

## Content preservation

The built-in bundle covers Russian and English. Rules may change whitespace, punctuation glyphs and soft hyphen positions. They must preserve letters, case, word order, digits, number notation, currency and unit labels. Normalize quotation, dash, hyphen and minus glyphs only where their role is established; do not rewrite date delimiters or identifier hyphens as prose punctuation.

Keep monetary amounts, decimal separators, digit grouping, fractions and phone representations unchanged. Preserve repeated words, accents, spelling and mixed-script input. Upstream rules combining spacing with content correction must be narrowed to spacing rather than copied wholesale. Consumer extensions remain possible; excluded transformations must not enter the built-in default through those contracts.

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

Owner correction, 2026-10-09: bundled range handlers preserve existing whitespace around matched separators. The year, century, weekday and month handlers change the separator glyph only. Existing prose-dash nonbreaking bindings still apply before range formatting; additional spaces, tabs and line endings are not consumed by these dash handlers.

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

Trailing-whitespace deletion (`common/space/delTrailingBlanks`) is removed. Its
settings are rejected even when spacing is disabled. Custom spacing rules remain
available through the existing text-rule contract.

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

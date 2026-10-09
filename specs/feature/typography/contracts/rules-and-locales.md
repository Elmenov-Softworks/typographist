# Rules and locale contracts

**Status:** Approved, part of the text typography specification.

## Language independence

Contracts must not hardcode Russian or English alphabets, quotation pairs, abbreviations, or word lists. Shared behavior consumes locale data; language-specific behavior can be supplied as rules. Support Unicode text and consumer-defined locale identifiers through the existing public typing model.

Typography capabilities and hyphenation capabilities are separate. Registering a locale for quotes or spacing must not require Knuth–Liang patterns, vowel/consonant sets, or hyphenation minima. Selecting a hyphenation algorithm still requires its own valid data; no cross-algorithm fallback is introduced.

The supported-locale catalogue must distinguish available typography and available hyphenation. A default category selection applies available capabilities; absence of hyphenation data must not make typography-only locales unusable. An explicit request for unavailable behavior must have a documented outcome rather than fabricated results.

## Configuration

The main service configuration controls category selection, including independent quote, nonbreaking-spacing, and hyphenation selection. Rule-specific settings and optional individual overrides must have documented precedence. The default selection includes quotes, dashes, punctuation, nonbreaking spacing and hyphenation; consumer spacing requires explicit selection; individual settings apply only to supported symbolic formatting. No setting may activate excluded content or number conversions.

Preserve the distinction between existing hyphenation rule data supplied through `rules` and selection of text transformations. Provide examples for the default profile, typography without hyphenation, and the legacy hyphenation-only profile. Exact property names and type layout are implementation design choices to be reviewed against the existing API.

## Rule execution

A rule's applicability, settings, processing order, and transformation contract must be explicit. A rule operates synchronously and produces text. Ordering must be deterministic even when rules have equal priority. Consumer rules and compiled locale data must not depend on mutable global registration state.

Protect addresses and explicitly protected content consistently across relevant transformations. Do not use hyphenation's word eligibility filters to block supported spacing and punctuation typography. Content-changing corrections are excluded. Preserve existing case-sensitive `excludedWords` behavior for hyphenation.

Apply symbolic transformations before hyphenation while preserving lexical and numeric content. The cache stores existing hyphenation results for the transformed word, not complete typography output. Existing locale mutation must remain atomic and clear the shared cache as prescribed by its current contract.

## Reference compatibility

The inventory records reference IDs, language scopes, enabled defaults, priorities, queues, and settings. These are evidence for observable behavior, not mandatory internal architecture. Do not reproduce upstream HTML machinery, static mutable registries, or accidental implementation defects merely for structural parity.

Each intentional difference in text output needs a documented reason and owner approval when it changes the agreed behavior. Do not claim that English aliases, region fallback, locale lists, or additional languages behave identically until their mapping is specified and tested.

## Content preservation

The built-in bundle covers Russian and English. Builtin rules may replace selected glyphs, insert or replace prescribed nonbreaking bindings and insert soft hyphens. Preserve repeated signs, quote multiplicity, extra spaces, tabs, indentation, trailing whitespace, CR/LF, empty lines and existing NBSPs. They must preserve letters, case, word order, digits, number notation, currency and unit labels. Normalize quotation, dash, hyphen and minus glyphs only where their role is established; do not rewrite date delimiters or identifier hyphens as prose punctuation.

Keep monetary amounts, decimal separators, digit grouping, fractions and phone representations unchanged. Preserve repeated words, accents, spelling and mixed-script input. Upstream rules combining spacing with content correction must be narrowed to spacing rather than copied wholesale. Consumer extensions remain possible; excluded transformations must not enter the built-in default through those contracts.

## Corrected builtin contracts — 2026-10-09

The [approved specification](../spec.md#owner-scope-correction--2026-10-09) defines the removed capabilities. Their builtin settings are invalid even when their former category is disabled. Public custom text-rule contracts, including explicit consumer spacing rules, remain available.

Declarative `RuleSets` and `TypographistRules` require standard and fast datasets together. Subclass `compile(useFast)` remains supported without algorithm fallback. Typography-only locales require neither dataset.

Quotation spacing defaults to enabled for ru/en and uses the configured nonbreaking space (narrow NBSP by default). Replace the nearest existing ordinary boundary space, or insert one when there is no gap. Preserve additional whitespace and existing NBSPs; do not insert gaps beside tabs or line endings, across lines or across protected boundaries. `spacing: false` disables quote-boundary spacing. Glyph replacement preserves quotation multiplicity; `removeDuplicateQuotes` is invalid. Keep locale pairs, nesting, custom pairs and symbolic unmatched-quote handling.

Retained range handlers change separator glyphs without consuming existing boundary whitespace. Prose-dash bindings must preserve additional spaces, tabs, line endings and existing NBSPs. There is no builtin whitespace cleanup pass before or after symbolic formatting.

Earlier audit and benchmark evidence predates the reduced scope. Current acceptance and independent review must assess these corrected contracts; historical reference metadata remains provenance.

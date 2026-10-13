# Typographist core

Standalone symbolic typography and soft hyphenation for Node.js and browsers.
The ESM package bundles eight locales and has no runtime dependencies.

For application integration, see the [agent guide](AGENT_GUIDE.md).

```ts
import { Typographist } from '@elmenov-softworks/typographist';

const typographist = new Typographist({
  locale: 'ru',
  useFast: true,
  cacheSize: 16,
});

const formatted = typographist.format('Он сказал: "Привет"...');
const english = typographist.format('The "reader" said...', 'en');
```

Reuse the instance across calls. In a browser, assign the result to
`element.textContent`; soft hyphens become visible when the browser wraps text.

## Formatting

By default, `format` applies all bundled categories:

| Category             | Behavior                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `quotes`             | Locale-specific quotation marks, nesting and narrow nonbreaking spaces inside quotation pairs. |
| `dashes`             | Prose dashes, supported range separators and unary minus signs.                                |
| `punctuation`        | Typographic apostrophes and ellipses.                                                          |
| `nonbreakingSpacing` | Nonbreaking bindings for supported words, abbreviations, labels and units.                     |
| `hyphenation`        | Soft hyphens from the selected algorithm.                                                      |

An explicit `categories` list replaces the defaults. To format symbols without
hyphenation:

```ts
const symbols = new Typographist({
  locale: 'ru',
  categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing'],
  settings: { 'common/punctuation/quote': { spacing: false } },
});
```

`categories: []` leaves the input unchanged. The additional `spacing` category
is available for consumer rules and has no bundled cleanup rules.

The default locale is `en`. `useFast: false`, the default, selects Knuth–Liang
pattern-based hyphenation. `useFast: true` selects the Khristov heuristic in the
modification by Dymchenko and Varsanofyev. Fast mode uses character classes;
it can produce linguistically different breaks from the pattern-based mode.

`cacheSize` sets an approximate shared word-cache budget in MiB, defaulting to 64. Zero disables caching. The per-instance LRU cache lives in memory, allocates
nothing up front and has no persistence. Its budget is an estimate rather than
an exact heap limit; prepared rules and temporary allocations are separate.
Successful locale additions, replacements and removals clear the cache.

## Limits and extensions

Bundled rules preserve letters, case, word order and numeric notation. They do
not correct spelling, repeated punctuation, extra spaces, tabs or line endings,
and do not reformat numbers or currencies. Quotation spacing is enabled by
default for `en`, `ru` and `fr`, and disabled for `es`, `de`, `pt`, `it` and `zh`.
The setting above disables it for `en` and `ru`; other locales use their
`LOCALE/punctuation/quote` settings, such as `fr/punctuation/quote`.

Formatting handles plain text and does not parse or sanitize HTML. Recognized
URLs, emails and nonempty `protectedContent` literals bypass formatting.
`excludedWords` excludes exact, case-sensitive words from hyphenation only.

Locale selection is explicit: there is no language detection or regional
fallback. Built-in locale identifiers are `en`, `ru`, `es`, `fr`, `de`, `pt`, `it` and `zh`.
The five added alphabetic locales support symbolic typography and both hyphenation algorithms. Chinese supports symbolic typography only.
See [locale data](locale-rules/README.md) for baselines and source licenses. Additional languages
can supply `TypographistRules` for hyphenation and `TextLocale`/`TextRule`
definitions for symbolic formatting. Declarative hyphenation rules supply both
standard patterns and fast character classes. Typography-only locales need
no hyphenation dataset. No linguistic accuracy guarantee applies to custom data
or heuristic hyphenation.

The public service methods are `format(text, locale?)`, `addRules(rules)`,
`addTextLocale(definition)`, `removeRules(locale)` and `hasLocale(locale)`.
Unknown locales throw by default.
Set `unsupportedLocale: 'preserve'` to return the exact source string for valid,
unregistered locales, including an unsupported default locale. Registered locales
still format normally. Invalid text, malformed locales and rule errors still throw.
`hasLocale` reports actual registrations, normalizes case and reflects additions
and removals without regional fallback.

```ts
const multilingual = new Typographist<'ja'>({
  locale: 'ja',
  unsupportedLocale: 'preserve',
});
multilingual.hasLocale('ja'); // false
multilingual.format('"こんにちは"...'); // unchanged
multilingual.format('"Hello"...', 'en'); // English formatting
```

Built-in formatting is idempotent: applying the same locale and configuration
to its output leaves the output unchanged. Consumer rules must establish their
own idempotence. Keep the source for editing: formatted
output contains real soft hyphens and nonbreaking characters. See the
[usage examples](EXAMPLES.md) for display, multilingual, disabled and SSR scenarios.

## Performance and development

See the [workspace benchmarks](../../README.md#benchmarks) for recorded timings,
comparison settings and limitations. [Benchmark tools](../../tools/benchmarks/README.md)
generate new measurements.

From the workspace root, use the Node.js version in `.nvmrc`, run `npm ci`, then:

```sh
npm run build
npm run typecheck
npm run lint
npm run format:check
npm test
npm run check:packages
```

Lint and type checks resolve workspace dependencies from source through the
`typographist-source` TypeScript condition; they do not require `dist` or emit files.
Package-local `#src` imports keep dependency aliases separate from consumer aliases.
Runtime imports and benchmarks use built packages. Integration builds resolve the
emitted declarations, so they also check the published package boundary.

`npm run check:packages` installs all five archives in a temporary project outside
the workspace. It verifies declarations, ESM imports, SSR, browser bundling and
the transformer CLI. It needs registry access for existing peer and build tools.
`npm run docs` generates TypeDoc after a build.
The [rules transformer](../rules-transformer/README.md) converts TeX tables
into hyphenation data.

### Chinese symbolic rules

The `zh` symbolic rule set uses a Simplified Chinese mainland baseline. It uses
`“…”` with nested `‘…’` and no added quotation spacing. The existing quotation
recognizer handles ASCII quotes at whitespace and ASCII punctuation boundaries;
quotes adjoining Han text or native Chinese punctuation are conservatively left
unchanged when those boundaries are not recognized. Native quotation signs and
punctuation remain intact.
Its `zh/punctuation/quote` settings are independent of the ru/en
`common/punctuation/quote` settings.

Standalone integer ranges use `—`; the existing unary-minus rule uses `−` where
it recognizes an unambiguous number. Dates, identifiers, decimal ranges and phone
numbers are left unchanged. These rules add no nonbreaking bindings and leave
Chinese line breaking to the browser. A typography-only `TextLocale` for `zh`
never inserts soft hyphens, including in fast mode and with default categories.

Chinese is registered by default when both `rules` and `textLocales` are omitted.
An explicit registration list retains its existing replacement semantics; supply
`{ locale: 'zh', textRules: [] }` in `textLocales` when using such a list.
Bundled Chinese ignores the hyphenation category even when explicitly selected.
Consumer-supplied typography-only locales still reject explicit hyphenation.

### Alphabetic symbolic rules

Spanish (`es`) and Italian (`it`) use `«…»` with nested `“…”`. German (`de`)
uses `„…“` with nested `‚…‘`. Brazilian Portuguese (`pt`) uses `“…”` with nested
`‘…’`. French (`fr`) uses `«…»` with nested `‹…›`; the existing quote facility
binds both levels with narrow nonbreaking spaces. This is a conservative
supported nesting choice; alternate French nested quotation conventions are
not inferred. Other added locales insert no quotation spacing.

Each locale owns its `LOCALE/punctuation/quote` settings. The existing recognizer
handles quotation boundaries; it does not infer dialogue structure or repair
unmatched quotes. Internal letter apostrophes become `’`, including beside
accented letters. Standalone integer ranges use `–`; unary minus uses `−`.
Space-delimited prose hyphens and double hyphens become `—` (`–` in German),
preserving their surrounding spaces. Spanish dash attachment and dialogue
layout are left to the author. Dates, identifiers, decimal ranges and phone
numbers are preserved rather than guessed.

French binds an existing single space before `;`, `!` and `?` with a narrow
nonbreaking space and before `:` with a nonbreaking space. Missing punctuation
spaces, multiple spaces, tabs and line breaks are not corrected. No European
short-word heuristics are added for these locales. Numeric, currency and native
punctuation content is otherwise preserved.

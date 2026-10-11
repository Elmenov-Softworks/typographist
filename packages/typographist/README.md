# Typographist core

Standalone symbolic typography and soft hyphenation for Node.js and browsers.
The ESM package has built-in Russian and US English data and no runtime dependencies.

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
default; the setting above disables it.

Formatting handles plain text and does not parse or sanitize HTML. Recognized
URLs, emails and nonempty `protectedContent` literals bypass formatting.
`excludedWords` excludes exact, case-sensitive words from hyphenation only.

Locale selection is explicit: there is no language detection or regional
fallback. Built-in locale identifiers are `ru` and `en`. Additional languages
can supply `TypographistRules` for hyphenation and `TextLocale`/`TextRule`
definitions for symbolic formatting. Declarative hyphenation rules supply both
standard patterns and fast character classes. Typography-only locales need
no hyphenation dataset. No linguistic accuracy guarantee applies to custom data
or heuristic hyphenation.

The public service methods are `format(text, locale?)`, `addRules(rules)`,
`addTextLocale(definition)` and `removeRules(locale)`. Unknown locales throw.
Some non-global bindings need another formatting pass when a segment contains
several matching sequences.

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
```

`npm run docs` generates TypeDoc after a build.
The [rules transformer](../rules-transformer/README.md) converts TeX tables
into hyphenation data.

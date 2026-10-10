# Typographist

Symbolic typography and soft hyphenation for JavaScript and TypeScript.
The core is a standalone ESM package for Node.js and browsers, with built-in
Russian and US English data and no runtime dependencies.

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
several matching sequences. React, Vue and Solid packages are currently
placeholders; use the core directly.

## Benchmarks

Typographist is faster than Typograf on the ordinary prose workloads below,
with hyphenation and quotation spacing disabled and comparable symbolic rules
selected in Typograf 7.8.0. These workloads produced identical outputs.

Median milliseconds per call; lower is faster:

| Input                        | Typographist | Typograf | Typographist speedup |
| ---------------------------- | -----------: | -------: | -------------------: |
| English, 15,200 UTF-16 units |        0.407 |    0.638 |                1.57× |
| English, 60,800 UTF-16 units |        1.641 |    2.542 |                1.55× |
| Russian, 16,320 UTF-16 units |        0.848 |    1.223 |                1.44× |
| Russian, 65,280 UTF-16 units |        3.306 |    4.649 |                1.41× |

[Charts](benchmarks/typograf.html) · [Inputs, settings and raw samples](benchmarks/typograf.json).
This is a symbolic-formatting comparison, not the default profile with soft
hyphens. On the mixed URL/email workloads, Typograf was 1.5–2.2× faster and
outputs differed. Default Typograf also performs cleanup outside our scope.

For hyphenation, Typographist with a warmed 64 MiB cache was faster than
hyphen and Hypher on shared passing workloads. Ratios below are the median of
per-workload library/Typographist times; above one means Typographist is faster.

| Library                  | Knuth–Liang speedup | Khristov speedup | Included workloads |
| ------------------------ | ------------------: | ---------------: | -----------------: |
| hyphen 1.14.1            |               1.22× |            1.30× |              29/29 |
| Hypher 0.2.5             |               1.42× |            1.54× |              16/29 |
| Hyphenopoly 6.1.0 (WASM) |               0.17× |            0.18× |               9/29 |

[Charts](benchmarks/hyphenation.html) · [Settings and raw samples](benchmarks/hyphenation.json).
Hyphenopoly was faster than Typographist on its nine passing workloads.
Failed preservation checks and unsupported cases are excluded from ratios but
remain in the report. Dictionaries, caches and word-protection policies differ;
passing checks do not establish identical linguistic results. This hyphenation
report measures the earlier cache implementation at the revision recorded in
its JSON, rather than a fresh run of the current source.

Both reports use Node.js 24.21.0 on an Intel Core i5-13420H under Linux/WSL.
Construction and imports are excluded from formatting times. Typograf uses
nine rotated-order batches after ten warm-up calls; the hyphenation comparison
uses seven samples after three preliminary samples, with native external cache
policies. Measurements include JIT, GC and machine-load noise. These are two
recorded runs, not universal rankings or browser measurements.

## Development

Use the Node.js version in `.nvmrc`, then run `npm ci`.

```sh
npm run build
npm run typecheck
npm run lint
npm run format:check
npm test
```

[Benchmark tools](tools/benchmarks/README.md) generate new measurements.
[Rules transformer](packages/rules-transformer/README.md) converts TeX tables
into language data. `npm run docs` generates TypeDoc after a build.

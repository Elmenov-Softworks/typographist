# Typographist

Typography libraries for JavaScript and components for Vue, React, and Solid.
The core package applies symbolic typography and inserts soft hyphens.
Letters, case, word order and numeric notation are preserved by bundled rules.
The framework packages are currently placeholders.

```ts
import { Typographist } from '@elmenov-softworks/typographist';

const typographist = new Typographist({
  locale: 'en',
  categories: ['hyphenation'],
  excludedWords: ['Typographist'],
  useFast: false,
});

typographist.format('table'); // 'ta\u00adble'
typographist.format('асбест', 'ru'); // 'ас\u00adбест'
```

Omitting `categories` selects all available categories. This changes the previous
hyphenation-only default: punctuation and whitespace can now change before soft
hyphens are inserted. To retain the previous behavior, use
`categories: ['hyphenation']` as above. `useFast` changes only the hyphenation
algorithm, independently of selected text categories.

| Category             | Behavior                                                           |
| -------------------- | ------------------------------------------------------------------ |
| `quotes`             | Bundled Russian and English quotation pairs, nesting and cleanup.  |
| `dashes`             | Supported prose and range separators, and clear unary minus signs. |
| `punctuation`        | Apostrophe and ellipsis glyph conversion; repeated signs stay.     |
| `spacing`            | Ordinary whitespace cleanup and punctuation spacing.               |
| `nonbreakingSpacing` | Supported word, abbreviation, number-label and unit bindings.      |
| `hyphenation`        | Soft hyphens from the selected existing algorithm.                 |

```ts
const punctuation = new Typographist({ categories: ['punctuation'] });
punctuation.format('Wait...'); // 'Wait…', without soft hyphens

const unchanged = new Typographist({ categories: [] });
unchanged.format('  Wait...  '); // '  Wait...  '

const spaced = new Typographist({
  categories: ['spacing'],
  settings: {
    'common/space/delRepeatN': { maxConsecutiveLineBreaks: 1 },
    'common/space/insertFinalNewline': { enabled: true },
  },
});
spaced.format('a\n\n\nb'); // 'a\nb\n'
```

Explicit category lists replace the default selection; an empty list disables
formatting but still validates text and requires a registered locale. Settings
override the selected rule's defaults; they do not select categories. Unknown
rule IDs, undeclared setting names and mismatched primitive types are rejected.
Bundled rule settings apply only where that rule supports the registered locale;
Russian settings can coexist with English and consumer typography-only locales.
They do not add bundled capabilities to consumer locales.
Enabled rules also validate setting ranges during preparation. Final-newline
insertion is off unless its `enabled` setting is true. See the
[rule catalogue](specs/feature/typography/typograf-rule-inventory.md) for individual
defaults, settings, ordering, reference IDs and deviations.

`rules` continues to supply hyphenation datasets; it does not select formatting
categories. `textRules` supplies shared symbolic rules and `textLocales` registers
locales with symbolic rules but no hyphenation data. No Typograf runtime dependency
is required. Bundled typography covers `en` and `ru` only. The `en` typography
currently shares the implemented behavior of reference `en-US` and `en-GB`; neither
regional identifier is registered automatically. There is no region fallback.

Configuration defaults to `locale: 'en'`, English and Russian rules, no excluded
words, and `useFast: false`. Standard mode uses Knuth–Liang patterns. Set
`useFast: true` to select the Khristov heuristic in the modification by Dymchenko
and Varsanofyev. For example, fast mode formats `hyphenation` as
`hyp\u00adhe\u00adna\u00adtion`. `Locale` contains only the bundled locales, `'en' | 'ru'`. The bundled `en` rules use US English
patterns. Selecting a locale does not automatically detect languages within
text. Unsupported words remain unchanged.

Only `Typographist` and `TypographistRules` are runtime exports. Configuration,
locale, and declarative plugin output types are also available. Internal
algorithms, matchers, normalization and prepared services are not public APIs.

`cacheSize` defaults to 64 MiB. Positive finite numbers, including fractions,
set the estimated word-cache budget; zero disables caching. Negative,
non-finite and non-number values throw during initialization. Each instance
starts with an empty in-memory LRU cache shared across its locales. Successful
rule additions, replacements and removals clear it. Failed changes and absent
locale removals preserve it.

The estimate is 96 bytes per entry plus two bytes per UTF-16 code unit in its
JSON-encoded `[locale, originalWord]` key and formatted result. This accounts
for identity, strings and entry overhead, but is not an exact JavaScript heap
limit: physical memory varies by runtime. Prepared rules and temporary
formatting allocations are outside the budget. The budget allocates nothing
up front; entries larger than it are formatted without retention.

An instance has four public methods:

- `format(text, locale?)` selects the call's locale or the configured default.
- `addRules(rules)` compiles and adds or replaces the plugin's locale atomically.
- `addTextLocale(definition)` adds or atomically replaces a typography-only locale.
- `removeRules(locale)` removes the locale and returns whether it was registered.

Unknown locales throw. The default locale must be registered at construction;
removing it makes formatting without an override fail until rules are added
again. Duplicate locales in the constructor are rejected. Configuration arrays
and rule data are snapshotted during preparation. Excluded words use exact,
case-sensitive matches. Existing soft hyphens, identifiers, addresses and
unsupported complete words retain the existing hyphenation preservation behavior.
`excludedWords` excludes only hyphenation; surrounding typography still runs.
Recognized URLs, emails and nonempty `protectedContent` literals bypass both text
rules and hyphenation. Identifier filters belong to hyphenation and do not disable
surrounding whitespace or punctuation rules. Plain-text formatting does not sanitize
HTML or generate markup.

Text handlers run on unprotected segments in ascending `order`, followed by
hyphenation. Equal priorities preserve registration order: bundled rules, shared
`textRules`, then locale-owned rules. Protection can split a sentence or quotation
across segments; custom handlers must not assume they receive the entire input.
Their optional context identifies original line and complete-text boundaries.
Preparation runs once per locale registration. Handlers must synchronously return
a string; promises and other result types throw. Custom handlers own their
content-preservation and repeated-formatting behavior.

Bundled English and Russian spacing starts with CRLF and lone CR normalization
to LF (`common/space/normalizeLineEndings`, order 0, no settings), before whitespace
cleanup. Protected literals retain their original line endings. Disabling
`spacing`, including the hyphenation-only profile, preserves line endings. Consumer
locales receive this preparation only if they supply it themselves.

Existing NBSPs are preserved instead of being converted to ordinary spaces before
nonbreaking bindings. The removed `common/nbsp/replaceNbsp` builtin ID is rejected
in settings.

A typography-only locale needs no fabricated patterns or letter classifications:

```ts
import type { TextLocale } from '@elmenov-softworks/typographist';

const exampleLocale: TextLocale<'example'> = {
  locale: 'example',
  textRules: [
    {
      id: 'example/quotes',
      category: 'quotes',
      order: 410,
      defaults: {},
      prepare: () => (text) => text.replace(/"([^"\n]+)"/g, '‹$1›'),
    },
    {
      id: 'example/spacing',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/ {2,}/g, ' '),
    },
  ],
};

const customText = new Typographist<'example'>({
  locale: 'example',
  rules: [],
  textLocales: [exampleLocale],
  categories: ['quotes', 'spacing'],
});
customText.format('"hello"  world'); // '‹hello› world'
```

This small consumer rule handles paired straight quotes only; it does not provide
nested or unmatched quotation handling. Consumer locales receive no implicit
bundled rules. Omitting categories uses their available text capabilities;
explicitly selecting `hyphenation` for a typography-only locale throws. Successful
replacement clears the shared word cache; failed registration preserves prior
state. Supply algorithm data through `TypographistRules` when hyphenation is needed.

Built-in repeated-formatting scenarios are tested. Russian day–month range bindings
remain stable after removal of NBSP normalization. Some nonglobal bindings require
additional passes when several matches occur in one segment. See the
[catalogue's repeated-formatting notes](specs/feature/typography/typograf-rule-inventory.md#repeated-formatting-regressions).
Bundled quotation handling, reference coverage and completed-feature benchmarks
are implemented and recorded. Complete independent review and final owner acceptance
remain open; no publication is authorized. See the
[verification record](specs/feature/typography/checklists/requirements.md).

Custom plugins extend `TypographistRules`. Its constructor accepts either or both
algorithm datasets; only the dataset selected by `useFast` is required. Subclasses
can instead override the synchronous `compile`
operation when they own the storage. No runtime algorithm or normalization
internals are needed:

```ts
import { TypographistRules } from '@elmenov-softworks/typographist';

class GermanRules extends TypographistRules<'de'> {
  constructor() {
    const shared = {
      locale: 'de',
      alphabet: 'abcdefghijklmnopqrstuvwxyzäöüß',
      leftMin: 2,
      rightMin: 2,
    } as const;

    super({
      standard: {
        ...shared,
        patterns: ['a1b'], // Replace with complete language patterns.
      },
    });
  }
}

const custom = new Typographist<'de'>();
custom.addRules(new GermanRules());
custom.format('abcd', 'de');
custom.removeRules('de');
```

Default instances accept only `en` and `ru` in configuration, formatting and
removal. Custom locales are inferred from typed rules supplied to the
constructor, for example `new Typographist({ locale: 'de', rules: [new GermanRules()] })`.
For dynamic registration, declare additional locale strings on the instance
as shown above. A union such as `new Typographist<'de' | 'zu'>()` permits both
additional locales alongside `en` and `ru`; their rules still need registration.
Unregistered locales still throw at runtime. The library does
not promise language coverage for externally supplied rules.

Supplying `rules` in the constructor replaces the bundled list. `compile` runs
once per registration and receives the configured `useFast` value. The base
class accepts `{ standard, fast }` with either dataset independently optional: `standard` is `CompiledRules` with
Knuth–Liang patterns, and `fast` is `KhristovRules` with `vowels`, `consonants`,
and `specialLetters`. Both share `LanguageRules`: locale, alphabet, break minima
and optional explicit exceptions. Subclasses can inherit this compiler or
override it with a normal method or function property. An override must return
Khristov data for `compile(true)` and Knuth–Liang data for `compile(false)`.

The example above supplies only standard data and works with the default
`useFast: false`. To select `useFast: true`, supply a `fast` dataset with a
complete classification of the supported alphabet for Khristov. Missing or
incompatible selected data fails registration; there is no fallback to another
algorithm. Invalid replacement data leaves the previous registration usable.

Patterns and classifications must match the alphabet's NFC lowercase form.
The vowel, consonant and special-letter sets must partition that alphabet
without duplicates or overlap; the special-letter set may be empty. Exception
positions are increasing interior UTF-16 offsets at grapheme boundaries; an
empty positions array prevents hyphenation. Exceptions replace all algorithm
suggestions in both modes. Minima count original graphemes and apply to
exceptions too. Matching normalizes words, while reconstruction preserves their
original case, characters and Unicode representation.

Bundled English uses vowels `aeiouy`, consonants `bcdfghjklmnpqrstvwxz`, and no
special letters. `y` is always a vowel, including at the start of a word.
Bundled Russian uses vowels `аеёиоуыэюя`, consonants `бвгджзклмнпрстфхцчшщ`,
and special letters `йьъ`. The minima remain 2/3 for English and 2/2 for Russian.
Both modes retain the existing explicit exceptions: `table` becomes
`ta\u00adble`, and `present` remains unchanged.

Khristov applies ordered character-class rules with each suggested break acting
as a barrier for later matches. It can split vowel groups and consonant digraphs
differently from dictionary hyphenation: `beautiful` becomes
`be\u00adauti\u00adful`, and `вьюга` becomes `вь\u00adюга`. Use standard mode when
these linguistic distinctions matter. Fast mode does not consult Knuth–Liang
to repair ordinary words. No accuracy percentage or universal language coverage
is promised; additional locales need suitable supplied data.

The public class coordinates a locale registry and a selected algorithm
strategy. Stateful registration stays in the registry; word analysis, pattern
matching, exception resolution, scanning and reconstruction use separate
functions. The formatting path has no unbounded word cache or shared scratch
buffers.

[Rules transformer](packages/rules-transformer/README.md) converts TeX tables to
TypeScript and is installed independently as the `transform-rules` CLI.
[Benchmarks](tools/benchmarks/README.md) produce JSON and a standalone HTML report
for both algorithm modes, optionally comparing a previous emitted implementation.

Use the Node.js version in `.nvmrc`, then run `npm ci`.

- `npm run build` builds all packages and declaration files.
- `npm run typecheck` checks source and tool configurations.
- `npm run lint` and `npm run format:check` check code and formatting.
- `npm test` runs the Vitest projects, including release automation tests.
- `npm run docs` generates TypeDoc after `npm run build`.

Releases and documentation publication run in GitHub Actions after updates to
`master`. All five packages share one version, with patch releases by default.
For a minor or major release, add `.release/request.json` with `{"type":"minor"}`
or `{"type":"major"}`. The release Action consumes the request once.

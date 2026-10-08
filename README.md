# Typographist

Typography libraries for JavaScript and components for Vue, React, and Solid.
The core package inserts soft hyphens without changing original characters.
The framework packages are currently placeholders.

```ts
import { Typographist } from '@elmenov-softworks/typographist';

const typographist = new Typographist({
  locale: 'en',
  excludedWords: ['Typographist'],
  useFast: false,
});

typographist.format('table'); // 'ta\u00adble'
typographist.format('асбест', 'ru'); // 'ас\u00adбест'
```

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

An instance has three public methods:

- `format(text, locale?)` selects the call's locale or the configured default.
- `addRules(rules)` compiles and adds or replaces the plugin's locale atomically.
- `removeRules(locale)` removes the locale and returns whether it was registered.

Unknown locales throw. The default locale must be registered at construction;
removing it makes formatting without an override fail until rules are added
again. Duplicate locales in the constructor are rejected. Configuration arrays
and rule data are snapshotted during preparation. Excluded words use exact,
case-sensitive matches. Existing soft hyphens, identifiers, addresses and
unsupported complete words retain the existing preservation behavior.

Custom plugins extend `TypographistRules`. Its constructor requires both
algorithm datasets; subclasses can instead override the synchronous `compile`
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
      fast: {
        ...shared,
        vowels: 'aeiouyäöü',
        consonants: 'bcdfghjklmnpqrstvwxzß',
        specialLetters: '',
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
class accepts `{ standard, fast }`: `standard` is `CompiledRules` with
Knuth–Liang patterns, and `fast` is `KhristovRules` with `vowels`, `consonants`,
and `specialLetters`. Both share `LanguageRules`: locale, alphabet, break minima
and optional explicit exceptions. Subclasses can inherit this compiler or
override it with a normal method or function property. An override must return
Khristov data for `compile(true)` and Knuth–Liang data for `compile(false)`.

Migration is required for custom rules that previously supplied only patterns
or relied on an omitted `fast` dataset. Supply both datasets, including a
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

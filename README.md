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
words, and `useFast: false`. Both values of `useFast` currently select
Knuth–Liang; the flag reserves selection of a future fast algorithm. `Locale`
contains only the bundled locales, `'en' | 'ru'`. The bundled `en` rules use US English
patterns. Selecting a locale does not automatically detect languages within
text. Unsupported words remain unchanged.

Only `Typographist` and `TypographistRules` are runtime exports. Configuration,
locale, and declarative plugin output types are also available. Internal
algorithms, matchers, normalization and prepared services are not public APIs.

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

Custom plugins extend `TypographistRules` and implement its single `compile`
operation. The plugin owns storage and can select different rule data based on
`useFast`. No runtime algorithm or normalization internals are needed:

```ts
import { TypographistRules } from '@elmenov-softworks/typographist';
import type { CompiledRules } from '@elmenov-softworks/typographist';

class GermanRules extends TypographistRules<'de'> {
  override compile(_useFast: boolean) {
    const rules: CompiledRules<'de'> = {
      locale: 'de',
      alphabet: 'abcdefghijklmnopqrstuvwxyzäöüß',
      leftMin: 2,
      rightMin: 2,
      patterns: ['a1b'], // Replace with complete language data.
    };

    return rules;
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
class also accepts `{ standard, fast? }` rule sets in its constructor; when
`fast` is omitted it reuses `standard`. Subclasses can inherit this compiler
or override it with a normal method or function property. `compile` returns
locale, alphabet, break minima, patterns and optional explicit exceptions.
Patterns must match the alphabet's NFC lowercase form. Exception positions are
increasing interior UTF-16 offsets at grapheme boundaries; an empty positions
array prevents hyphenation. Minima count original graphemes.

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

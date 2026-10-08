# Fast Khristov hyphenation

Status: Approved by the owner. The owner confirmed dictionary scope, language coverage, compiler behavior, and the final specification with the selected Russian and English rules.

## Goal and current behavior

Add the heuristic hyphenation algorithm attributed to P. Khristov in the modification by Dymchenko and Varsanofyev, with the language dictionaries it needs. Enable fast processing through the existing `useFast` configuration flag.

The current core package registers bundled English (`en`) and Russian (`ru`) rules. `useFast` defaults to `false` and reaches each plugin's synchronous `compile(useFast)` call once per registration. The base compiler accepts `{ standard, fast? }` datasets and selects `standard` when `fast` is absent. Both modes currently prepare Knuth–Liang; the flag changes the selected dataset, but not the algorithm.

`CompiledRules` currently contains a locale, an alphabet, left/right break minima, Knuth–Liang patterns, and optional explicit exceptions. It has no character classification data for Khristov. Exceptions take precedence over algorithm suggestions, including empty position arrays that prohibit breaks.

## Confirmed scope and requirements

The owner requested a fast algorithm and its dictionaries, selected with `useFast`, and identified the Khristov modification to implement. Fast output is heuristic; identical linguistic results between algorithms are not required.

The owner confirmed that dictionaries mean sets of vowels and consonants, not complete word dictionaries or precomputed word breaks. Supply the character classifications needed by the agreed algorithm, including handling Russian `й`, `ь`, and `ъ`. Do not add word-list enumeration to the fast matcher. Existing explicit exception support remains part of the established contract; this task does not introduce a new corpus of word exceptions.

Language coverage stays unchanged: ship both algorithms for bundled `en` and `ru`, and retain user-supplied locale support. Preserve locale typing, registration, lookup, and formatting contracts. Record each bundled language's classifications, including the treatment of English `y`, in its data and fixtures.

Extend `TypographistRules` so user rules supply data for both Knuth–Liang and Khristov. Preserve the synchronous `compile(useFast)` lifecycle: `compile(true)` returns Khristov data and `compile(false)` returns Knuth–Liang data. The default configuration remains `useFast: false`. Remove the current fallback from missing fast data to standard patterns. A custom rule definition containing only Knuth–Liang patterns no longer satisfies the complete rule contract and must be updated with Khristov data.

Extend public rule data types and their validation to represent the two algorithm-specific datasets while preserving shared locale, alphabet, minima, and exception semantics. Keep the existing subclass extension path and once-per-registration compilation. Selected data must match the requested algorithm; missing or incompatible selected data must fail registration rather than execute another algorithm silently. The exact field/type layout is an implementation choice. Update custom-rule examples and tests to supply both datasets and explain this required migration.

Keep Knuth–Liang as the standard algorithm when `useFast` is omitted or `false`. Preserve its bundled data and output. Add the fast mode within the existing rule registration and text formatting contracts; retain synchronous formatting and explicit locale selection.

Both modes must preserve the existing text guarantees:

- Insert only U+00AD SOFT HYPHEN. Preserve every original character, its case, and its Unicode representation.
- Apply locale minima in original graphemes and insert only at original grapheme boundaries. Bundled minima remain `en: 2/3` and `ru: 2/2` unless the owner requests a change.
- Preserve complete unsupported words, existing soft hyphens, excluded words, recognized addresses, identifiers, and non-breaking compounds. Process visible-hyphen components according to the current scanner policy.
- Preserve exception precedence, normalization to NFC and lowercase for matching, and mapping back to original offsets.
- Keep formatting deterministic and idempotent for fixed rules and runtime Unicode behavior. Keep prepared instances independent, including after subsequent registration or replacement of another instance's rules.

Validate and prepare selected language data during registration. Invalid replacement data must leave the previous registration usable. Subsequent mutation of caller-owned arrays or objects must not change prepared behavior. Formatting must perform no I/O and introduce no DOM, framework, or Node-only runtime requirements.

Implement the ordered Khristov rules and matching semantics below. Return all applicable insertion positions for soft hyphenation; choosing one break to fit a rendered line is outside scope.

Do not promise a linguistic accuracy percentage or universal language coverage. Heuristic output may differ from Knuth–Liang, including for English. Additional languages require suitable supplied data; the owner's statement that the heuristic suits many languages is not an automatic-language-detection requirement.

## Selected language data and rules

The selected baseline is the character-class rule table in the [Wiktionary hyphenation module](https://ru.wiktionary.org/wiki/Модуль:hyphenation), which identifies its algorithm as the Khristov modification by Dymchenko and Varsanofyev. This is a reference implementation, not evidence of the original historical publication. Use its effective rule sequence with the project-specific semantics specified here; do not port its text parsing or accent removal.

Notation: `V` is a vowel, `C` a consonant, and `X` a special letter. `|` denotes a suggested break, never a literal output character. Pattern offsets count normalized symbols from the beginning of a match. Actual output inserts U+00AD at mapped original grapheme boundaries.

### Russian (`ru`)

Use these lowercase normalized sets. They partition the existing Russian alphabet; `й`, `ь`, and `ъ` belong exclusively to `X`.

| Class | Letters                |
| ----- | ---------------------- |
| V     | `аеёиоуыэюя`           |
| C     | `бвгджзклмнпрстфхцчшщ` |
| X     | `йьъ`                  |

Apply the following rules in the listed order. Long consonant-cluster rules precede shorter syllable rules so the latter cannot change their selected boundary.

| Order | Match    | Suggested split | Offset |
| ----- | -------- | --------------- | ------ |
| 1     | `XVV`    | `X\|VV`         | 1      |
| 2     | `XVC`    | `X\|VC`         | 1      |
| 3     | `XCV`    | `X\|CV`         | 1      |
| 4     | `XCC`    | `X\|CC`         | 1      |
| 5     | `VCCCCV` | `VCC\|CCV`      | 3      |
| 6     | `VCCCV`  | `VCC\|CV`       | 3      |
| 7     | `CVCV`   | `CV\|CV`        | 2      |
| 8     | `VCCV`   | `VC\|CV`        | 2      |
| 9     | `CVVV`   | `CV\|VV`        | 2      |
| 10    | `CVVC`   | `CV\|VC`        | 2      |

The reference also lists `VCCCV` with offset 2 immediately after offset 3. Omit that redundant rule: under sequential barrier semantics, the earlier rule has already split every eligible match. Select offset 3 consistently; do not produce both candidate boundaries or let collection iteration order choose the result.

The `X` rules can suggest a break after a special letter followed by two vowels/consonants. They never suggest a break before that special letter. A trailing special letter, or one followed by only a single letter, does not independently generate a break. Russian vowel runs without the required preceding consonant do not gain arbitrary `V|V` breaks. Five or more consecutive consonants do not receive an extra invented cluster rule.

### English (`en`)

Use these sets, partitioning the existing ASCII English alphabet:

| Class | Letters                |
| ----- | ---------------------- |
| V     | `aeiouy`               |
| C     | `bcdfghjklmnpqrstvwxz` |
| X     | Empty                  |

Treat `y` as a vowel in every position, including initial `y`. This is the selected context-free heuristic, not a pronunciation model. Classify `q`, `h`, `w`, and all other listed consonants individually. Do not introduce digraph units, silent-letter rules, stress detection, or morphological analysis.

Apply these six rules in order; they are the non-`X` subset of the Russian sequence:

| Order | Match    | Suggested split | Offset |
| ----- | -------- | --------------- | ------ |
| 1     | `VCCCCV` | `VCC\|CCV`      | 3      |
| 2     | `VCCCV`  | `VCC\|CV`       | 3      |
| 3     | `CVCV`   | `CV\|CV`        | 2      |
| 4     | `VCCV`   | `VC\|CV`        | 2      |
| 5     | `CVVV`   | `CV\|VV`        | 2      |
| 6     | `CVVC`   | `CV\|VC`        | 2      |

These rules deliberately preserve the chosen Khristov heuristic. They can divide written vowel groups and consonant digraphs differently from English dictionary hyphenation. Use Knuth–Liang when that linguistic distinction matters. Fast mode must not call Knuth–Liang to correct individual ordinary words.

### Matching, precedence, and filtering

Normalize supported words through the existing NFC/lowercase analysis and classify their normalized symbols. Preserve the original word for reconstruction. Bundled datasets have complete, disjoint classifications; user data must provide an unambiguous classification for each supported normalized symbol. An empty special-letter set is valid. Unknown letters do not become consonants automatically.

For each rule, scan eligible match starts from left to right. A match is eligible only when its full symbol sequence is contiguous and contains no previously marked break strictly inside it. Mark the specified boundary immediately. Further matches of this rule and later rules observe the mark as a barrier. A mark at a match's start or end does not block it. Consider overlapping starts explicitly rather than depending on non-overlapping regular-expression replacement semantics.

Rule application is equivalent to inserting barriers into a class string, but does not require copying that string. Marked boundaries do not change symbol indexes. A left-to-right scan can continue forward because adding a barrier only removes eligible matches; it cannot create a new class match. For example, `CVCVCV` yields marks after symbols 2 and 4, while the earlier `VCCCV` rule prevents shorter rules from splitting across its chosen boundary.

After all rules run, map candidates to original offsets, discard candidates without an original grapheme boundary, and apply the locale's existing left/right minima. Minima and mapping filter final candidates; a filtered mark still acted as a barrier during matching. Produce sorted, unique original UTF-16 offsets without inserting into or repeatedly rescanning the original word. Do not invent candidates when no rule matches.

Retain the current bundled explicit exceptions in both modes, with their existing lookup precedence and minima. An exception replaces the complete heuristic candidate list; it does not merge with it. This reuses existing exception data and does not add a full word dictionary. In particular, English `table` yields `ta|ble` and `present` stays unchanged, even though the heuristic alone suggests different candidates.

### Observable examples

The following expected outputs include bundled minima and existing exception precedence. `|` represents U+00AD for readability. They describe the selected heuristic, including its linguistic limitations.

| Locale | Input                                                   | Expected fast output                      |
| ------ | ------------------------------------------------------- | ----------------------------------------- |
| ru     | `машина`                                                | `ма\|ши\|на`                              |
| ru     | `молоко`                                                | `мо\|ло\|ко`                              |
| ru     | `ёлочка`                                                | `ёлоч\|ка`                                |
| ru     | `майка`                                                 | `май\|ка`                                 |
| ru     | `пальма`                                                | `паль\|ма`                                |
| ru     | `объём`                                                 | `объ\|ём`                                 |
| ru     | `подъезд`                                               | `подъ\|езд`                               |
| ru     | `сестра`                                                | `сест\|ра`                                |
| ru     | `отстранять`                                            | `отс\|тра\|нять`                          |
| ru     | `поэт`                                                  | `по\|эт`                                  |
| ru     | `поэзия`                                                | `по\|эзия`                                |
| ru     | `какао`                                                 | `ка\|као`                                 |
| ru     | `аист`, `семья`, `взгляд`, `агентство`                  | Each unchanged                            |
| ru     | `вьюга`                                                 | `вь\|юга`                                 |
| en     | `hyphenation`                                           | `hyp\|he\|na\|tion`                       |
| en     | `computer`                                              | `com\|pu\|ter`                            |
| en     | `representation`                                        | `rep\|re\|sen\|ta\|tion`                  |
| en     | `banana`                                                | `ba\|nana`                                |
| en     | `yellow`                                                | `yel\|low`                                |
| en     | `syllable`                                              | `syl\|lable`                              |
| en     | `beautiful`                                             | `be\|auti\|ful`                           |
| en     | `queue`                                                 | `qu\|eue`                                 |
| en     | `astray`                                                | `ast\|ray`                                |
| en     | `speak`, `lead`, `extra`, `rhythm`, `myth`, `strengths` | Each unchanged                            |
| en     | `table`, `TABLE`                                        | `ta\|ble`, `TA\|BLE` (existing exception) |
| en     | `present`                                               | Unchanged (existing no-break exception)   |

`вь|юга`, `отс|тра|нять`, and the English vowel-group examples document approximate output rather than orthographic guarantees. Adding lexical repairs for them is outside this task. Also verify uppercase variants and decomposed `е\u0308лочка`, whose output must preserve the original spelling as `е\u0308лоч|ка`.

## Acceptance criteria

- Bundled `useFast: true` processing executes the selected Khristov modification. `hyphenation` demonstrates the different algorithm boundaries. Standard-mode golden fixtures continue to pass unchanged.
- Each selected rule has a class-level expected-boundary fixture with the split in its table, independently of bundled minima. Include overlapping contexts and contexts affected by earlier breaks so tests establish rule semantics rather than reproducing the matcher implementation. The observable example table passes with bundled minima and exceptions.
- Fast locale fixtures cover lower/uppercase spelling, adjacent vowels, consonant clusters, Russian special letters, short words, and words without vowels. Cases without a permitted candidate return the original word.
- Explicit break and no-break exceptions override heuristic suggestions and still respect minima. Include original decomposed spelling, unsupported combining marks, and boundaries created by normalization expansion.
- Existing preservation, exclusion, grapheme, idempotence, locale lookup, rule replacement, and instance isolation scenarios pass in both modes. Expected break positions are mode-specific where necessary.
- A custom locale can supply both algorithm datasets and obtain the corresponding breaks in each mode without adding language-specific branches to text formatting. `compile(true)` returns Khristov data; `compile(false)` returns Knuth–Liang data. Compilation runs once per registration with the configured flag.
- Missing Khristov data in fast mode fails registration. No fast-to-standard fallback remains. Selected data for the wrong algorithm fails registration, and failed replacement leaves the previous registration usable.
- Malformed classifications, out-of-alphabet entries, contradictory classifications, invalid minima, and invalid exception offsets fail at registration under the agreed fast data model. Failed replacement preserves earlier rules.
- Documentation explains fast mode, heuristic accuracy, bundled language data, and the requirement for custom rules to supply both algorithms. Existing pattern-only examples and tests are migrated.

## Performance and verification

Prepare reusable dictionary lookups once per registration. For fixed language data and a fixed rule sequence, target processing proportional to input and inserted output size. Account for normalization, grapheme analysis, exceptions, and reconstruction as well as rule matching. Avoid repeated whole-word rewriting per inserted break and unbounded word caches. Report preparation and temporary memory costs separately.

Use the existing Node.js benchmark harness to compare standard and fast modes on the same workloads. Identify the actual algorithm correctly in JSON and HTML reports. Separate instance preparation from processing. Retain environment, workload hashes, warm-ups, and individual samples. Include long words, increasing input sizes, repeated words, varied vocabulary, Unicode, protected tokens, and existing soft hyphens.

The harness currently labels both modes `knuth-liang` and optionally compares every implementation's output with a legacy Knuth–Liang reference. Update these assumptions for heuristic output: preserve exact comparison for compatible standard implementations, and verify fast output against its own fixtures and common preservation invariants. Mode-specific output differences are not benchmark failures. Do not change historical reports to imply they measured Khristov.

No numeric speed or accuracy threshold has been agreed. Report measured preparation and processing differences and investigate regressions before claiming that the new mode is faster. Timing must remain outside ordinary correctness tests.

Future implementation verification commands, from the repository root:

```sh
npm run test --workspace=@elmenov-softworks/typographist
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
node tools/benchmarks/hyphenation.ts --output /tmp/typographist-benchmarks/base-khristov
```

Use the Node.js version in `.nvmrc` (`24.21.0`). Investigation ran under `24.19.0`; no project tests, builds, or benchmarks were run while preparing this draft. Research inspected the public API, algorithm selection, rules, text reconstruction, normalization, exceptions, tests, and benchmark harness. A bounded Python model, run without changing implementation files, checked the ordered rules, barrier semantics, minima, and examples. Existing exception entries were inspected separately; this model is research, not implementation verification. The Markdown formatting check passed.

## Constraints and exclusions

Follow the repository's global and TypeScript engineering rules. Keep language data separate from runtime text formatting. Do not prescribe a new class hierarchy or expose internal algorithm machinery as public API solely for testing.

This task does not change framework wrappers, build a line layout engine, train TeX patterns, add automatic language detection, or introduce new publication workflows. The rules-transformer CLI continues to serve its established TeX conversion contract unless a separate requirement is agreed. No dependency or numeric benchmark gate is proposed.

## Open questions

No unresolved requirements remain. The owner delegated rule selection; the exact selected tables, classifications, precedence, limitations, and expected outputs are recorded above for review.

The owner explicitly approved this saved specification. Approval of the specification does not authorize implementation, commits, or orchestrator execution. The manual orchestrator requires a clean feature branch; an in-repository specification needs a separately authorized documentation commit before starting it. Its `--approve` execution flag is separate from specification approval.

# Reference coverage audit — 2026-10-08

Owner correction — 2026-10-09: punctuation formatting retains apostrophe and ellipsis
glyph conversion only. TP-R053, TP-R054, TP-R058 and TP-R060 are removed from
the bundle; repeated signs and their order remain as supplied. Earlier audit,
benchmark and acceptance evidence predates this reduced scope. Other owner
scope corrections remain pending implementation in subsequent slices.

This audit checks the saved 107-rule inventory against bundled handler declarations.
It is a source coverage check, not proof that every reference fixture or interaction
passes. The inventory remains the source for defaults, settings and deviations.

All 65 included or adapted reference entries have bundled handler declarations.
TP-R034 maps to the existing English prose-dash handler rather than a separate
regional locale. TP-R056 supplies configurable quotation pairs, duplicate removal
and quotation spacing. The 42 excluded entries
remain excluded; default-profile exclusion tests are recorded in the inventory.

### Supplemental hyphenation, minus and registration audit

Reviewed the supplemental `common/dash/minus` handler, algorithm selection,
hyphenation preparation, word formatting, exclusions, shared word cache and
locale registry. Unary-minus normalization changes a standalone hyphen before
an unchanged digit expression to U+2212. Fixtures distinguish it from prose
dashes and ranges and preserve dates, phone sequences, identifier suffixes,
decimal/fraction notation, URLs, emails and configured literals. Both bundled
locales test category disabling, repeated formatting and algorithm integration.
This supplemental handler is outside the pinned 107-rule inventory.

The hyphenation regressions exercise default and hyphenation-only profiles with
both algorithms and zero/64 MiB caches. They cover case-sensitive exclusions,
existing soft hyphens, unsupported words, grapheme boundaries, exceptions and
visible-hyphen components. Selected algorithm data is required without fallback.
Cache tests exercise exact-source and locale separation, shared LRU eviction,
zero-size disabling, successful mutation invalidation and failed-registration
rollback. The registry prepares replacement services before changing its map or
clearing the cache; no whole-text or persistent cache was introduced.

Typography-only locale and pipeline fixtures additionally cover missing locales,
explicit unavailable hyphenation, stable ordering for equal priorities,
preparation once per registration, disabled-rule preparation avoidance,
overlapping protected literals, copied settings and invalid synchronous results.
The built-in text pipeline finishes symbolic rules before word hyphenation.
Consumer handler closures remain consumer-owned; these tests do not promise
isolation from arbitrary mutable state captured by a supplied handler.

The seven focused suites passed 107 tests on Node v24.21.0. The public-entry
suite was checked separately for missing and incompatible selected algorithm
data and failed-replacement behavior. No new browser run or upstream comparison
was performed, and no production source changed. This closes this supplemental
evidence review; final acceptance and independent reviews remain open.

## Included and adapted entries

| Trace ID | Reference ID                              | Bundled source                                        |
| -------- | ----------------------------------------- | ----------------------------------------------------- |
| TP-R011  | `common/space/replaceTab`                 | Removed on 2026-10-09; tabs preserved                 |
| TP-R012  | `common/space/trimLeft`                   | Removed on 2026-10-09; outer whitespace retained      |
| TP-R013  | `common/space/trimRight`                  | Removed on 2026-10-09; outer whitespace retained      |
| TP-R014  | `common/space/delTrailingBlanks`          | `bundled-spacing.factory.ts`                          |
| TP-R015  | `common/space/delRepeatSpace`             | `bundled-spacing.factory.ts`                          |
| TP-R016  | `common/space/delRepeatN`                 | Removed (2026-10-09)                                  |
| TP-R017  | `ru/space/year`                           | `bundled-spacing.factory.ts`                          |
| TP-R018  | `ru/space/afterHellip`                    | `bundled-spacing.factory.ts`                          |
| TP-R019  | `common/space/squareBracket`              | Removed: owner correction                             |
| TP-R020  | `common/space/insertFinalNewline`         | Removed by owner correction (2026-10-09)              |
| TP-R021  | `common/space/delLeadingBlanks`           | Removed by owner scope correction                     |
| TP-R022  | `common/space/delBetweenExclamationMarks` | `bundled-spacing.factory.ts`                          |
| TP-R023  | `common/space/delBeforePunctuation`       | `bundled-spacing.factory.ts`                          |
| TP-R024  | `common/space/delBeforePercent`           | Removed by owner scope correction                     |
| TP-R025  | `common/space/delBeforeDot`               | Removed: owner correction                             |
| TP-R026  | `common/space/bracket`                    | `bundled-spacing.factory.ts`                          |
| TP-R027  | `common/space/beforeBracket`              | `bundled-spacing.factory.ts`                          |
| TP-R028  | `common/space/afterSemicolon`             | `bundled-spacing.factory.ts`                          |
| TP-R029  | `common/space/afterExclamationMark`       | `bundled-spacing.factory.ts`                          |
| TP-R030  | `common/space/afterQuestionMark`          | `bundled-spacing.factory.ts`                          |
| TP-R031  | `common/space/afterComma`                 | `bundled-spacing.factory.ts`                          |
| TP-R032  | `common/space/afterColon`                 | `bundled-spacing.factory.ts`                          |
| TP-R033  | `ru/dash/main`                            | `bundled-dashes.factory.ts`                           |
| TP-R034  | `en-GB/dash/main`                         | `bundled-dashes.factory.ts` (shared English behavior) |
| TP-R035  | `en-US/dash/main`                         | `bundled-dashes.factory.ts`                           |
| TP-R036  | `ru/dash/years`                           | `bundled-dashes.factory.ts`                           |
| TP-R037  | `ru/dash/weekday`                         | `bundled-dashes.factory.ts`                           |
| TP-R040  | `ru/dash/time`                            | `bundled-dashes.factory.ts`                           |
| TP-R043  | `ru/dash/month`                           | `bundled-dashes.factory.ts`                           |
| TP-R048  | `ru/dash/directSpeech`                    | `bundled-dashes.factory.ts`                           |
| TP-R049  | `ru/dash/decade`                          | `bundled-dashes.factory.ts`                           |
| TP-R051  | `ru/dash/daysMonth`                       | `bundled-dashes.factory.ts`                           |
| TP-R052  | `ru/dash/centuries`                       | `bundled-dashes.factory.ts`                           |
| TP-R053  | `ru/punctuation/hellipQuestion`           | `bundled-punctuation.factory.ts`                      |
| TP-R054  | `ru/punctuation/exclamation`              | `bundled-punctuation.factory.ts`                      |
| TP-R056  | `common/punctuation/quote`                | `bundled-quotes.factory.ts`                           |
| TP-R057  | `common/punctuation/hellip`               | `bundled-punctuation.factory.ts`                      |
| TP-R058  | `common/punctuation/delDoublePunctuation` | `bundled-punctuation.factory.ts`                      |
| TP-R059  | `common/punctuation/apostrophe`           | `bundled-punctuation.factory.ts`                      |
| TP-R060  | `ru/punctuation/exclamationQuestion`      | `bundled-punctuation.factory.ts`                      |
| TP-R063  | `ru/nbsp/year`                            | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R064  | `ru/nbsp/see`                             | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R065  | `ru/nbsp/rubleKopek`                      | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R066  | `ru/nbsp/ps`                              | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R067  | `ru/nbsp/page`                            | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R068  | `ru/nbsp/ooo`                             | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R069  | `ru/nbsp/mln`                             | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R070  | `ru/nbsp/initials`                        | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R071  | `ru/nbsp/dayMonth`                        | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R072  | `ru/nbsp/centuries`                       | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R073  | `ru/nbsp/afterNumberSign`                 | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R074  | `ru/nbsp/addr`                            | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R075  | `ru/nbsp/abbr`                            | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R076  | `common/nbsp/replaceNbsp`                 | Removed by owner on 2026-10-09                        |
| TP-R078  | `common/nbsp/dpi`                         | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R079  | `common/nbsp/beforeShortLastWord`         | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R080  | `common/nbsp/beforeShortLastNumber`       | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R081  | `common/nbsp/afterShortWordByList`        | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R082  | `common/nbsp/afterShortWord`              | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R083  | `common/nbsp/afterSectionMark`            | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R084  | `common/nbsp/afterParagraphMark`          | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R085  | `common/nbsp/afterNumber`                 | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R086  | `ru/nbsp/years`                           | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R087  | `ru/nbsp/m`                               | `bundled-nonbreaking-spacing.factory.ts`              |
| TP-R088  | `ru/nbsp/beforeParticle`                  | `bundled-nonbreaking-spacing.factory.ts`              |

Sources are relative to `packages/typographist/src/text/typography/`.
The registry prepares all five bundled factories for algorithm-backed and
typography-only English and Russian locales.

## Remaining acceptance work

### Punctuation behavior audit

Reviewed `bundled-punctuation.factory.spec.ts` against the six bundled punctuation
handlers. TP-R056 belongs to the separately tested quotation factory.

| Trace ID | Positive and negative behavior                                                                                        | Settings and interactions                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| TP-R053  | Question/exclamation ellipses and comma removal; longer dot runs unchanged.                                           | Unknown settings rejected; Russian punctuation ordering tested.                                   |
| TP-R054  | Two and four exclamation marks; one, three and five unchanged.                                                        | Unknown settings rejected; combined punctuation and repeated-pass traversal tested.               |
| TP-R057  | Three/four dots in both locales; two/five unchanged.                                                                  | Unknown settings rejected; duplicate punctuation, protection and hyphenation interactions tested. |
| TP-R058  | Duplicate comma, colon, dot, semicolon and question mark in both locales; triples and punctuation ellipses unchanged. | Unknown settings rejected; ellipsis ordering, category disabling and repeated passes tested.      |
| TP-R059  | Locale alphabet apostrophes; quotes, digits, mixed alphabets and combining marks unchanged.                           | Unknown settings rejected; protection, categories and successive apostrophe traversal tested.     |
| TP-R060  | Exclamation followed by question mark; longer runs and existing question/exclamation order unchanged.                 | Unknown settings rejected; Russian punctuation ordering tested.                                   |

These rules declare no configurable values. Settings coverage therefore checks
rejection of unknown keys. Shared service scenarios cover protected addresses,
configured literals, unchanged lexical/numeric content and empty input; the
hyphenation interaction runs with both algorithms. This audit does not close
the behavior audit for the other inventory entries.

Added an isolated Russian TP-R058 scenario and both-locale ellipsis/duplicate
punctuation interactions. Isolated Typograf 7.8.0 comparison confirms that
`word...,,` becomes `word…,` on the first punctuation-only pass in both locales.
Russian TP-R053 removes the remaining comma on the second pass; English retains
it. The tests preserve this reference traversal rather than forcing idempotence.

### Prose and named-range dash behavior audit

Reviewed TP-R033–TP-R035, TP-R037, TP-R043 and TP-R052 against
`bundled-dashes.factory.ts` and `bundled-dashes.factory.spec.ts`.

| Trace ID        | Positive and negative behavior                                                                                                                                        | Settings and interactions                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| TP-R033–TP-R035 | Supported prose dash glyphs acquire a preceding NBSP; lexical hyphens, dates, phone numbers, unsupported whitespace and longer dash runs remain unchanged.            | No configurable values; unknown keys rejected. English regional entries share the documented `en` behavior.         |
| TP-R037         | Russian weekday ranges preserve case and normalize separators; identifiers, combining-mark boundaries, multi-part ranges and unsupported separators remain unchanged. | Supported symbolic `dash` settings accepted; invalid settings rejected. Spaced prose dashes run first.              |
| TP-R043         | Russian nominative and prepositional month ranges preserve case; mixed grammatical forms, identifiers and unsupported separators remain unchanged.                    | Supported symbolic `dash` settings accepted; invalid settings rejected. Spaced prose dashes run first.              |
| TP-R052         | Uppercase Roman century ranges normalize separators; lowercase forms, word fragments, identifiers and unsupported whitespace remain unchanged.                        | Supported symbolic `dash` settings accepted; invalid settings rejected. Century normalization follows prose dashes. |

Existing isolated fixtures check repeated formatting, empty and whitespace-only
input, protections and category selection. Eight added service scenarios combine
spacing, dashes and hyphenation across both locales, algorithms and cache budgets
of zero and 64 MiB. Expected hyphenation is obtained from the hyphenation-only
profile on explicitly normalized text. They preserve URLs, emails, protected tabs
and spaces, numeric notation, lexical content and English named ranges, and check
a second pass and all-disabled formatting. The targeted file passed all 21 tests
on Node v24.21.0. No new upstream comparison was run in this slice; existing
reference fixtures and documented boundary deviations remain the evidence for
reference behavior. Other dash entries and the remaining rule families still
require their acceptance audits.

### Punctuation spacing behavior audit

Reviewed TP-R019 and TP-R022–TP-R032 against `bundled-spacing.factory.ts`
and its adjacent tests. Isolated scenarios cover bracket interiors, spacing between
exclamation/question marks, spaces before punctuation, percent signs and dots,
and spaces after semicolons, exclamation marks, question marks, commas and colons.
Each scenario checks positive and unchanged inputs in both locales and rejects
unknown settings. Opening-parenthesis tests separately cover the locale alphabet,
punctuation boundaries, combining marks, digits and supplementary characters.
These rules have no configurable values.

Eight additional service scenarios combine punctuation spacing with hyphenation
across both locales, both algorithms and cache budgets of zero and 64 MiB.
Expected results use the hyphenation-only profile on explicitly normalized text
with the same protected literal. Tests preserve URLs, emails, numeric notation,
case, repeated words, mixed scripts and combining marks. They check disabled
categories and a second pass. The interaction intentionally removes the space
before `!!` after joining `! !`; punctuation cleanup itself is disabled here.
All 57 spacing tests passed on Node v24.21.0. No new upstream comparison was run;
this records existing isolated behavior evidence and new pipeline interactions.
Remaining spacing entries, other families, CR/LF preparation and browser runtime
verification remain open.

### Basic whitespace behavior audit

Reviewed TP-R011–TP-R016 in `bundled-spacing.factory.spec.ts` against their
bundled handlers. This audit covers rule behavior without upstream's separate
CR/LF preparation step.

| Trace ID | Positive and negative behavior                                                                        | Settings and interactions                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| TP-R011  | Tabs become four spaces; ordinary and nonbreaking spaces remain unchanged in isolation.               | Unknown settings rejected; tab expansion precedes repeated-space cleanup and hyphenation.                              |
| TP-R012  | Leading Unicode whitespace is trimmed; interior whitespace and zero-width spaces remain.              | Unknown settings rejected; protected text boundaries, empty input and category disabling tested.                       |
| TP-R013  | Trailing Unicode whitespace is trimmed; interior whitespace and zero-width spaces remain.             | Unknown settings rejected; protected text boundaries and repeated formatting tested.                                   |
| TP-R014  | Spaces and tabs before LF are removed; blanks before CRLF and at isolated text end remain.            | Unknown settings rejected; combined tab expansion, trimming and line cleanup tested.                                   |
| TP-R015  | Repeated spaces and tabs between content collapse; indentation and repeated NBSP remain in isolation. | Unknown settings rejected; protected literals and tab expansion interactions tested.                                   |
| TP-R016  | LF runs reduce to two by default; shorter runs and interior CRLF remain.                              | Positive safe-integer limits accepted; invalid limits and unknown settings rejected; protected newline runs preserved. |

Eight additional service scenarios combine these rules with indentation cleanup,
both locales, both hyphenation algorithms and enabled/disabled caching. Expected
hyphenation comes from the hyphenation-only profile on explicitly cleaned text.
The scenarios check a second pass, disabled categories and protected tabs/newlines.
All 49 spacing tests passed on Node 24.21.0. This closes the behavior audit for
these six entries; remaining spacing entries, other rule families, CR/LF preparation
and browser runtime verification remain open.

### Locale spacing and final newline behavior audit

Reviewed TP-R017, TP-R018, TP-R020 and TP-R021 against the bundled spacing
handlers and their adjacent isolated tests. Year-label fixtures cover three- and
four-digit years, all supported suffixes, unchanged case and numeric notation,
Unicode boundaries and the reference's non-overlapping traversal. Ellipsis fixtures
cover Russian letter boundaries, question/exclamation ellipses, unchanged lowercase
continuations and supplementary characters. Both rules reject unknown settings
and are absent from the English bundle. Their documented repeated-pass behavior
remains unchanged.

Final-newline fixtures cover the disabled default, explicit enabling, invalid
settings, empty input, existing LF/CRLF endings, protected terminal content and
category selection. Leading-indentation fixtures cover CR/LF and Unicode line
boundaries, unchanged interior whitespace, protected segment context and unknown
settings. This audit does not establish upstream's separate CR/LF preparation.

Eight new pipeline scenarios combine all four entries with ellipsis normalization
and hyphenation across both locales, algorithms and zero/64 MiB cache budgets.
Expected results come from the hyphenation-only profile on explicitly normalized
text. They preserve numeric notation, case, mixed scripts, combining marks, URLs,
emails and a multiline protected literal. They check a second pass, all-disabled
formatting and the final-newline default separately from its enabled setting.
All 89 tests in the three affected files passed on Node v24.21.0. No new upstream
comparison was run; existing isolated reference fixtures remain the evidence for
reference behavior. This closes the remaining spacing-family behavior audit;
other families, CR/LF preparation and browser runtime verification remain open.

- TP-R056 protected-boundary, apostrophe, spacing and direct-speech interactions
  now have 32 additional service scenarios across both algorithms and cache modes.
  Isolated straight quotes around protected content remain unchanged because
  quotation context is local to each unprotected segment. Configurable pairs,
  duplicate removal, quotation spacing, fixed locale pairs, nesting, unmatched
  quotes, category selection and hyphenation integration are also tested.
- Audit behavior scenarios for each implemented entry. A declaration alone does
  not establish positive, negative, settings and interaction coverage.
- CR/LF preparation is now implemented through bundled spacing; see the completed
  line-ending preparation record below. It is separate from the 107 public rules.
- Verify the completed feature in a browser runtime. Node smoke checks do not
  establish browser runtime behavior. The benchmark matrix has been refreshed
  after quotation completion; see the benchmark acceptance record below.

Supplemental unary-minus normalization and algorithmic soft hyphenation are outside
the 107-entry inventory and remain part of final acceptance. No numeric, lexical
or HTML conversion is authorized by these gaps.

## Completed quotation benchmark verification — 2026-10-08

The [refreshed benchmark report](../benchmarks/README.md) measures all bundled
handlers, including TP-R056, at `72bd385fdf343503ad968014eaa04c734dfa05d8`.
All 24 configurations and 144 workload pairs passed the harness preservation,
determinism and uncached-equivalence assertions. Inputs are identical to the
earlier run. This closes the benchmark-refresh gap, not the remaining behavior,
CR/LF or browser verification gaps.

### Numeric-range dash behavior audit

Reviewed TP-R036, TP-R040, TP-R049 and TP-R051 against the bundled dash
handlers and their isolated tests. Year ranges cover ascending versus equal or
reversed values, unchanged leading zeros, identifier boundaries and supplied
abbreviation punctuation. Time ranges cover minute limits, reference whitespace
boundaries and identifier suffix protection. Decade ranges cover supported digit
lengths, terminal zeroes, supplied case and year-label spelling. Day–month ranges
cover supported month names, reference digit boundaries and unchanged numeric
notation. All four rules test each accepted separator, invalid and unknown
settings, Russian-only registration, protected content and disabled categories.

Eight new pipeline scenarios combine these four rules with ordinary spacing and
hyphenation across both locales, both algorithms and zero/64 MiB cache budgets.
Expected output uses the hyphenation-only profile on explicitly normalized text.
The fixtures preserve dates, phone digits, currency labels, decimal and fraction
notation, case, mixed scripts, combining marks, URLs, emails, identifiers and a
protected range literal. They check repeated formatting, disabling dashes and
all-disabled formatting. Nonbreaking-spacing normalization is disabled in these
scenarios; the separately documented day–month second-pass interaction with that
category remains unchanged.

All 118 tests in the five affected test files passed on Node v24.21.0. No new
upstream comparison was run; existing isolated fixtures remain the reference
behavior evidence. This closes the four numeric-range dash behavior audits;
nonbreaking-spacing audits, CR/LF preparation and browser verification remain open.

### Common nonbreaking spacing behavior audit

Reviewed TP-R076, TP-R078 and TP-R083–TP-R085 against
`bundled-nonbreaking-spacing.factory.ts` and their isolated tests. NBSP
normalization changes only U+00A0 and precedes ordinary whitespace cleanup and
rebinding. Resolution-unit fixtures cover lowercase `dpi`/`lpi`, unchanged case,
digit notation and unsupported boundaries. Its isolated first-match traversal is
tested separately from the combined pipeline; normalization can remove an earlier
NBSP before that match is chosen again on a later call.

Section-mark fixtures cover digit and uppercase Roman-letter boundaries, optional
ordinary/NBSP/thin spacing and Russian narrow-NBSP versus English NBSP output.
Paragraph-mark fixtures cover digit boundaries and preserve unsupported separators.
Number-to-word fixtures cover one to five digits, locale alphabets and unchanged
signed, decimal, fraction, date and identifier boundaries. These five rules have
no configurable values; each rejects unknown settings. Tests also cover category
selection, protected content and consumer locales without implicit bundled rules.

Eight new service scenarios combine these capabilities with ordinary spacing and
hyphenation across both locales, both algorithms and zero/64 MiB cache budgets.
Expected output uses the hyphenation-only profile on explicitly normalized text.
The fixtures preserve numeric notation, case, repeated words, mixed scripts,
combining marks, URLs, emails and a protected literal containing NBSP, marks,
resolution units and numbers. They check repeated formatting, disabling
nonbreaking spacing and all-disabled formatting.

All 191 tests in the five affected test files, package type checking, targeted
ESLint and formatting passed on Node v24.21.0. No new upstream comparison was
run; existing isolated fixtures and documented default deviations remain the
reference evidence. Other nonbreaking-spacing audits, CR/LF preparation and
browser verification remain open.

### Short-word nonbreaking spacing behavior audit

Reviewed TP-R079–TP-R082 against the bundled handlers and adjacent isolated
fixtures. Sentence-final words cover locale alphabets, case, punctuation and
uppercase sentence continuations; LF is deliberately not a continuation boundary.
Terminal numbers cover digit limits, suffix punctuation, line endings and unchanged
numeric notation. Listed-word and length-based rules cover their supported opening
boundaries, adjacent words, locale alphabets and unsupported whitespace. The three
length settings accept positive safe integers and reject invalid values; all four
rules reject unknown settings. Existing tests cover category selection, protection,
consumer locales and reference traversal.

Eight new pipeline scenarios combine all four rules with ordinary spacing and
hyphenation across both locales, both algorithms and zero/64 MiB cache budgets.
Expected output uses the hyphenation-only profile on explicitly normalized text.
They preserve numeric notation, case, repeated words, mixed scripts, combining
marks, URLs, emails and a protected literal. They check disabled nonbreaking
spacing, all-disabled formatting and repeated calls. Russian `если` receives a
soft hyphen on the first call, preventing its listed-word match after NBSP
normalization on the second call; its following space becomes ordinary. The third
call is stable. The inventory now documents this interaction rather than promising
pipeline idempotence.

All 173 tests in the five affected files passed on Node v24.21.0. No new upstream
comparison was run; existing isolated comparisons remain the reference evidence.
Other nonbreaking-spacing audits, CR/LF preparation and browser verification
remain open.

### Russian label nonbreaking spacing behavior audit

Reviewed TP-R065–TP-R069 against the bundled handlers and their isolated tests.
Ruble/kopek fixtures preserve currency labels, digit sequences, decimal and fraction
notation; unsupported case and whitespace remain unchanged. Postscript fixtures
preserve supplied letters, case, periods and colons, including Cyrillic forms.
Page-reference fixtures cover supported abbreviations, digit boundaries and the
reference's non-overlapping traversal. Organization fixtures cover uppercase
abbreviations, alphabet boundaries and adjacent matches. Large-number-label
fixtures preserve supplied case, decimal/fraction notation and label punctuation.
All five rules reject unknown settings and have no configurable values. Existing
fixtures cover Russian-only registration, disabled categories and protected content.

Eight new pipeline scenarios combine these five rules with ordinary spacing and
hyphenation across both locales, both algorithms and zero/64 MiB cache budgets.
Expected output uses the hyphenation-only profile on explicitly normalized text.
They preserve numeric notation, case, repeated words, mixed scripts, combining
marks, URLs, emails and a protected literal containing all five label forms.
They check repeated formatting, disabled nonbreaking spacing and all-disabled
formatting. English receives ordinary whitespace cleanup without Russian label
binding.

All 139 tests in the six affected test files passed on Node v24.21.0. No new
upstream comparison was run; existing isolated comparisons and documented
adaptations remain the reference evidence. Remaining nonbreaking-spacing audits,
CR/LF preparation and browser verification remain open.

### Russian name and date nonbreaking spacing behavior audit

Reviewed TP-R070–TP-R072 against the bundled handlers and their isolated tests.
Initials fixtures cover Cyrillic case, surname boundaries, nested punctuation,
existing nonbreaking spaces, combining marks and unsupported Latin initials.
Day–month fixtures cover all supported month prefixes, supplied case and the
reference's substring matching within decimal, fraction and longer-number forms.
Century fixtures cover Roman numeral boundaries and preserve supplied abbreviation
periods and interior spaces instead of applying the excluded reference conversions.
All three rules reject unknown settings and supply no implicit English or consumer
locale behavior. Existing fixtures cover disabled categories and protected content.

Eight new pipeline scenarios combine these rules with ordinary spacing and
hyphenation across both locales, both algorithms and zero/64 MiB cache budgets.
Expected outputs apply the hyphenation-only profile to explicitly normalized text.
The Russian abbreviation rule also binds the interior space in `в. в.`; English's
common sentence-final short-word rule binds `XV в.` despite lacking the Russian
century handler. The tests cover these interactions, repeated formatting, disabled
nonbreaking spacing, all-disabled formatting, protected literals, URLs and emails.
They preserve digit notation, letter case, repeated words, mixed scripts, combining
marks and supplementary Unicode characters.

All 146 tests in the three affected test files passed on Node v24.21.0. No new
upstream comparison was run; existing isolated comparisons and the documented
century adaptation remain the reference evidence. Other nonbreaking-spacing
audits, CR/LF preparation and browser verification remain open.

### Russian single-year and see abbreviation behavior audit

Reviewed TP-R063 and TP-R064 against the bundled handlers and isolated fixtures.
Single-year fixtures cover four-digit boundaries, leading zeros, supplied lowercase
labels, punctuation and unsupported whitespace. See/name abbreviation fixtures
cover supplied case, alphabet and digit boundaries, punctuation, combining marks
and non-overlapping reference traversal. Both rules reject unknown settings;
neither supplies implicit English or consumer-locale behavior. Existing fixtures
cover disabled categories, protected content and whitespace-only composition changes.

Eight new pipeline scenarios combine these rules with ordinary spacing and
hyphenation across both locales, both algorithms and zero/64 MiB cache budgets.
Expected outputs apply the hyphenation-only profile to explicitly normalized text.
The see rule consumes the newline after its first match and skips the immediately
following name abbreviation; the tests retain that traversal. They check repeated
formatting, disabled nonbreaking spacing, all-disabled formatting, protected
literals, URLs and emails. Numeric notation, case, repeated words, mixed scripts,
combining marks and supplementary Unicode characters remain unchanged.

All 149 tests in the three affected test files passed on Node v24.21.0. No new
upstream comparison was run; existing isolated fixtures remain the reference
evidence. Other nonbreaking-spacing audits, CR/LF preparation and browser
verification remain open.

### Russian number-sign, address and abbreviation behavior audit

Reviewed TP-R073–TP-R075 against the bundled handlers and isolated fixtures.
Number-sign spacing covers digits, `п/п`, accepted separators and narrow NBSP
output without rewriting notation. Address fixtures cover supplied case, numeric
notation, supported abbreviations and alphabet boundaries. Abbreviation fixtures
cover lowercase Cyrillic groups, domain-suffix exceptions, date placeholders and
the reference's two-pass traversal. The address adaptation preserves supplied
letters and case; abbreviation formatting changes whitespace only. All three
rules reject unknown settings and are absent from English bundled rules.
Existing fixtures cover disabled categories and protected content.

Eight new pipeline scenarios combine these rules with ordinary spacing and
hyphenation across both locales, both algorithms and zero/64 MiB cache budgets.
Expected outputs apply the hyphenation-only profile to explicitly normalized text.
They check repeated formatting, disabled nonbreaking spacing, all-disabled
formatting, protected literals, URLs and valid email addresses. Numeric notation,
case, repeated words, mixed scripts, combining marks and supplementary Unicode
characters remain unchanged.

All 77 tests in the four affected test files, package type checking, targeted
ESLint and formatting passed on Node v24.21.0. No new upstream comparison was
run; existing isolated fixtures and documented adaptations remain the reference
evidence. Remaining nonbreaking-spacing audits, CR/LF preparation and browser
verification remain open. Workspace-wide checks and builds were not rerun.

### Unit, year-range and particle spacing behavior audit

Reviewed TP-R086–TP-R088 against the bundled handlers and isolated fixtures;
rechecked TP-R078 for their shared pipeline interaction. Year-range fixtures
preserve supplied range glyphs, abbreviation letters and periods. Metric fixtures
cover supported Cyrillic and Latin labels, supplied exponent notation, punctuation
boundaries and non-overlapping traversal. Particle fixtures cover lowercase forms,
Cyrillic boundaries, punctuation, unsupported separators and existing NBSPs.
Resolution spacing retains its first-match traversal; a second pass can bind a
second resolution label, as recorded by its isolated test. All four rules reject
unknown settings. Only resolution spacing is bundled for English; consumer
locales receive none of these rules implicitly.

Eight new pipeline scenarios combine these rules with ordinary spacing and
hyphenation across both locales, both algorithms and zero/64 MiB cache budgets.
Expected outputs apply the hyphenation-only profile to explicitly normalized text.
They cover the abbreviation rule's interior binding in `г.г.`, repeated formatting
for a single resolution label, disabled nonbreaking spacing, all-disabled
formatting, protected literals, URLs and emails. Numeric notation, case, repeated
words, mixed scripts, combining marks and supplementary Unicode characters remain
unchanged.

All 214 tests in the five affected test files, package type checking, targeted
ESLint and formatting passed on Node v24.21.0. No new upstream comparison was
run; existing isolated fixtures and documented adaptations remain the reference
evidence. Remaining acceptance audits, CR/LF preparation and browser verification
remain open. Workspace-wide checks and builds were not rerun.

### Completed reference line-ending preparation

Reviewed Typograf 7.8.0's `removeCR` call before public-rule execution and its LF
output default. Bundled English and Russian now prepare CRLF and lone CR as LF
through `common/space/normalizeLineEndings`, a spacing rule at order 0 with no
settings. This closes the previously recorded CR/LF preparation gap for enabled
bundled spacing. Isolated public-rule handlers still retain their documented
behavior when called without preparation.

Twenty-nine tests cover empty input, mixed CR/LF, repeated line breaks, Unicode
line separators, supplementary characters, combining marks, invalid settings,
disabled spacing and custom-locale absence. Eight pipeline configurations combine
preparation, trimming, indentation removal, trailing-blank cleanup and repeated
newline cleanup with both hyphenation algorithms and zero/64 MiB caches. They
check repeated formatting, protected literals with original CR/LF, numeric
notation, URLs and emails, and equivalent default-profile formatting after
normalization. The hyphenation-only profile preserves the original input except
for soft hyphens.

Ten isolated comparisons with Typograf 7.8.0 passed. The full suite passed 1,768
tests; after the final default-profile assertions, all 29 affected tests, package
type checking, targeted ESLint and formatting passed on Node v24.21.0. Browser
verification and final acceptance review remain open. Workspace-wide type
checking, lint and builds were not rerun for this slice.

NBSP scope correction (2026-10-09): TP-R076 is removed. Historical audits above predate its removal. Existing NBSP preservation replaces normalization acceptance; see `existing-nbsp-preservation.spec.ts`.

### Line-ending preservation correction (2026-10-09)

The bundled CRLF/lone-CR normalization handler and obsolete cleanup tests are
removed. The former `common/space/normalizeLineEndings` setting is invalid.
Public-service regressions cover exact CR/LF sequences with both algorithms,
cache enabled and disabled, protected content and repeated formatting.
Earlier normalization evidence is historical and does not validate the reduced
scope. Remaining bundled spacing removal and default quotation spacing are pending.

TP-R020 final-newline insertion was removed on 2026-10-09. Its earlier audit is
historical; final-newline-preservation.spec.ts verifies the reduced contract.

### Trailing-whitespace preservation correction (2026-10-09)

TP-R014 (`common/space/delTrailingBlanks`) and its settings are removed.
Trailing ordinary spaces, tabs and existing NBSPs remain before line endings.
Earlier cleanup audits and benchmarks predate this correction. Remaining spacing
removal and default quotation spacing are pending. Reference metadata is retained
for provenance; historical handler and ordering rows do not describe this rule
as an active capability.

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

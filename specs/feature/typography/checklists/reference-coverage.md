# Reference coverage audit — 2026-10-08

This audit checks the saved 107-rule inventory against bundled handler declarations.
It is a source coverage check, not proof that every reference fixture or interaction
passes. The inventory remains the source for defaults, settings and deviations.

All 65 included or adapted reference entries have bundled handler declarations.
TP-R034 maps to the existing English prose-dash handler rather than a separate
regional locale. TP-R056 supplies configurable quotation pairs, duplicate removal
and quotation spacing. The 42 excluded entries
remain excluded; default-profile exclusion tests are recorded in the inventory.

## Included and adapted entries

| Trace ID | Reference ID                              | Bundled source                                        |
| -------- | ----------------------------------------- | ----------------------------------------------------- |
| TP-R011  | `common/space/replaceTab`                 | `bundled-spacing.factory.ts`                          |
| TP-R012  | `common/space/trimLeft`                   | `bundled-spacing.factory.ts`                          |
| TP-R013  | `common/space/trimRight`                  | `bundled-spacing.factory.ts`                          |
| TP-R014  | `common/space/delTrailingBlanks`          | `bundled-spacing.factory.ts`                          |
| TP-R015  | `common/space/delRepeatSpace`             | `bundled-spacing.factory.ts`                          |
| TP-R016  | `common/space/delRepeatN`                 | `bundled-spacing.factory.ts`                          |
| TP-R017  | `ru/space/year`                           | `bundled-spacing.factory.ts`                          |
| TP-R018  | `ru/space/afterHellip`                    | `bundled-spacing.factory.ts`                          |
| TP-R019  | `common/space/squareBracket`              | `bundled-spacing.factory.ts`                          |
| TP-R020  | `common/space/insertFinalNewline`         | `bundled-spacing.factory.ts`                          |
| TP-R021  | `common/space/delLeadingBlanks`           | `bundled-spacing.factory.ts`                          |
| TP-R022  | `common/space/delBetweenExclamationMarks` | `bundled-spacing.factory.ts`                          |
| TP-R023  | `common/space/delBeforePunctuation`       | `bundled-spacing.factory.ts`                          |
| TP-R024  | `common/space/delBeforePercent`           | `bundled-spacing.factory.ts`                          |
| TP-R025  | `common/space/delBeforeDot`               | `bundled-spacing.factory.ts`                          |
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
| TP-R076  | `common/nbsp/replaceNbsp`                 | `bundled-nonbreaking-spacing.factory.ts`              |
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

- TP-R056 protected-boundary, apostrophe, spacing and direct-speech interactions
  now have 32 additional service scenarios across both algorithms and cache modes.
  Isolated straight quotes around protected content remain unchanged because
  quotation context is local to each unprotected segment. Configurable pairs,
  duplicate removal, quotation spacing, fixed locale pairs, nesting, unmatched
  quotes, category selection and hyphenation integration are also tested.
- Audit behavior scenarios for each implemented entry. A declaration alone does
  not establish positive, negative, settings and interaction coverage.
- Resolve the documented reference-wide CR/LF preparation gap. Upstream normalizes
  CR/LF before rules run; current handlers preserve interior CR. This preparation
  is separate from the 107 public reference rules.
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

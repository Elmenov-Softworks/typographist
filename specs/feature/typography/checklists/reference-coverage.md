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
- Verify the completed feature in a browser runtime and refresh benchmarks after
  the remaining handlers are implemented. Existing Node smoke checks and benchmark
  results cover the earlier implementation.

Supplemental unary-minus normalization and algorithmic soft hyphenation are outside
the 107-entry inventory and remain part of final acceptance. No numeric, lexical
or HTML conversion is authorized by these gaps.

# Reference coverage

The bundle retains 38 reference entries (34 included, four adapted), removes 27,
and excludes 42. All 107 IDs remain in the [inventory](../typograf-rule-inventory.md).
The removed spacing, punctuation cleanup and NBSP reconstruction handlers have no
production implementations. The supplemental unary-minus handler is retained.

This table checks source coverage, not exhaustive behavior equivalence with Typograf.
Historical browser, comparison and benchmark records predate the final reduced scope.
Current verification is recorded in [requirements.md](requirements.md).

## Retained and removed reference entries

| Trace ID | Reference ID                              | Bundled source                                        |
| -------- | ----------------------------------------- | ----------------------------------------------------- |
| TP-R011  | `common/space/replaceTab`                 | Removed on 2026-10-09; tabs preserved                 |
| TP-R012  | `common/space/trimLeft`                   | Removed on 2026-10-09; outer whitespace retained      |
| TP-R013  | `common/space/trimRight`                  | Removed on 2026-10-09; outer whitespace retained      |
| TP-R014  | `common/space/delTrailingBlanks`          | Removed by owner correction (2026-10-09)              |
| TP-R015  | `common/space/delRepeatSpace`             | Removed by owner correction (2026-10-09)              |
| TP-R016  | `common/space/delRepeatN`                 | Removed (2026-10-09)                                  |
| TP-R017  | `ru/space/year`                           | Removed by owner correction                           |
| TP-R018  | `ru/space/afterHellip`                    | Removed by owner correction                           |
| TP-R019  | `common/space/squareBracket`              | Removed: owner correction                             |
| TP-R020  | `common/space/insertFinalNewline`         | Removed by owner correction (2026-10-09)              |
| TP-R021  | `common/space/delLeadingBlanks`           | Removed by owner scope correction                     |
| TP-R022  | `common/space/delBetweenExclamationMarks` | Removed: owner correction                             |
| TP-R023  | `common/space/delBeforePunctuation`       | Removed by owner correction (2026-10-09)              |
| TP-R024  | `common/space/delBeforePercent`           | Removed by owner scope correction                     |
| TP-R025  | `common/space/delBeforeDot`               | Removed: owner correction                             |
| TP-R026  | `common/space/bracket`                    | Removed by owner correction; preservation regressions |
| TP-R027  | `common/space/beforeBracket`              | Removed by owner correction; preservation regressions |
| TP-R028  | `common/space/afterSemicolon`             | Removed by owner correction; preservation regressions |
| TP-R029  | `common/space/afterExclamationMark`       | Removed by owner correction (2026-10-09)              |
| TP-R030  | `common/space/afterQuestionMark`          | Removed by owner correction (2026-10-09)              |
| TP-R031  | `common/space/afterComma`                 | Removed by owner correction                           |
| TP-R032  | `common/space/afterColon`                 | Removed by owner correction (2026-10-09)              |
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

# Complete bundled ordering audit

Owner correction — 2026-10-09: punctuation formatting retains apostrophe and ellipsis
glyph conversion only. TP-R053, TP-R054, TP-R058 and TP-R060 are removed from
the bundle; repeated signs and their order remain as supplied. Earlier audit,
benchmark and acceptance evidence predates this reduced scope. Other owner
scope corrections remain pending implementation in subsequent slices.

Audited the final assembled English and Russian collections against the public
rule table in the pinned Typograf 7.8.0 inventory. This audit includes every
bundled entry, across factory boundaries. The executable audit reads the inventory
and checks every assembled priority group for both locales; it also rejects
unrecorded bundled IDs.

The original audit covered 66 IDs before the owner scope reduction. Locale
applicability filters the union; `en` uses `en-US/dash/main`, as documented.
The excluded `en-GB/dash/main` alternative is not an additional English rule.
Unary minus remains the non-inventory extension at priority 300. Line-ending
normalization and NBSP replacement are removed. Final-newline insertion remains
at priority 1300 pending removal of the rest of the bundled spacing factory.
The table below reflects removal of line-ending normalization; other historical
scope corrections are recorded above.

| Effective priority | Complete assembled union in execution order                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 207                | `common/space/delTrailingBlanks`                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 209                | `common/space/delRepeatSpace`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 210                | `ru/space/year`, `ru/space/afterHellip`, `common/space/squareBracket`, `common/space/delLeadingBlanks`, `common/space/delBetweenExclamationMarks`, `common/space/delBeforePunctuation`, `common/space/delBeforePercent`, `common/space/delBeforeDot`, `common/space/bracket`, `common/space/beforeBracket`, `common/space/afterSemicolon`, `common/space/afterExclamationMark`, `common/space/afterQuestionMark`, `common/space/afterComma`, `common/space/afterColon`                            |
| 300                | `common/dash/minus`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 305                | `ru/dash/main`, `en-US/dash/main`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 310                | `ru/dash/years`, `ru/dash/weekday`, `ru/dash/time`, `ru/dash/month`, `ru/dash/directSpeech`, `ru/dash/decade`, `ru/dash/daysMonth`, `ru/dash/centuries`                                                                                                                                                                                                                                                                                                                                           |
| 410                | `ru/punctuation/hellipQuestion`, `ru/punctuation/exclamation`, `common/punctuation/quote`, `common/punctuation/hellip`, `common/punctuation/delDoublePunctuation`, `common/punctuation/apostrophe`                                                                                                                                                                                                                                                                                                |
| 415                | `ru/punctuation/exclamationQuestion`                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 510                | `ru/nbsp/year`, `ru/nbsp/see`, `ru/nbsp/rubleKopek`, `ru/nbsp/ps`, `ru/nbsp/page`, `ru/nbsp/ooo`, `ru/nbsp/mln`, `ru/nbsp/initials`, `ru/nbsp/dayMonth`, `ru/nbsp/centuries`, `ru/nbsp/afterNumberSign`, `ru/nbsp/addr`, `ru/nbsp/abbr`, `common/nbsp/dpi`, `common/nbsp/beforeShortLastWord`, `common/nbsp/beforeShortLastNumber`, `common/nbsp/afterShortWordByList`, `common/nbsp/afterShortWord`, `common/nbsp/afterSectionMark`, `common/nbsp/afterParagraphMark`, `common/nbsp/afterNumber` |
| 515                | `ru/nbsp/years`, `ru/nbsp/m`, `ru/nbsp/beforeParticle`                                                                                                                                                                                                                                                                                                                                                                                                                                            |

The priority-410 group spans punctuation and quotation factories. Quotation
placement now precedes ellipsis conversion, duplicate punctuation removal, and
apostrophe conversion. No other reference priority group spans factories. The
priority-0 preparation group spans spacing and nonbreaking spacing and keeps
its existing line-ending-before-NBSP order.

Public-service regressions cover the owner fixture (`"""word"""` with outer
quotation settings `...`, yielding `…word…`) in both locales, duplicate
punctuation created by quotation settings, and consumer registration order at
priority 410. Consumer rules remain appended in supplied order; the generic
pipeline still uses stable priority sorting. No consumer IDs receive reference
ranks. Existing interaction suites cover the remaining priority groups.

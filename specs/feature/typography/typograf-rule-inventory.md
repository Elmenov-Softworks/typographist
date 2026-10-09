# Typograf reference rule inventory

Reference: npm `typograf@7.8.0`, full `typograf.all.js` build. All 107 public rules remain listed for traceability. The owner narrowed implementation to symbolic typography without content conversion. Upstream enabled defaults are reference facts, not automatic requirements.

Owner correction — 2026-10-09: the current bundle retains 38 reference entries
(34 included and four adapted), removes 27 formerly included entries, and keeps
42 excluded entries. All 107 reference IDs remain recorded. The 27 removals are
TP-R011–TP-R032, TP-R053, TP-R054, TP-R058, TP-R060 and TP-R076.
The supplemental line-ending normalization capability is also removed: together
with TP-R011–TP-R032, this removes all 23 bundled spacing capabilities and their
factory. Removed settings are rejected rather than ignored.

Defaults select quotes, dashes, punctuation, nonbreaking spacing and hyphenation.
Consumer `spacing` rules remain explicitly selectable. Existing whitespace,
NBSPs and repeated signs are preserved except for retained symbolic glyph changes
and prescribed nonbreaking bindings. Quote multiplicity is preserved; duplicate
quote deletion and its setting are removed. Russian and English quote-boundary
spacing defaults to narrow NBSP with an explicit `spacing: false` override.
Declarative hyphenation data requires both standard and fast datasets;
subclass compilation and typography-only locales remain supported.

Short-word and listed-word bindings (TP-R081–TP-R082), organization labels
(TP-R068), and microdistrict/liter address labels (TP-R074) require following
same-line content. They replace only the first ordinary boundary space and retain
additional spaces. Trailing spaces, tabs and CR/LF remain unchanged. This target
requirement intentionally differs from the reference's trailing-space matching.

Earlier audit sections and their passing reference comparisons are historical.
They describe the implementation at the time of each slice, including subsequently
removed behavior. Earlier benchmark timings and owner-reported browser evidence
predate the scope reduction and do not validate the corrected implementation.
The table records the final approved scope; implementation history is available in Git.

## Scope summary

- Retained: symbolic glyphs and nonbreaking bindings: 34 rules.
- Adapted: nonbreaking bindings preserving supplied notation: four rules.
- Removed by the owner preservation correction: 27 rules.
- Excluded from the original scope: 42 rules, including all 13 HTML rules.

The four adapted rules may supply nonbreaking-spacing behavior only. Do not copy their letter, case, abbreviation, or unit rewriting. Numeric range separators may become dashes without changing the surrounding digits; minus signs may be normalized without changing a number's value or notation. Number grouping, decimal separators, fractions, currencies, dates and phone-number formatting are excluded.

Lexical hyphenation rules that join or correct words are excluded. Existing algorithmic soft hyphenation remains included as a separate rule capability. A minus-sign formatting capability is required by the owner even though it is not a standalone rule in this reference catalogue.

## Public rules

| Trace ID | Source ID | Reference description | Disposition | Reference default | Queue / index | Settings |
| -------- | ----------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------- | --------------------------- | See reference metadata |
| TP-R001 | `common/other/delBOM` | Delete character BOM (Byte Order Mark) | Excluded: content or numeric conversion | On | `start` / -1 | `{}` |
| TP-R002 | `ru/symbols/NN` | №№ → № | Excluded: symbolic abbreviation, unit or notation conversion | On | `default` / 110 | `{}` |
| TP-R003 | `common/symbols/copy` | (c) → ©, (tm) → ™, (r) → ® | Excluded: symbolic abbreviation, unit or notation conversion | On | `default` / 110 | `{}` |
| TP-R004 | `common/symbols/cf` | Adding ° to C and F | Excluded: symbolic abbreviation, unit or notation conversion | On | `default` / 110 | `{}` |
| TP-R005 | `common/symbols/arrow` | -> → →, <- → ← | Excluded: symbolic abbreviation, unit or notation conversion | On | `default` / 110 | `{}` |
| TP-R006 | `ru/number/ordinals` | N-ый, -ой, -ая, -ое, -ые, -ым, -ом, -ых → N-й, -я, -е, -м, -х (25-й) | Excluded: content or numeric conversion | On | `default` / 150 | `{}` |
| TP-R007 | `ru/number/comma` | Commas in numbers | Excluded: content or numeric conversion | On | `default` / 150 | `{}` |
| TP-R008 | `common/number/times` | x → × (10 x 5 → 10×5) | Excluded: content or numeric conversion | On | `default` / 150 | `{}` |
| TP-R009 | `common/number/mathSigns` | != → ≠, <= → ≤, >= → ≥, ~= → ≅, +- → ± | Excluded: content or numeric conversion | On | `default` / 150 | `{}` |
| TP-R010 | `common/number/fraction` | 1/2 → ½, 1/4 → ¼, 3/4 → ¾ | Excluded: content or numeric conversion | On | `default` / 150 | `{}` |
| TP-R011 | `common/space/replaceTab` | Replacement of tab to 4 spaces | Removed: owner scope correction | Removed | `default` / 205 | `{}` |
| TP-R012 | `common/space/trimLeft` | Remove spaces and line breaks in beginning of text | Removed: owner scope correction | Removed | `default` / 206 | `{}` |
| TP-R013 | `common/space/trimRight` | Remove spaces and line breaks at end of text | Removed: owner scope correction | Removed | `default` / 207 | `{}` |
| TP-R014 | `common/space/delTrailingBlanks` | Remove spaces at end of line | Removed: owner preservation correction | On | `default` / 207 | `{}` |
| TP-R015 | `common/space/delRepeatSpace` | Removing duplicate spaces between characters | Removed: owner scope correction | Removed | `default` / 209 | `{}` |
| TP-R016 | `common/space/delRepeatN` | Remove duplicate line breaks | Removed: owner scope correction (2026-10-09) | On | `default` / 209 | `{"maxConsecutiveLineBreaks": 2}` |
| TP-R017 | `ru/space/year` | Space between number and word “год” | Removed: owner scope correction | Removed | `default` / 210 | `{}` |
| TP-R018 | `ru/space/afterHellip` | Space after “...”, “!..” and “?..” | Removed: owner scope correction | Removed | `default` / 210 | `{}` |
| TP-R019 | `common/space/squareBracket` | Remove extra spaces after opening and before closing square bracket | Removed: owner correction | Removed | `default` / 210 | `{}` |
| TP-R020 | `common/space/insertFinalNewline` | Insert final newline | Removed: owner preservation correction | Off | `end` / 210 | `{}` |
| TP-R021 | `common/space/delLeadingBlanks` | Remove spaces at start of line | Removed: owner scope correction | Removed | `default` / 210 | `{}` |
| TP-R022 | `common/space/delBetweenExclamationMarks` | Remove spaces before exclamation marks | Removed: owner correction | Removed | `default` / 210 | `{}` |
| TP-R023 | `common/space/delBeforePunctuation` | Remove spaces before punctuation | Removed: owner scope correction | Removed | `default` / 210 | `{}` |
| TP-R024 | `common/space/delBeforePercent` | Remove space before %, ‰ and ‱ | Removed: owner scope correction | Removed | `default` / 210 | `{}` |
| TP-R025 | `common/space/delBeforeDot` | Remove space before dot | Removed: owner scope correction | Removed | `default` / 210 | `{}` |
| TP-R026 | `common/space/bracket` | Remove extra spaces after opening and before closing bracket | Removed by owner correction; preserve boundary whitespace | Removed | `default` / 210 | `{}` |
| TP-R027 | `common/space/beforeBracket` | Space before opening bracket | Removed by owner correction; preserve boundary gap | Removed | `default` / 210 | `{}` |
| TP-R028 | `common/space/afterSemicolon` | space after semicolon | Removed: owner correction preserves supplied gaps | Removed | `default` / 210 | `{}` |
| TP-R029 | `common/space/afterExclamationMark` | space after exclamation mark | Removed: owner scope correction (2026-10-09) | Removed | `default` / 210 | `{}` |
| TP-R030 | `common/space/afterQuestionMark` | space after question mark | Removed: owner scope correction (2026-10-09) | Removed | `default` / 210 | `{}` |
| TP-R031 | `common/space/afterComma` | space after comma | Removed: owner scope correction | Removed | `default` / 210 | `{}` |
| TP-R032 | `common/space/afterColon` | space after colon | Removed: owner scope correction | Removed | `default` / 210 | `{}` |
| TP-R033 | `ru/dash/main` | Replacement hyphen with dash | Include: punctuation / whitespace | On | `default` / 305 | `{}` |
| TP-R034 | `en-GB/dash/main` | Replace hyphens surrounded by spaces with an em-dash | Include: punctuation / whitespace | On | `default` / 305 | `{}` |
| TP-R035 | `en-US/dash/main` | Replace hyphens surrounded by spaces with an em-dash | Include: punctuation / whitespace | On | `default` / 305 | `{}` |
| TP-R036 | `ru/dash/years` | Hyphen to dash in years | Include: punctuation / whitespace | On | `default` / 310 | `{"dash": "\u2013"}` |
| TP-R037 | `ru/dash/weekday` | Dash between the days of the week | Include: punctuation / whitespace | On | `default` / 310 | `{"dash": "\u2013"}` |
| TP-R038 | `ru/dash/kakto` | Hyphen for “как то” | Excluded: word spelling / joining | On | `default` / 310 | `{}` |
| TP-R039 | `ru/dash/to` | Hyphen before “то”, “либо”, “нибудь” | Excluded: word spelling / joining | On | `default` / 310 | `{}` |
| TP-R040 | `ru/dash/time` | Dash in time intervals | Include: punctuation / whitespace | On | `default` / 310 | `{"dash": "\u2013"}` |
| TP-R041 | `ru/dash/taki` | Hyphen between “верно-таки” and etc. | Excluded: word spelling / joining | On | `default` / 310 | `{}` |
| TP-R042 | `ru/dash/surname` | Acronyms with a dash | Excluded: word spelling / joining | On | `default` / 310 | `{}` |
| TP-R043 | `ru/dash/month` | Dash between months | Include: punctuation / whitespace | On | `default` / 310 | `{"dash": "\u2013"}` |
| TP-R044 | `ru/dash/koe` | Hyphen after “кое” and “кой” | Excluded: word spelling / joining | On | `default` / 310 | `{}` |
| TP-R045 | `ru/dash/ka` | Hyphen before “ка” and “кась” | Excluded: word spelling / joining | On | `default` / 310 | `{}` |
| TP-R046 | `ru/dash/izza` | Hyphen between “из-за” | Excluded: word spelling / joining | On | `default` / 310 | `{}` |
| TP-R047 | `ru/dash/izpod` | Hyphen between “из-под” | Excluded: word spelling / joining | On | `default` / 310 | `{}` |
| TP-R048 | `ru/dash/directSpeech` | Dash in direct speech | Include: punctuation / whitespace | On | `default` / 310 | `{}` |
| TP-R049 | `ru/dash/decade` | Dash in decade | Include: punctuation / whitespace | On | `default` / 310 | `{"dash": "\u2013"}` |
| TP-R050 | `ru/dash/de` | Hyphen before “де” | Excluded: word spelling / joining | Off | `default` / 310 | `{}` |
| TP-R051 | `ru/dash/daysMonth` | Dash between days of one month | Include: punctuation / whitespace | On | `default` / 310 | `{"dash": "\u2013"}` |
| TP-R052 | `ru/dash/centuries` | Hyphen to dash in centuries | Include: punctuation / whitespace | On | `default` / 310 | `{"dash": "\u2013"}` |
| TP-R053 | `ru/punctuation/hellipQuestion` | «?…» → «?..», «!…» → «!..», «…,» → «…» | Removed: owner scope correction (2026-10-09) | Not bundled | `default` / 410 | `{}` |
| TP-R054 | `ru/punctuation/exclamation` | !! → ! | Removed: owner scope correction (2026-10-09) | Not bundled | `default` / 410 | `{}` |
| TP-R055 | `ru/punctuation/ano` | Placement of commas before “а” and “но” | Excluded: infer missing grammatical punctuation | On | `default` / 410 | `{}` |
| TP-R056 | `common/punctuation/quote` | Placement of quotation marks in texts | Include: punctuation / whitespace | On | `default` / 410 | See reference metadata |
| TP-R057 | `common/punctuation/hellip` | Replacement of three points by ellipsis | Include: punctuation / whitespace | On | `default` / 410 | `{}` |
| TP-R058 | `common/punctuation/delDoublePunctuation` | Removing double punctuation | Removed: owner scope correction (2026-10-09) | Not bundled | `default` / 410 | `{}` |
| TP-R059 | `common/punctuation/apostrophe` | Placement of correct apostrophe | Include: punctuation / whitespace | On | `default` / 410 | `{}` |
| TP-R060 | `ru/punctuation/exclamationQuestion` | !? → ?! | Removed: owner scope correction (2026-10-09) | Not bundled | `default` / 415 | `{}` |
| TP-R061 | `common/punctuation/quoteLink` | Removal quotes outside a link | Excluded: HTML / optical alignment | On | `show-safe-tags-html` / 415 | `{}` |
| TP-R062 | `common/number/digitGrouping` | Divide into groups numbers with many digits | Excluded: content or numeric conversion | Off | `default` / 460 | `{"space": "\u202f"}` |
| TP-R063 | `ru/nbsp/year` | Non-breaking space before XXXX г. (2012 г.) | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R064 | `ru/nbsp/see` | Non-breaking space after abbreviation «см.» and «им.» | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R065 | `ru/nbsp/rubleKopek` | Not once. space before the “rub” and “cop.” | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R066 | `ru/nbsp/ps` | Non-breaking space in P. S. and P. P. S. | Adapt: spacing only; preserve letters, digits, case and abbreviation spelling | On | `default` / 510 | `{}` |
| TP-R067 | `ru/nbsp/page` | Non-breaking space after “стр.”, “гл.”, “рис.”, “илл.” | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R068 | `ru/nbsp/ooo` | Non-breaking space after “OOO, ОАО, ЗАО, НИИ, ПБОЮЛ” | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R069 | `ru/nbsp/mln` | Non-breaking space between number and “тыс.”, “млн”, “млрд” and “трлн” | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R070 | `ru/nbsp/initials` | Binding of initials to the name | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R071 | `ru/nbsp/dayMonth` | Non-breaking space between number and month | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R072 | `ru/nbsp/centuries` | Remove spaces and extra points in “вв.” | Adapt: spacing only; preserve letters, digits, case and abbreviation spelling | On | `default` / 510 | `{}` |
| TP-R073 | `ru/nbsp/afterNumberSign` | Non-breaking thin space after № | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R074 | `ru/nbsp/addr` | Placement of non-breaking space after “г.”, “обл.”, “ул.”, “пр.”, “кв.” et al. | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R075 | `ru/nbsp/abbr` | Non-breaking space in abbreviations, e.g. “т. д.” | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R076 | `common/nbsp/replaceNbsp` | Replacing non-breaking space on normal before text correction | Removed: owner scope correction (2026-10-09) | Off | `utf` / 510 | `{}` |
| TP-R077 | `common/nbsp/nowrap` | Replace non-breaking space to normal space in tags nowrap and nobr | Excluded: HTML / optical alignment | On | `end` / 510 | `{}` |
| TP-R078 | `common/nbsp/dpi` | Non-breaking space before lpi and dpi | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R079 | `common/nbsp/beforeShortLastWord` | Non-breaking space before last short word in sentence | Include: punctuation / whitespace | On | `default` / 510 | `{"lengthLastWord": 3}` |
| TP-R080 | `common/nbsp/beforeShortLastNumber` | Non-breaking space before number (maximum 2 digits) at end of sentence | Include: punctuation / whitespace | On | `default` / 510 | `{"lengthLastNumber": 2}` |
| TP-R081 | `common/nbsp/afterShortWordByList` | Non-breaking space after conjunctions, articles and prepositions | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R082 | `common/nbsp/afterShortWord` | Non-breaking space after short word | Include: punctuation / whitespace | On | `default` / 510 | `{"lengthShortWord": 2}` |
| TP-R083 | `common/nbsp/afterSectionMark` | Non-breaking space after § | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R084 | `common/nbsp/afterParagraphMark` | Non-breaking space after ¶ | Include: punctuation / whitespace | On | `default` / 510 | `{}` |
| TP-R085 | `common/nbsp/afterNumber` | Non-breaking space between number and word | Include: punctuation / whitespace | Off | `default` / 510 | `{}` |
| TP-R086 | `ru/nbsp/years` | г.г. → гг. and non-breaking space | Adapt: spacing only; preserve letters, digits, case and abbreviation spelling | On | `default` / 515 | `{}` |
| TP-R087 | `ru/nbsp/m` | m2 → м², m3 → м³ and non-breaking space | Adapt: spacing only; preserve letters, digits, case and abbreviation spelling | On | `default` / 515 | `{}` |
| TP-R088 | `ru/nbsp/beforeParticle` | Non-breaking space before “ли”, “ль”, “же”, “бы”, “б” | Include: punctuation / whitespace | On | `default` / 515 | `{}` |
| TP-R089 | `ru/money/ruble` | 1 руб. → 1 ₽ | Excluded: content or numeric conversion | Off | `default` / 710 | `{}` |
| TP-R090 | `ru/money/currency` | Currency symbol ($, €, ¥, Ұ, £ and ₤) after the number, $100 → 100 $ | Excluded: content or numeric conversion | Off | `default` / 710 | `{}` |
| TP-R091 | `ru/date/weekday` | 2 Мая, Понедельник → 2 мая, понедельник | Excluded: content or numeric conversion | On | `default` / 810 | `{}` |
| TP-R092 | `ru/date/fromISO` | Converting dates YYYY-MM-DD type DD.MM.YYYY | Excluded: content or numeric conversion | On | `default` / 810 | `{}` |
| TP-R093 | `ru/other/phone-number` | Formatting phone numbers | Excluded: content or numeric conversion | On | `default` / 910 | `{}` |
| TP-R094 | `ru/other/accent` | Replacement capital letters to lowercase with addition of accent | Excluded: content or numeric conversion | Off | `default` / 910 | `{}` |
| TP-R095 | `common/other/repeatWord` | Removing repeat words | Excluded: content or numeric conversion | Off | `default` / 910 | `{"min": 2}` |
| TP-R096 | `ru/optalign/quote` | for opening quotation marks | Excluded: HTML / optical alignment | Off | `default` / 1010 | `{}` |
| TP-R097 | `ru/optalign/comma` | for comma | Excluded: HTML / optical alignment | Off | `default` / 1010 | `{}` |
| TP-R098 | `ru/optalign/bracket` | for opening bracket | Excluded: HTML / optical alignment | Off | `default` / 1010 | `{}` |
| TP-R099 | `ru/typo/switchingKeyboardLayout` | Replacement of Latin letters in Russian. Typos occur when you switch keyboard layouts | Excluded: content or numeric conversion | On | `default` / 1110 | `{}` |
| TP-R100 | `common/html/url` | Placement of links | Excluded: HTML / optical alignment | Off | `end` / 1210 | `{}` |
| TP-R101 | `common/html/quot` | &⁠quot; → " | Excluded: HTML / optical alignment | On | `hide-safe-tags` / 1210 | `{}` |
| TP-R102 | `common/html/processingAttrs` | Processing HTML attributes | Excluded: HTML / optical alignment | Off | `hide-safe-tags-own` / 1210 | `{"attrs": ["title", "placeholder"]}` |
| TP-R103 | `common/html/e-mail` | Placement of links for e-mail | Excluded: HTML / optical alignment | Off | `end` / 1210 | `{}` |
| TP-R104 | `common/html/p` | Placement of paragraph | Excluded: HTML / optical alignment | Off | `end` / 1215 | `{}` |
| TP-R105 | `common/html/nbr` | Replacement line break on <br/> | Excluded: HTML / optical alignment | Off | `end` / 1220 | `{}` |
| TP-R106 | `common/html/stripTags` | Removing HTML-tags | Excluded: HTML / optical alignment | Off | `end` / 1309 | `{}` |
| TP-R107 | `common/html/escape` | Escaping HTML | Excluded: HTML / optical alignment | Off | `end` / 1310 | `{}` |

## Bundled locale coverage

Ship Russian and English only. The upstream datasets include `en-US` and `en-GB`; preserve the existing `en` API and document its selected conventions. Other locales can be supplied through the universal public contracts without core edits. No additional built-in locales are required.

## Internal handlers

All six upstream internal handlers belong to excluded markup-based optical alignment:

- `ru/optalign/bracket` — `start`.
- `ru/optalign/bracket` — `end`.
- `ru/optalign/comma` — `start`.
- `ru/optalign/comma` — `end`.
- `ru/optalign/quote` — `start`.
- `ru/optalign/quote` — `end`.

## Verification obligation

Every included rule needs triggering and non-triggering scenarios, applicable settings, protection checks, and relevant interactions. Adapted rules need explicit tests that preserve all letters, digits, case and abbreviation spelling. Excluded conversions must remain inactive even when all supported categories are enabled.

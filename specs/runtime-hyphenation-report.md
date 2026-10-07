# Runtime soft hyphenation implementation report

## Delivered API and behavior

The core exports `prepareKnuthLiang`, `createHyphenator`, `ru`, `enUS`, and the algorithm, language, analysis, exception, and policy extension types. Register plugins explicitly and pass a prepared algorithm to the service:

```ts
import { createHyphenator, prepareKnuthLiang, ru, enUS } from '@elmenov-softworks/typographist';

const service = createHyphenator({
  algorithm: prepareKnuthLiang([ru, enUS]),
  defaultLanguage: 'ru',
});
service.hyphenate('асбест'); // ас\u00ADбест
service.hyphenate('table', { language: 'en-US' }); // ta\u00ADble
```

The service handles language routing, exclusions, exceptions, grapheme limits, offset validation, and insertion. Algorithms supply word boundaries without tokenizing or inserting characters. Custom languages and algorithms use the same open contracts. Configuration and data are snapshotted; caller callbacks retain ownership of their closure state. There is no word cache or shared mutable working buffer, including during reentrant callbacks.

Language identifiers are case-insensitive without regional fallback. User exceptions override source exceptions, including explicit no-break entries. Existing soft hyphens preserve their entire component. Visible hyphens separate components; non-breaking-hyphen compounds remain intact. Unsupported marks, apostrophes, mixed alphabets, and malformed UTF-16 remain unchanged as complete tokens. NFC matching maps insertions back to original grapheme boundaries without replacing original characters.

Default exclusions cover numeric tokens, underscore and camel-case identifiers, supported URLs, and ASCII dot-atom email addresses with dotted hostnames. URL spans end at whitespace or quote/angle delimiters and may include trailing punctuation. These recognizers are bounded scanners, not full URI/email parsers. Plain strings are not parsed as HTML or Markdown. Each exclusion category can be disabled; language alphabet restrictions still apply.

## Data and runtime prerequisites

Both tables pin tex-hyphen commit `5684c0f51c0b81133db2efbe60a408b4155a3ff5`. [Provenance](../packages/typographist/pattern-data/provenance.json) retains URLs, byte lengths, and SHA-256 hashes. Russian has 7,021 patterns and 184 exceptions (25 no-break); American English has 4,938 patterns and 14 exceptions (4 no-break). Default minima are 2/2 and 2/3 respectively.

The unchanged TeX inputs, provenance, and notices ship alongside emitted tables. Russian data uses LPPL 1.2 or later; American English uses its retained redistribution permission. The library MIT license does not replace these terms. `node tools/pattern-data/convert-patterns.ts` verifies the pinned bytes and reproduces both datasets locally without downloads.

The runtime requires standard Unicode normalization, property escapes, and `Intl.Segmenter` grapheme support. Public declarations compile with ES2023 libraries and no Node or DOM ambient types. The runtime imports neither Node facilities nor framework/DOM code. Compatible Unicode/ICU behavior and deterministic callbacks are prerequisites for repeatable cross-environment output. Browser and framework integration remain deferred.

## Node measurements

The final [raw measurements](runtime-hyphenation-benchmarks-mapping.json) cover runtime implementation commit `6c13cf4598626011f39c8696b455746caa6f7f5b`, which rejects mappings that omit original graphemes before exception or algorithm callbacks. Validation scans the already computed grapheme boundaries once, retaining null positions for expansions. Public regressions cover the supplied deletion example, NFC composition, case expansion, and graphemes containing multiple code points. The earlier exception-callback correction remains intact. Only explicit `null` allows algorithm fallback; undefined, asynchronous, and other non-array results raise `TypeError` before algorithm invocation. User/plugin/algorithm precedence is preserved. Four regressions include a JavaScript-style callback with no return, introduced through `Reflect.set` without type assertions.

The [original measurements](runtime-hyphenation-benchmarks.json) remain unchanged and identify their original runtime commit `4def2bdd980eafc3d7dad1f2438065ba1677ee81`. The [exception-correction measurements](runtime-hyphenation-benchmarks-p2.json) retain their real runtime revision `4befa80ed77e0a3b088584509fba0add8b321eef`. The final run used the same harness and fixtures; checks began after benchmarking finished. Separate host runs are not a controlled comparison.
Environment: Node v24.19.0, ICU 78.3, Linux 6.18.33.2-microsoft-standard-WSL2, 13th Gen Intel Core i5-13420H. Reproduce from the repository root:

```sh
npm run build --workspace=@elmenov-softworks/typographist
node tools/benchmarks/hyphenation.ts "$(git rev-parse HEAD)" > /tmp/hyphenation-benchmarks.json
```

The harness benchmarks emitted JavaScript, excluding build and Vitest startup. Preparation has three warm-ups and seven independently timed preparations of both languages. Preparation minimum/median/maximum is 16.95/29.07/34.94 ms. Processing reuses prepared services with three warm-ups per workload and seven samples. Each sample averages `max(1, min(200, floor(20000 / input.length)))` calls. Output lengths are consumed during timing and exact results checked after each sample; preflight also validates preservation, idempotence, known exceptions, and grapheme-safe insertions.

The following figures are full-service milliseconds per call, not isolated matcher timings. Throughput uses input UTF-16 code units. All seven samples, iterations, output lengths, and input hashes are retained in the JSON.

| Workload                | Input units | Min ms | Median ms | Max ms | Million units/s |
| ----------------------- | ----------: | -----: | --------: | -----: | --------------: |
| short-en                |          19 |  0.024 |     0.025 |  0.030 |           0.762 |
| paragraph-ru            |          96 |  0.083 |     0.141 |  0.175 |           0.679 |
| paragraph-en            |         187 |  0.077 |     0.095 |  0.241 |           1.970 |
| repeated-words          |       28000 | 17.213 |    21.454 | 31.350 |           1.305 |
| varied-vocabulary       |       25999 | 19.950 |    20.540 | 35.088 |           1.266 |
| ru-1000                 |        1056 |  0.910 |     0.964 |  1.813 |           1.096 |
| en-1000                 |        1122 |  0.503 |     0.658 |  1.698 |           1.705 |
| mixed-1000              |        1132 |  0.703 |     0.746 |  1.695 |           1.518 |
| long-word-1000          |        1000 |  0.370 |     0.394 |  1.129 |           2.540 |
| combining-run-1000      |        1002 |  0.138 |     0.142 |  0.157 |           7.056 |
| email-near-match-1000   |        1008 |  1.677 |     3.198 |  5.392 |           0.315 |
| scheme-near-match-1000  |        1006 |  0.342 |     0.354 |  1.901 |           2.842 |
| ru-4000                 |        4032 |  3.312 |     3.592 |  6.017 |           1.122 |
| en-4000                 |        4114 |  1.692 |     1.807 |  5.870 |           2.277 |
| mixed-4000              |        4245 |  2.390 |     2.608 |  6.946 |           1.627 |
| long-word-4000          |        4000 |  1.477 |     1.532 |  4.402 |           2.611 |
| combining-run-4000      |        4002 |  0.539 |     0.566 |  0.629 |           7.073 |
| email-near-match-4000   |        4008 |  6.622 |     7.231 | 17.055 |           0.554 |
| scheme-near-match-4000  |        4006 |  1.363 |     1.442 | 11.227 |           2.778 |
| ru-16000                |       16032 | 13.403 |    14.835 | 25.858 |           1.081 |
| en-16000                |       16082 |  6.669 |     6.990 |  7.493 |           2.301 |
| mixed-16000             |       16131 |  9.512 |    10.000 | 26.056 |           1.613 |
| long-word-16000         |       16000 |  6.413 |     6.870 | 13.499 |           2.329 |
| combining-run-16000     |       16002 |  2.135 |     2.179 |  3.455 |           7.344 |
| email-near-match-16000  |       16008 | 26.704 |    29.141 | 69.423 |           0.549 |
| scheme-near-match-16000 |       16006 |  5.519 |     5.852 | 27.721 |           2.735 |

Paragraphs include uppercase text, decomposed ё, unsupported stress, emoji, manual soft hyphens, identifiers, addresses, and URLs. Mixed text uses explicit Cyrillic-based selector routing. Repeated words contain 28,000 units; varied vocabulary contains 2,000 deterministic pseudorandom 12-letter ASCII words (seed 42), 25,999 units. Varied vocabulary is a matcher workload, not a linguistic corpus. Adversarial inputs include long individual ASCII words, long combining-mark graphemes, dot-atom email near-matches, and scheme near-matches. Construction and exact fixture contents are in [the harness](../tools/benchmarks/hyphenation.ts).

From roughly 4K to 16K units, median time ratios are: ru 4.13×, en 3.87×, mixed 3.83×, long-word 4.49×, combining-run 3.85×, email-near-match 4.03×, scheme-near-match 4.06×. Scheduling and GC variation limit interpretation. These samples do not establish a consistent quadratic trend or prove scaling at all lengths. No numerical performance gate or comparative library ranking was used. Historical JSON files remain unchanged; separate runs do not isolate the performance effect of either correction.

## Representation and complexity

The chosen representation is the baseline bounded trie with sparse nonzero terminal weight contributions. Duplicate pattern keys merge weights by maximum. Odd/even precedence, anchors, and original offset mapping are covered by synthetic tests. Compact tables, buffer reuse, and caching were considered but not implemented or measured; there is no empirical comparison against an alternative representation. The baseline satisfies the fixed-table asymptotic target and the recorded workloads without additional infrastructure. Any later optimization needs equivalent fixtures and a measured benefit.

Let P be total pattern input size, M total analyzed matching symbols, L maximum pattern length, U actual applied weight contributions, N input UTF-16 units, and B inserted breaks. Pattern trie preparation takes O(P) time and space. Matching/aggregation takes O(M × L + U), with possible U = O(M × L²) for arbitrary tables. Reconstruction takes O(N + B). Exception preparation additionally depends on total example length and Unicode normalization/segmentation costs. Temporary matcher storage is proportional to analyzed word length; spans, boundaries, and output use storage bounded by input/output. No unbounded cache exists.

For fixed bundled tables, L and contribution counts are fixed and M = O(N), yielding O(N + B) library processing work, subject to runtime Unicode normalization/segmentation cost. Prepared Set alphabet lookup, forward scanners, indexed language dispatch, and boundary Sets avoid per-symbol alphabet scans and per-offset segmentation. Supported-word analysis validation performs another bounded segmentation pass. Custom normalizer expansion adds its output size; arbitrary selector, normalizer, exclusion, and algorithm callback execution costs must be accounted for separately. No bound is imposed on caller code or ICU internals.

## Verification and remaining limits

Previously completed packaging, consumer, and conversion checks remain recorded below. Refreshed checks for the corrected runtime are identified explicitly:

- `npm run test --workspace=@elmenov-softworks/typographist`: 192 tests passed in the correction slice; the refreshed workspace run also includes these tests.
- `npm test`: 207 tests pass across 15 files, including release regressions.
- `npm run lint` and `npm run format:check`: pass; ESLint reports its existing multiple-project advisory.
- `npm run typecheck`: root TypeScript step passes, but Nx emits sandbox socket errors and returns zero without demonstrated package execution.
- `npm run build`: Nx likewise emits socket errors and returns zero without demonstrated builds. These Nx invocations are not counted as verified target execution.
- `npm run typecheck --workspaces` and `npm run build --workspaces`: all four package scripts pass directly, preserving sandbox restrictions.
- Built ESM import in Node with no `document` global: source exception fixtures pass.
- Server consumer compiled against emitted declarations with `lib: ["ES2023"]`, `types: []`, strict NodeNext configuration: passes without DOM or Node ambient types.
- Local conversion verifies pinned hashes and counts; `git diff --exit-code` after regeneration confirms identical tables.
- `npm pack --dry-run --json --workspace=@elmenov-softworks/typographist --cache=/tmp/typographist-pack-cache`: passes; 106 files, 121,504 compressed bytes. Inventory includes public ESM/declarations, both source files, provenance, and data notices.

Refreshed correction evidence is in `/tmp/typographist-mapping-{0,1,2,3,4,5,6}.log`. Lint, formatting, all 203 workspace tests, and direct builds/type checks of all four packages passed. Root type checking completed its TypeScript step; both configured Nx commands again reported sandbox socket failures without demonstrated target execution. No sandbox settings were changed. The full benchmark run passed its output validation for every workload; the retained mapping-correction JSON contains all seven samples.

Packaging, server-consumer, built-import, and conversion evidence above comes from the previous implementation verification, not a fresh run in this documentation slice. Previous logs are `/tmp/typographist-final-{0,1,2,3,4}.log` and `/tmp/typographist-extra-{0,1,2,3}.log`; server inputs are `/tmp/typographist-server-consumer.mts` and `/tmp/typographist-server-tsconfig.json`. Local logs are ephemeral. Coordinator verification and independent re-review remain required before publication.

The empty wrapper packages remain unchanged; their individual CI test targets may still report no tests. No GitHub CI outcome is claimed here. Publication, independent review, report commit, and waiting for required PR checks belong to the coordinator. Nx target execution remains an environment verification limitation until the coordinator can run it in its permitted environment.

Language fixtures are source-version spot checks, not proof of perfect linguistic coverage. English retains the source's documented `democrat` limitation. Visible-hyphen component splitting is library text policy rather than full TeX paragraph behavior. There is no DOM/HTML processing, layout measurement, Khristov engine, runtime training, automatic data loading, or framework integration.

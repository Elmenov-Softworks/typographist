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

The retained [raw measurements](runtime-hyphenation-benchmarks.json) cover runtime implementation commit `4def2bdd980eafc3d7dad1f2438065ba1677ee81`. The subsequent benchmark commit `59c7269` adds only the harness, measurements, and benchmark documentation; this report does not change runtime code.

Environment: Node v24.19.0, ICU 78.3, Linux 6.18.33.2-microsoft-standard-WSL2, 13th Gen Intel Core i5-13420H. Reproduce from the repository root:

```sh
npm run build --workspace=@elmenov-softworks/typographist
node tools/benchmarks/hyphenation.ts "$(git rev-parse HEAD)" > /tmp/hyphenation-benchmarks.json
```

The harness benchmarks emitted JavaScript, excluding build and Vitest startup. Preparation has three warm-ups and seven independently timed preparations of both languages. Preparation minimum/median/maximum is 20.64/23.89/36.39 ms. Processing reuses prepared services with three warm-ups per workload and seven samples. Each sample averages `max(1, min(200, floor(20000 / input.length)))` calls. Output lengths are consumed during timing and exact results checked after each sample; preflight also validates preservation, idempotence, known exceptions, and grapheme-safe insertions.

The following figures are full-service milliseconds per call, not isolated matcher timings. Throughput uses input UTF-16 code units. All seven samples, iterations, output lengths, and input hashes are retained in the JSON.

| Workload                | Input units | Min ms | Median ms | Max ms | Million units/s |
| ----------------------- | ----------: | -----: | --------: | -----: | --------------: |
| short-en                |          19 |  0.026 |     0.050 |  0.085 |           0.381 |
| paragraph-ru            |          96 |  0.114 |     0.272 |  0.450 |           0.354 |
| paragraph-en            |         187 |  0.102 |     0.266 |  0.338 |           0.703 |
| repeated-words          |       28000 | 19.601 |    24.775 | 38.229 |           1.130 |
| varied-vocabulary       |       25999 | 20.724 |    23.204 | 36.549 |           1.120 |
| ru-1000                 |        1056 |  0.977 |     1.089 |  1.748 |           0.970 |
| en-1000                 |        1122 |  0.532 |     0.602 |  1.632 |           1.863 |
| mixed-1000              |        1132 |  0.752 |     0.929 |  2.038 |           1.219 |
| long-word-1000          |        1000 |  0.462 |     0.562 |  1.715 |           1.778 |
| combining-run-1000      |        1002 |  0.143 |     0.179 |  0.251 |           5.592 |
| email-near-match-1000   |        1008 |  2.136 |     4.519 |  6.032 |           0.223 |
| scheme-near-match-1000  |        1006 |  0.478 |     0.602 |  3.690 |           1.671 |
| ru-4000                 |        4032 |  4.825 |     5.561 |  9.485 |           0.725 |
| en-4000                 |        4114 |  2.536 |     2.732 |  9.702 |           1.506 |
| mixed-4000              |        4245 |  3.008 |     3.605 |  9.819 |           1.178 |
| long-word-4000          |        4000 |  1.644 |     1.798 |  4.831 |           2.224 |
| combining-run-4000      |        4002 |  0.541 |     0.559 |  0.628 |           7.160 |
| email-near-match-4000   |        4008 |  7.568 |     8.346 | 18.297 |           0.480 |
| scheme-near-match-4000  |        4006 |  1.524 |     1.627 | 10.530 |           2.462 |
| ru-16000                |       16032 | 14.897 |    16.464 | 35.216 |           0.974 |
| en-16000                |       16082 |  7.226 |     7.968 | 23.796 |           2.018 |
| mixed-16000             |       16131 |  9.740 |    11.172 | 30.691 |           1.444 |
| long-word-16000         |       16000 |  7.816 |     8.095 | 13.966 |           1.976 |
| combining-run-16000     |       16002 |  2.143 |     2.251 |  2.478 |           7.109 |
| email-near-match-16000  |       16008 | 30.041 |    31.938 | 90.942 |           0.501 |
| scheme-near-match-16000 |       16006 |  6.727 |     8.501 | 40.571 |           1.883 |

Paragraphs include uppercase text, decomposed ё, unsupported stress, emoji, manual soft hyphens, identifiers, addresses, and URLs. Mixed text uses explicit Cyrillic-based selector routing. Repeated words contain 28,000 units; varied vocabulary contains 2,000 deterministic pseudorandom 12-letter ASCII words (seed 42), 25,999 units. Varied vocabulary is a matcher workload, not a linguistic corpus. Adversarial inputs include long individual ASCII words, long combining-mark graphemes, dot-atom email near-matches, and scheme near-matches. Construction and exact fixture contents are in [the harness](../tools/benchmarks/hyphenation.ts).

From roughly 4K to 16K units, median times grow by 2.96× for Russian, 2.92× for English, 3.10× for mixed text, 4.50× for long words, 4.03× for combining runs, 3.83× for email near-matches, and 5.22× for scheme near-matches. Samples show substantial scheduling/GC variation. These sizes show no consistent quadratic trend; they do not prove scaling for every length or ICU version. Short workloads are especially noisy. No numerical performance gate or comparative library ranking was used.

## Representation and complexity

The chosen representation is the baseline bounded trie with sparse nonzero terminal weight contributions. Duplicate pattern keys merge weights by maximum. Odd/even precedence, anchors, and original offset mapping are covered by synthetic tests. Compact tables, buffer reuse, and caching were considered but not implemented or measured; there is no empirical comparison against an alternative representation. The baseline satisfies the fixed-table asymptotic target and the recorded workloads without additional infrastructure. Any later optimization needs equivalent fixtures and a measured benefit.

Let P be total pattern input size, M total analyzed matching symbols, L maximum pattern length, U actual applied weight contributions, N input UTF-16 units, and B inserted breaks. Pattern trie preparation takes O(P) time and space. Matching/aggregation takes O(M × L + U), with possible U = O(M × L²) for arbitrary tables. Reconstruction takes O(N + B). Exception preparation additionally depends on total example length and Unicode normalization/segmentation costs. Temporary matcher storage is proportional to analyzed word length; spans, boundaries, and output use storage bounded by input/output. No unbounded cache exists.

For fixed bundled tables, L and contribution counts are fixed and M = O(N), yielding O(N + B) library processing work, subject to runtime Unicode normalization/segmentation cost. Prepared Set alphabet lookup, forward scanners, indexed language dispatch, and boundary Sets avoid per-symbol alphabet scans and per-offset segmentation. Supported-word analysis validation performs another bounded segmentation pass. Custom normalizer expansion adds its output size; arbitrary selector, normalizer, exclusion, and algorithm callback execution costs must be accounted for separately. No bound is imposed on caller code or ICU internals.

## Verification and remaining limits

Final worker checks on the unchanged runtime and benchmark implementation:

- `npm run test --workspace=@elmenov-softworks/typographist`: 184 tests pass across 12 files.
- `npm test`: 199 tests pass across 15 files, including release regressions.
- `npm run lint` and `npm run format:check`: pass; ESLint reports its existing multiple-project advisory.
- `npm run typecheck`: root TypeScript step passes, but Nx emits sandbox socket errors and returns zero without demonstrated package execution.
- `npm run build`: Nx likewise emits socket errors and returns zero without demonstrated builds. These Nx invocations are not counted as verified target execution.
- `npm run typecheck --workspaces` and `npm run build --workspaces`: all four package scripts pass directly, preserving sandbox restrictions.
- Built ESM import in Node with no `document` global: source exception fixtures pass.
- Server consumer compiled against emitted declarations with `lib: ["ES2023"]`, `types: []`, strict NodeNext configuration: passes without DOM or Node ambient types.
- Local conversion verifies pinned hashes and counts; `git diff --exit-code` after regeneration confirms identical tables.
- `npm pack --dry-run --json --workspace=@elmenov-softworks/typographist --cache=/tmp/typographist-pack-cache`: passes; 106 files, 121,504 compressed bytes. Inventory includes public ESM/declarations, both source files, provenance, and data notices.

Worker evidence logs are `/tmp/typographist-final-{0,1,2,3,4}.log` (lint, formatting, root typecheck, workspace tests, Nx build) and `/tmp/typographist-extra-{0,1,2,3}.log` (direct package builds, direct package typechecks, core tests, pack inventory). The server check inputs are `/tmp/typographist-server-consumer.mts` and `/tmp/typographist-server-tsconfig.json`. These local logs are ephemeral; the coordinator independently verifies before publication.

The empty wrapper packages remain unchanged; their individual CI test targets may still report no tests. No GitHub CI outcome is claimed here. Publication, independent review, report commit, and waiting for required PR checks belong to the coordinator. Nx target execution remains an environment verification limitation until the coordinator can run it in its permitted environment.

Language fixtures are source-version spot checks, not proof of perfect linguistic coverage. English retains the source's documented `democrat` limitation. Visible-hyphen component splitting is library text policy rather than full TeX paragraph behavior. There is no DOM/HTML processing, layout measurement, Khristov engine, runtime training, automatic data loading, or framework integration.

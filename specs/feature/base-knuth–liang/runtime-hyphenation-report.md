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

Both tables pin tex-hyphen commit `5684c0f51c0b81133db2efbe60a408b4155a3ff5`. [Provenance](../../../packages/typographist/pattern-data/provenance.json) retains URLs, byte lengths, and SHA-256 hashes. Russian has 7,021 patterns and 184 exceptions (25 no-break); American English has 4,938 patterns and 14 exceptions (4 no-break). Default minima are 2/2 and 2/3 respectively.

The unchanged TeX inputs, provenance, and notices ship alongside emitted tables. Russian data uses LPPL 1.2 or later; American English uses its retained redistribution permission. The library MIT license does not replace these terms. `node tools/pattern-data/convert-patterns.ts` verifies the pinned bytes and reproduces both datasets locally without downloads.

The runtime requires standard Unicode normalization, property escapes, and `Intl.Segmenter` grapheme support. Public declarations compile with ES2023 libraries and no Node or DOM ambient types. The runtime imports neither Node facilities nor framework/DOM code. Compatible Unicode/ICU behavior and deterministic callbacks are prerequisites for repeatable cross-environment output. Browser and framework integration remain deferred.

## Node measurements

The current [raw measurements](runtime-hyphenation-benchmarks-reorganization.json) cover HEAD `553d05ccb1b52bcb730b9646e9c4fd9b5609e641`, including the owner's runtime reorganization `b92cd629` and documentation commit `553d05c`. The package was rebuilt from an empty generated `dist` directory before benchmarking, so the measurements execute the reorganized emitted JavaScript. No runtime source was changed in this refresh.

The [original measurements](runtime-hyphenation-benchmarks.json), [exception-correction measurements](runtime-hyphenation-benchmarks-p2.json), and [mapping-correction measurements](runtime-hyphenation-benchmarks-mapping.json) remain unchanged. Their actual runtime revisions are `4def2bdd980eafc3d7dad1f2438065ba1677ee81`, `4befa80ed77e0a3b088584509fba0add8b321eef`, and `6c13cf4598626011f39c8696b455746caa6f7f5b`, respectively. The corrections reject malformed exception callback results and mappings that omit original graphemes. These behaviors remain covered by the current tests. The current run uses the same harness and fixtures; verification checks ran after its timing completed. Separate host runs are not a controlled performance comparison.

Environment: Node v24.19.0, ICU 78.3, Linux 6.18.33.2-microsoft-standard-WSL2, 13th Gen Intel Core i5-13420H. Reproduce from the repository root:

```sh
npm run build --workspace=@elmenov-softworks/typographist
node tools/benchmarks/hyphenation.ts "$(git rev-parse HEAD)" > /tmp/hyphenation-benchmarks.json
```

The harness benchmarks emitted JavaScript, excluding build and Vitest startup. Preparation has three warm-ups and seven independently timed preparations of both languages. Preparation minimum/median/maximum is 21.72/27.62/34.30 ms. Processing reuses prepared services with three warm-ups per workload and seven samples. Each sample averages `max(1, min(200, floor(20000 / input.length)))` calls. Output lengths are consumed during timing and exact results checked after each sample; preflight also validates preservation, idempotence, known exceptions, and grapheme-safe insertions.

The following figures are full-service milliseconds per call, not isolated matcher timings. Throughput uses input UTF-16 code units. All seven samples, iterations, output lengths, and input hashes are retained in the JSON.

| Workload                | Input units | Min ms | Median ms | Max ms | Million units/s |
| ----------------------- | ----------: | -----: | --------: | -----: | --------------: |
| short-en                |          19 |  0.022 |     0.024 |  0.028 |           0.805 |
| paragraph-ru            |          96 |  0.104 |     0.134 |  0.208 |           0.718 |
| paragraph-en            |         187 |  0.079 |     0.085 |  0.334 |           2.203 |
| repeated-words          |       28000 | 18.013 |    20.636 | 34.130 |           1.357 |
| varied-vocabulary       |       25999 | 18.983 |    19.853 | 33.511 |           1.310 |
| ru-1000                 |        1056 |  0.899 |     0.967 |  1.689 |           1.092 |
| en-1000                 |        1122 |  0.459 |     0.487 |  1.724 |           2.304 |
| mixed-1000              |        1132 |  0.654 |     0.703 |  1.742 |           1.611 |
| long-word-1000          |        1000 |  0.373 |     0.391 |  1.017 |           2.559 |
| combining-run-1000      |        1002 |  0.135 |     0.143 |  0.263 |           7.000 |
| email-near-match-1000   |        1008 |  1.618 |     3.331 |  5.829 |           0.303 |
| scheme-near-match-1000  |        1006 |  0.328 |     0.358 |  2.142 |           2.807 |
| ru-4000                 |        4032 |  3.303 |     3.470 |  5.296 |           1.162 |
| en-4000                 |        4114 |  1.645 |     1.670 |  5.548 |           2.463 |
| mixed-4000              |        4245 |  2.379 |     2.722 |  6.516 |           1.560 |
| long-word-4000          |        4000 |  1.429 |     1.553 |  3.498 |           2.575 |
| combining-run-4000      |        4002 |  0.522 |     0.530 |  0.571 |           7.549 |
| email-near-match-4000   |        4008 |  6.679 |     7.049 | 17.788 |           0.569 |
| scheme-near-match-4000  |        4006 |  1.290 |     1.318 |  8.945 |           3.038 |
| ru-16000                |       16032 | 13.267 |    14.824 | 22.663 |           1.082 |
| en-16000                |       16082 |  6.737 |     7.421 | 26.454 |           2.167 |
| mixed-16000             |       16131 |  9.176 |    10.322 | 25.858 |           1.563 |
| long-word-16000         |       16000 |  6.165 |     6.329 | 17.833 |           2.528 |
| combining-run-16000     |       16002 |  2.020 |     2.098 |  2.228 |           7.626 |
| email-near-match-16000  |       16008 | 26.249 |    27.838 | 74.879 |           0.575 |
| scheme-near-match-16000 |       16006 |  5.364 |     5.778 | 36.191 |           2.770 |

Paragraphs include uppercase text, decomposed ё, unsupported stress, emoji, manual soft hyphens, identifiers, addresses, and URLs. Mixed text uses explicit Cyrillic-based selector routing. Repeated words contain 28,000 units; varied vocabulary contains 2,000 deterministic pseudorandom 12-letter ASCII words (seed 42), 25,999 units. Varied vocabulary is a matcher workload, not a linguistic corpus. Adversarial inputs include long individual ASCII words, long combining-mark graphemes, dot-atom email near-matches, and scheme near-matches. Construction and exact fixture contents are in [the harness](../../../tools/benchmarks/hyphenation.ts).

From roughly 4K to 16K units, median time ratios are: ru 4.27×, en 4.44×, mixed 3.79×, long-word 4.07×, combining-run 3.96×, email-near-match 3.95×, scheme-near-match 4.38×. Scheduling and GC variation limit interpretation. These samples do not establish a consistent quadratic trend or prove scaling at all lengths. No numerical performance gate or comparative library ranking was used. Historical JSON files remain unchanged; separate runs do not isolate the performance effect of the corrections or reorganization.

## Representation and complexity

The chosen representation is the baseline bounded trie with sparse nonzero terminal weight contributions. Duplicate pattern keys merge weights by maximum. Odd/even precedence, anchors, and original offset mapping are covered by synthetic tests. Compact tables, buffer reuse, and caching were considered but not implemented or measured; there is no empirical comparison against an alternative representation. The baseline satisfies the fixed-table asymptotic target and the recorded workloads without additional infrastructure. Any later optimization needs equivalent fixtures and a measured benefit.

Let P be total pattern input size, M total analyzed matching symbols, L maximum pattern length, U actual applied weight contributions, N input UTF-16 units, and B inserted breaks. Pattern trie preparation takes O(P) time and space. Matching/aggregation takes O(M × L + U), with possible U = O(M × L²) for arbitrary tables. Reconstruction takes O(N + B). Exception preparation additionally depends on total example length and Unicode normalization/segmentation costs. Temporary matcher storage is proportional to analyzed word length; spans, boundaries, and output use storage bounded by input/output. No unbounded cache exists.

For fixed bundled tables, L and contribution counts are fixed and M = O(N), yielding O(N + B) library processing work, subject to runtime Unicode normalization/segmentation cost. Prepared Set alphabet lookup, forward scanners, indexed language dispatch, and boundary Sets avoid per-symbol alphabet scans and per-offset segmentation. Supported-word analysis validation performs another bounded segmentation pass. Custom normalizer expansion adds its output size; arbitrary selector, normalizer, exclusion, and algorithm callback execution costs must be accounted for separately. No bound is imposed on caller code or ICU internals.

## Verification and remaining limits

The coordinator's configured check evidence for HEAD `553d05ccb1b52bcb730b9646e9c4fd9b5609e641` is `/tmp/typographist-run-task-eyoni1l0/reorganization-coordinator-checks.log`; the full original is the saved run's `commands.log`. Inspection confirms:

- `npm run lint` and `npm run format:check`: pass. ESLint retains its multiple-project advisory.
- `npm run typecheck`: the root TypeScript step and all four package typecheck targets plus the core build dependency succeeded, with 0/5 cache hits. This demonstrates actual target execution.
- `npm test`: 207 tests pass across 15 files, including release regressions.
- `npm run build`: all four package build targets succeeded; one of four used matching cached outputs.

Earlier worker invocations encountered Nx socket failures and did not demonstrate target execution. Those historical observations remain valid for that worker environment; they do not invalidate the later successful coordinator results. The supplied log is evidence from the coordinator's permitted environment, not permission to change or bypass this worker's sandbox.

Fresh worker verification against the reorganized package:

- `npm run lint` and `npm run format:check`: pass after the report and measurement refresh; `git diff --check` also passes. All repository-relative report links resolve.
- `npm run build --workspace=@elmenov-softworks/typographist`: passes after moving the previous untracked generated `dist` to `/tmp/typographist-reorganization-dist-before-clean-1791362000`. This avoids stale modules from earlier layouts in the inspected package.
- `npm run test --workspace=@elmenov-softworks/typographist`: 192 tests pass across 12 files.
- Built ESM import in Node without a `document` global: Russian and English source-exception fixtures pass (`асбест`, `table`, `TABLE`, and `present`).
- `node_modules/.bin/tsc -p /tmp/typographist-server-tsconfig.json`: a strict NodeNext consumer against emitted declarations passes with `lib: ["ES2023"]` and `types: []`, without DOM or Node ambient types. Its input is `/tmp/typographist-server-consumer.mts`.
- `node tools/pattern-data/convert-patterns.ts`: verifies both pinned checksums and regenerates 7,021/4,938 patterns and 184/14 exceptions. `git diff --exit-code -- packages/typographist/src/languages/bundled` confirms identical generated sources.
- `npm pack --dry-run --json --workspace=@elmenov-softworks/typographist --cache=/tmp/typographist-pack-cache`: passes; 130 files, 128,284 compressed bytes from the fresh build. Inventory assertions confirm public ESM/declarations, both emitted tables, both unchanged TeX sources, provenance, data README notices, and the package MIT license. The retained source files contain Russian LPPL and English copyright/redistribution notices.
- The full emitted-JavaScript benchmark passes output validation for every workload; the retained reorganization JSON contains all seven samples.

Fresh evidence is `/tmp/typographist-reorganization-build.log`, `/tmp/typographist-reorganization-tests.log`, `/tmp/typographist-reorganization-consumer.log`, `/tmp/typographist-reorganization-conversion.log`, `/tmp/typographist-reorganization-pack.{json,log}`, `/tmp/typographist-reorganization-lint.log`, and `/tmp/typographist-reorganization-format.log`. Local logs and temporary consumer inputs are ephemeral. Historical correction logs remain `/tmp/typographist-mapping-{0,1,2,3,4,5,6}.log`; earlier verification logs remain `/tmp/typographist-final-{0,1,2,3,4}.log` and `/tmp/typographist-extra-{0,1,2,3}.log`.

The empty wrapper packages remain unchanged; their individual CI test targets may still report no tests. This is a separately documented pre-existing limitation. No GitHub CI outcome is claimed: the coordinator publishes after local checks and independent review, then waits for `lint`, `tests`, and `typecheck` on the exact PR head. Independent re-review, the correction commit, publication, and remote check verification remain coordinator steps; future CI results must not be inferred from local success.

Language fixtures are source-version spot checks, not proof of perfect linguistic coverage. English retains the source's documented `democrat` limitation. Visible-hyphen component splitting is library text policy rather than full TeX paragraph behavior. There is no DOM/HTML processing, layout measurement, Khristov engine, runtime training, automatic data loading, or framework integration.

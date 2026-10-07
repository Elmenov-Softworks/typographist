Run from the repository root after building the core package:

```sh
npm run build --workspace=@elmenov-softworks/typographist
node tools/benchmarks/hyphenation.ts "$(git rev-parse HEAD)" > /tmp/hyphenation-benchmarks.json
```

The argument records the measured runtime implementation commit. Run with a clean working tree, or record runtime edits separately. The harness executes emitted package JavaScript; Node's TypeScript support only strips types from the harness. No Vitest transformation or startup is timed. There are no benchmark dependencies or timing acceptance thresholds.

Preparation uses both bundled plugins, three warm-ups, and seven timed preparations. Processing reuses prepared services, performs three warm-up calls per workload, and records seven samples. Each sample averages between 1 and 200 calls, selected as `floor(20000 / input.length)` and clamped to that range. JSON records the actual iteration count, all samples, minimum/median/maximum milliseconds per call, and throughput in millions of UTF-16 code units per second. Output lengths are consumed during timing; exact output checks occur after each sample.

Before timing, the harness checks source exception examples, preservation after removing soft hyphens, idempotence, and insertion boundaries against `Intl.Segmenter`. The correctness suite remains the source of linguistic expectations; these checks do not establish perfect language coverage.

Workloads include short English, Russian and English paragraphs, repeated words, and 2,000 deterministic pseudorandom 12-letter ASCII words (seed 42, no word cache). Paragraphs include uppercase words, decomposed ё, unsupported stress marks, emoji, existing soft hyphens, identifiers, email, and a URL. Mixed paragraphs route words explicitly by Cyrillic presence. Increasing workloads target 1K, 4K, and 16K code units and record actual lengths. Adversarial workloads include single long ASCII words, one long combining-mark grapheme, dot-atom email near-matches without a dotted hostname, and scheme near-matches. Hashes identify exact generated inputs.

The initial retained measurement is in `specs/runtime-hyphenation-benchmarks.json`. It measures runtime commit `4def2bdd980eafc3d7dad1f2438065ba1677ee81` on Node 24.19.0. Later runtime changes require rerunning these measurements. The implementation report is a separate delivery step.

The selected matcher is the baseline bounded trie with sparse nonzero terminal contributions and maximum merging for duplicate pattern keys. No competing representation was implemented or measured, and these results make no comparative speed claim. It has no cache or shared mutable word buffers. Further representation changes would need a measured benefit and equivalent correctness results.

Let P be total pattern input size, M total analyzed matching symbols, L maximum pattern length, U applied weight contributions, N input UTF-16 length, and B inserted breaks. Trie preparation takes O(P) time and space. Matching and aggregation take O(M × L + U); U can be O(M × L²) for arbitrary tables. Reconstruction takes O(N + B). Temporary per-word matcher storage is proportional to analyzed word length; service spans/output are bounded by input/output, with no unbounded cache.

For fixed bundled tables, L and terminal contributions are fixed and matching is linear in analyzed length. Alphabet membership uses a prepared Set, scanners advance through input, language lookup uses prepared indexes, and boundary membership uses Sets. Bundled normalization visits graphemes and their normalized symbols; it does not scan the alphabet per symbol. Unicode normalization and segmentation costs also depend on the runtime Unicode implementation. Service analysis validation segments supported words again; this adds a bounded pass, rather than one pass per break. Custom normalization expansion adds its output size, and arbitrary selector, normalizer, exclusion, and algorithm callback costs must be added separately. No universal bound is claimed for caller code or ICU internals.

The initial samples are consistent with linear input scaling over the tested sizes, including long words and combining runs. They are observations on one machine, not a guarantee for all lengths or runtime versions. Preparation and short-string samples show timing variation; retain the full samples rather than selecting the best run.

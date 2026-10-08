# Hyphenation benchmarks

Run from the repository root after building the core package:

```sh
npm run build --workspace=@elmenov-softworks/typographist
node tools/benchmarks/hyphenation.ts --output /tmp/typographist-benchmarks/latest
```

The harness writes `<prefix>.json` and `<prefix>.html`. Without `--output`, the
prefix is `tools/benchmarks/results/latest`. The standalone HTML page includes
instance preparation, formatting latency and throughput, every timing sample,
workload search and implementation filtering. It does not require a server or
network access. Native SVG charts compare preparation, formatting latency by
locale, and Khristov speed relative to Knuth–Liang. Latency bars start at zero;
whiskers show sample minima and maxima, not confidence intervals. Each locale
has its own shared scale. Relative speed compares workload medians and marks
equal speed at 1×. Hover over a bar for its values. Charts remain visible without
JavaScript; the table filters use JavaScript.

JSON records environment, Git HEAD, dirty working tree status,
actual algorithm, requested mode, input hashes, output lengths and all samples.
A dirty run records HEAD plus working tree changes, not a clean commit benchmark.

Both modes process the same workloads: `useFast: false` runs Knuth–Liang and
`useFast: true` runs Khristov. Fast output is heuristic and may differ from
standard output. The report identifies the actual algorithm for each adapter.

To compare the previous API implementation, preserve its complete built `dist`
directory before rebuilding this branch, then pass its entry point:

```sh
node tools/benchmarks/hyphenation.ts \
  --output /tmp/typographist-benchmarks/comparison \
  --legacy /path/to/previous/dist/index.js \
  --legacy-commit 1c409579b67ddd1b575fd3db7af91b548479b92b
```

The legacy module must export `createHyphenator`, `prepareKnuthLiang`, `enUS` and
`ru`. `--legacy-commit` is optional provenance for the preserved build; the
harness cannot establish that build's source provenance itself. No checkout or
build is performed by the harness. Legacy and current adapters process identical
workloads in the same run. Exact legacy output equality is checked before timing
only for Knuth–Liang adapters; Khristov checks its own expected-output fixtures.
The report compares matching names, locales and input hashes. Relative speed is
current standard median divided by selected median; values above one mean lower latency in
that measurement. Import and adapter-loading time is excluded.

Instance preparation measures compilation of both bundled locales and creation
of ready-to-use formatters: one current instance or one legacy algorithm with two
locale services. Each adapter performs three warm-ups and seven timed preparations.
Processing reuses a prepared formatter, runs three warm-up calls per workload,
and records seven samples. Each sample averages `floor(20000 / input.length)`
calls, clamped to 1–200. No timer includes assertions or file generation. Output
lengths are consumed during timing; exact output assertions occur afterward.

Before timing, the harness checks representative source exceptions, preservation
after removing soft hyphens, idempotence and insertion boundaries against
`Intl.Segmenter`. These checks complement the correctness suite; they do not
establish perfect linguistic coverage. Khristov also checks the approved English
and Russian examples, uppercase and decomposed spelling, and protected tokens.
Mode-specific output differences do not fail legacy comparison.

Workloads include short English, Russian and English paragraphs, repeated words,
2,000 deterministic pseudorandom ASCII words, and 1K/4K/16K scaling cases. Mixed
paragraphs use one explicitly selected locale per call, measured under both
locales. Unicode, existing soft hyphens, identifiers, email, URLs, very long
words, combining runs and near-matching addresses remain represented.

The harness has no added dependencies, acceptance thresholds or word cache.

## External libraries

To append `hyphen`, `hypher` and `hyphenopoly` measurements to an existing report,
install their pinned versions in a separate directory. This does not change the
workspace dependencies:

```sh
npm install --prefix /tmp/typographist-competitors --ignore-scripts \
  hyphen@1.14.1 hypher@0.2.5 hyphenopoly@6.1.0 \
  hyphenation.en-us@0.2.1 hyphenation.ru@0.2.1
node tools/benchmarks/compare-libraries.ts \
  --modules /tmp/typographist-competitors/node_modules \
  --input /path/to/original-report.json \
  --output /tmp/typographist-benchmarks/with-libraries
```

The input must be an original report before external measurements were appended.
Node, ICU, OS, CPU, sample counts and workload hashes must match. Saved timings
remain unchanged. Extension metadata records its own time, source commit, dirty
state and the original report hash. Comparing measurements from separate runs
remains subject to runtime variation.

Adapters call native synchronous whole-text APIs with English-US and Russian
patterns. Minimum word lengths are aligned with the bundled minima where the
APIs permit; native dictionaries and output rules remain in use. Their return
values are checked synchronously by the adapters. Preparation excludes module
and pattern-byte loading. Hyphenopoly receives fresh module state for each
preparation sample and includes WASM compilation and instantiation.

Built-in word caches in hyphen and Hyphenopoly remain enabled and are populated
by verification and warm-ups. Hypher and Typographist have no persistent word
cache. This comparison describes warmed native APIs, not uncached engines.
Different word protection, Unicode handling and dictionaries affect results.

External outputs are checked for source preservation after removing soft hyphens,
idempotence and original grapheme boundaries. Failed checks do not stop the run:
their raw timings and validation status are retained, but their speed ratios and
latency bars are excluded. Exceptions mark workloads as unsupported, without a
timing. In particular, Hyphenopoly 6.1.0 reports words longer than 61 characters.
The external summary chart uses the median of per-workload standard/library
ratios among passing workloads and labels each library's included count.

Package documentation: [hyphen](https://github.com/ytiurin/hyphen),
[Hypher](https://github.com/bramstein/hypher),
[Hyphenopoly](https://mnater.github.io/Hyphenopoly/Module.html).

Retain all samples and compare on the same machine/runtime. Fixed-order timing
and runtime noise can affect results; one run is not a universal speed claim.
Historical measurements remain in `specs/feature/base-knuth–liang/` and describe
the earlier API and harness. Their preparation and mixed-language workloads
must not be treated as directly equivalent to the new ones.

Khristov preparation retains alphabet/classification lookups and snapshotted
exceptions, proportional to supplied language data. Standard preparation also
retains its pattern trie. These are instance costs, separate from temporary
formatting memory: normalization, grapheme boundaries, classes, barrier marks,
candidates and reconstructed output scale with the processed word/input and
inserted output. There is no persistent word cache. The harness measures elapsed
time, not heap allocation; these memory costs describe the implementation, not
measured byte counts. Historical reports are preserved with their original labels.

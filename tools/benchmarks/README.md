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
network access. JSON records environment, Git HEAD, dirty working tree status,
actual algorithm, requested mode, input hashes, output lengths and all samples.
A dirty run records HEAD plus working tree changes, not a clean commit benchmark.

Both `useFast: false` and `useFast: true` are measured separately. Both currently
execute Knuth–Liang. Do not interpret their timing differences as evidence of a
second algorithm. Future modes can use the existing implementation adapter
without changing workload generation, measurements or report rendering.

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
workloads in the same run, with exact output equality checked before timing.
The report compares matching names, locales and input hashes. Relative speed is
legacy median divided by current median; values above one mean lower latency in
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
establish perfect linguistic coverage.

Workloads include short English, Russian and English paragraphs, repeated words,
2,000 deterministic pseudorandom ASCII words, and 1K/4K/16K scaling cases. Mixed
paragraphs use one explicitly selected locale per call, measured under both
locales. Unicode, existing soft hyphens, identifiers, email, URLs, very long
words, combining runs and near-matching addresses remain represented.

The harness has no added dependencies, acceptance thresholds or word cache.
Retain all samples and compare on the same machine/runtime. Fixed-order timing
and runtime noise can affect results; one run is not a universal speed claim.
Historical measurements remain in `specs/feature/base-knuth–liang/` and describe
the earlier API and harness. Their preparation and mixed-language workloads
must not be treated as directly equivalent to the new ones.

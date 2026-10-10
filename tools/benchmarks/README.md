# Benchmark tools

Two recorded comparisons are retained in [benchmarks](../../benchmarks/):
[Typograf](../../benchmarks/typograf.html) and
[hyphenation libraries](../../benchmarks/hyphenation.html).
Their JSON files retain settings, versions, source revisions and raw samples.
They are historical measurements, not automatically refreshed results.

Build the core before running a harness:

```sh
npm run build --workspace=@elmenov-softworks/typographist
node tools/benchmarks/hyphenation.ts --output /tmp/typographist-benchmarks/latest
```

The hyphenation harness generates JSON and standalone HTML for both algorithms.
Use the category matrix in [typography](typography/README.md) to measure symbolic
formatting separately from hyphenation.

For a fresh cache and external-library comparison, install pinned competitors
outside the workspace:

```sh
npm install --prefix /tmp/typographist-competitors --ignore-scripts \
  hyphen@1.14.1 hypher@0.2.5 hyphenopoly@6.1.0 \
  hyphenation.en-us@0.2.1 hyphenation.ru@0.2.1
node tools/benchmarks/cache-comparison.ts \
  --modules /tmp/typographist-competitors/node_modules \
  --output /tmp/typographist-benchmarks/cache-comparison
```

This measures disabled, initially empty and warmed Typographist caches, plus
fresh and warmed native external instances. Each sample constructs a new
instance, with preparation and cache-populating time recorded separately.
Three preliminary samples precede seven measured calls. Imports are excluded.
Output checks run outside timing. Failed preservation checks remain visible
but do not contribute to ratios; unsupported cases have no timing.

Compare results on the same machine and runtime. Different dictionaries,
protection policies and native cache behavior prevent a universal ranking.
Khristov is heuristic; Hyphenopoly uses WASM. Browser rendering of an HTML
report is not a browser performance measurement. Estimated cache budgets are
not measured heap usage.

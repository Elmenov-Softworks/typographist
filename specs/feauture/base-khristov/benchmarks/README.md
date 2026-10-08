# Algorithm comparison

[Open the HTML report](comparison.html) or inspect [all measurements](comparison.json).

The original run compares Knuth–Liang (`useFast: false`) and Khristov (`useFast: true`)
on the same 29 workloads under Node 24.21.0. Each workload uses three warm-ups
and seven samples. The implementation snapshot is
`0a37c0967cda03e8d490eb7d8cddc9505e260f1d`, with a clean working tree at the start.
The JSON records the machine, runtime, input hashes and every timing sample.

The median of the 29 standard/fast median-latency ratios is 1.03×. Khristov has
lower median latency on 19 workloads. The median ratio is 1.01× for English and
1.06× for Russian. These are equally weighted workload ratios, not total elapsed
time or a statistical significance claim. Measurements run in standard-then-fast
order and remain subject to runtime noise.

Instance preparation takes 19.9912 ms for Knuth–Liang and 0.2613 ms for Khristov
at the median, a 76.51× ratio. Preparation includes both bundled locales and
excludes module loading. Formatting reuses those instances. The algorithms may
choose different breaks; the fast algorithm is heuristic.

Reproduce from the repository root after building the core package:

```sh
node tools/benchmarks/hyphenation.ts --output /tmp/typographist-benchmarks/comparison
```

The standalone HTML contains preparation, relative-speed and per-locale latency
charts. Bars show medians; latency whiskers show sample minima and maxima.
Hover titles expose individual values. The table retains all samples and supports
workload and implementation filters.

Screenshots were captured from this report in Chromium 156.0.8078.4, at a
1440-pixel desktop width and a 390-pixel mobile width. They were refreshed after
the external comparison was appended. Chromium renders the
report; it does not run these Node benchmark measurements. Chart counts, table
filters, browser errors and mobile overflow were checked during capture.

- [Overview](screenshots/overview.png)
- [Preparation](screenshots/preparation.png)
- [Relative speed](screenshots/speedup.png)
- [External libraries](screenshots/libraries.png)
- [English latency](screenshots/latency-en.png)
- [Russian latency](screenshots/latency-ru.png)
- [Full report](screenshots/full-report.png)
- [Mobile overview](screenshots/mobile.png)

## External comparison

The report now includes three independent libraries with English-US and Russian
patterns: [hyphen](https://github.com/ytiurin/hyphen),
[Hypher](https://github.com/bramstein/hypher) and
[Hyphenopoly](https://mnater.github.io/Hyphenopoly/Module.html).
They were installed in `/tmp`, without adding workspace dependencies.
[Package versions and npm archive integrity](external-packages.json) record the
engines and Hypher's separate language packages.

Original JSON timings and metadata remain unchanged. The external measurements
were collected separately on the same CPU, OS, Node and ICU versions, with the
same workloads, iterations, warm-ups and samples. The extension records the
clean harness snapshot `e938965c15230cb56581f0597028b3ad24fc40ee` and SHA-256 of the
original report. Cross-run timing noise remains possible.

| Native API        | Measured workloads | Passing workloads | Median standard/library ratio | Preparation median |
| ----------------- | -----------------: | ----------------: | ----------------------------: | -----------------: |
| hyphen 1.14.1     |                 29 |                29 |                         1.16× |          0.1728 ms |
| Hypher 0.2.5      |                 29 |                16 |                         1.51× |         14.8983 ms |
| Hyphenopoly 6.1.0 |                 20 |                 9 |                        15.03× |          0.6203 ms |

The ratio uses the preserved Knuth–Liang timing divided by the native library
timing. Only source-preserving, idempotent, grapheme-safe workloads enter the
summary and latency charts. Coverage differs, so these medians cannot establish
a single ranking across all 29 workloads. Raw timings and failed validation
statuses remain in the table and JSON. Hyphenopoly's nine unsupported workloads
are listed with their errors, without timings.

Built-in word caches in hyphen and Hyphenopoly remain enabled and are populated
before timing. Typographist and Hypher have no persistent word cache. Different
native exclusions, patterns and output rules remain in use; adapters do not add
Typographist's protection pipeline to the libraries. Hypher inserts zero-width
spaces around slashes, which fails source preservation and idempotence here.
Hyphenopoly rejects words longer than 61 characters and also differs on some
compound and repeated-processing cases.

Preparation excludes module and pattern-byte loading. Each Hyphenopoly sample
starts from fresh module state and includes the WASM compilation/instantiation
calls in a warmed Node process. Formatting uses prepared instances with their
native caches. The HTML includes these adapter notes and the passing-workload
count beside each library.

To recover the original input for another appended comparison:

```sh
git show f45f4b4:specs/feauture/base-khristov/benchmarks/comparison.json > /tmp/typographist-original-report.json
```

Install the pinned packages and run `tools/benchmarks/compare-libraries.ts` as
described in [the harness documentation](../../../../tools/benchmarks/README.md).

# Algorithm comparison

[Open the HTML report](comparison.html) or inspect [all measurements](comparison.json).

This run compares Knuth–Liang (`useFast: false`) and Khristov (`useFast: true`)
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
1440-pixel desktop width and a 390-pixel mobile width. Chromium renders the
report; it does not run these Node benchmark measurements. Chart counts, table
filters, browser errors and mobile overflow were checked during capture.

- [Overview](screenshots/overview.png)
- [Preparation](screenshots/preparation.png)
- [Relative speed](screenshots/speedup.png)
- [English latency](screenshots/latency-en.png)
- [Russian latency](screenshots/latency-ru.png)
- [Full report](screenshots/full-report.png)
- [Mobile overview](screenshots/mobile.png)

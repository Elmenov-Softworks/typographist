# Typographist

Symbolic typography and soft hyphenation for JavaScript and TypeScript.
Built-in rules support Russian and US English. The standalone ESM core runs in
Node.js and browsers without runtime dependencies.

## Packages

| Package                                 | Documentation                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `@elmenov-softworks/typographist`       | [Core API, configuration and limits](packages/typographist/README.md)         |
| `@elmenov-softworks/typographist-react` | [React provider, component and hook](packages/typographist-react/README.md)   |
| `@elmenov-softworks/typographist-vue`   | [Vue provider, component and composable](packages/typographist-vue/README.md) |
| `@elmenov-softworks/typographist-solid` | [Solid provider, component and hook](packages/typographist-solid/README.md)   |
| `@elmenov-softworks/rules-transformer`  | [TeX hyphenation table converter](packages/rules-transformer/README.md)       |

## Benchmarks

Typographist is faster than Typograf on the ordinary prose workloads below,
with hyphenation and quotation spacing disabled and comparable symbolic rules
selected in Typograf 7.8.0. These workloads produced identical outputs.

Median milliseconds per call; lower is faster:

| Input                        | Typographist | Typograf | Typographist speedup |
| ---------------------------- | -----------: | -------: | -------------------: |
| English, 15,200 UTF-16 units |        0.407 |    0.638 |                1.57× |
| English, 60,800 UTF-16 units |        1.641 |    2.542 |                1.55× |
| Russian, 16,320 UTF-16 units |        0.848 |    1.223 |                1.44× |
| Russian, 65,280 UTF-16 units |        3.306 |    4.649 |                1.41× |

[Charts](https://elmenov-softworks.github.io/typographist/benchmarks/typograf.html) · [Inputs, settings and raw samples](benchmarks/typograf.json).
This is a symbolic-formatting comparison, not the default profile with soft
hyphens. On the mixed URL/email workloads, Typograf was 1.5–2.2× faster and
outputs differed. Default Typograf also performs cleanup outside our scope.

For hyphenation, Typographist with a warmed 64 MiB cache was faster than
hyphen and Hypher on shared passing workloads. Ratios below are the median of
per-workload library/Typographist times; above one means Typographist is faster.

| Library                  | Knuth–Liang speedup | Khristov speedup | Included workloads |
| ------------------------ | ------------------: | ---------------: | -----------------: |
| hyphen 1.14.1            |               1.22× |            1.30× |              29/29 |
| Hypher 0.2.5             |               1.42× |            1.54× |              16/29 |
| Hyphenopoly 6.1.0 (WASM) |               0.17× |            0.18× |               9/29 |

[Charts](https://elmenov-softworks.github.io/typographist/benchmarks/hyphenation.html) · [Settings and raw samples](benchmarks/hyphenation.json).
Hyphenopoly was faster than Typographist on its nine passing workloads.
Failed preservation checks and unsupported cases are excluded from ratios but
remain in the report. Dictionaries, caches and word-protection policies differ;
passing checks do not establish identical linguistic results. This hyphenation
report measures the earlier cache implementation at the revision recorded in
its JSON, rather than a fresh run of the current source.

Both reports use Node.js 24.21.0 on an Intel Core i5-13420H under Linux/WSL.
Construction and imports are excluded from formatting times. Typograf uses
nine rotated-order batches after ten warm-up calls; the hyphenation comparison
uses seven samples after three preliminary samples, with native external cache
policies. Measurements include JIT, GC and machine-load noise. These are two
recorded runs, not universal rankings or browser measurements.

# Word cache comparison

The full cache and external-library comparison is in
[cache-comparison.html](cache-comparison.html), with raw samples in
[cache-comparison.json](cache-comparison.json) and eight PNG captures in
[cache-screenshots](cache-screenshots/). The earlier two-workload report below
is preserved.

The full run uses the same 29 English and Russian workloads as the earlier
library comparison, under Node 24.21.0. Twelve profiles cover both algorithms
with disabled, initially empty, and warmed caches, plus fresh and warmed native
instances of hyphen 1.14.1, Hypher 0.2.5, and Hyphenopoly 6.1.0. External cache
policies remain native; Hypher has no persistent cache. Every sample uses a fresh
instance. Warmed profiles receive one identical input before the timed call.
Imports and pattern-byte loading are excluded; preparation and cache-populating
time are recorded separately. Three preliminary samples are discarded, then
seven one-call samples retained. Profile order is fixed, so runtime and GC noise
remain possible. Measurements are from one run on this machine.

All six Typographist profiles pass the 29 output checks and equal their own
uncached reference. Hyphen passes all 29. Hypher passes 16 and fails source
preservation on 13 because its native slash handling inserts zero-width spaces.
Hyphenopoly passes 9, fails output checks on 11, and cannot process 9 workloads
with words beyond its 61-character limit. Failed timings remain visible;
unsupported cases have no timing. Neither is included in speed ratios.

Median uncached/cached formatting ratios across the 29 workloads:

| Algorithm   | Empty cache | Warmed cache | Warmed wins |
| ----------- | ----------: | -----------: | ----------: |
| Knuth–Liang |       1.01× |        2.28× |       26/29 |
| Khristov    |       1.19× |        2.24× |       26/29 |

Median library/Typographist ratios on shared passing workloads, with both sides
warmed. Above one means Typographist is faster:

| Library     | Knuth–Liang | Khristov | Included |
| ----------- | ----------: | -------: | -------: |
| hyphen      |       1.22× |    1.30× |    29/29 |
| Hypher      |       1.42× |    1.54× |    16/29 |
| Hyphenopoly |       0.17× |    0.18× |     9/29 |

Each ratio gives included workloads equal weight; it is not a ratio of total
processing time. Coverage differs, dictionaries differ, and Khristov is
heuristic. Passing preservation checks does not establish linguistic equality.
Cold unique-word inputs can incur cache insertion costs. The 64 MiB budget is
an estimate, not a heap measurement. Browser screenshots verify only HTML.

The core was built from `8bdbc45db7c1d9af87cbc446b2740c8846681191`. The report
records a dirty tree because this comparison harness was added after that
commit; the runtime implementation was unchanged.

Reproduce with the commands in [the benchmark guide](../../../../tools/benchmarks/README.md).
HTML has no external resources and can be opened directly. Its filters include
failed output checks so the raw measurements remain inspectable.

## Earlier two-workload run

`comparison.json` contains all samples from Node 24.21.0. The source revision is
caller-supplied; the run used its built core package plus the new benchmark tool.
Historical algorithm reports were not modified.

Inputs are 2,000 occurrences of `extraordinary` (28,000 UTF-16 units), and
2,000 deterministic pseudorandom 12-letter ASCII words (25,999 UTF-16 units).
Both algorithms receive identical inputs. Disabled caching uses 0 MiB; empty
and warmed caching use 64 MiB. Each sample constructs a new instance before
formatting timing. Warmed cases format the same input once before the measured
call. Preparation and cache warm-up have separate samples. Three preliminary
samples per case are discarded; seven measured samples are retained.

Median formatting times in milliseconds:

| Algorithm   | Input    | Disabled | Empty | Warmed |
| ----------- | -------- | -------: | ----: | -----: |
| Knuth–Liang | Repeated |    3.694 | 1.545 |  1.391 |
| Knuth–Liang | Diverse  |    4.865 | 6.709 |  1.553 |
| Khristov    | Repeated |    3.796 | 1.395 |  1.411 |
| Khristov    | Diverse  |    3.586 | 4.272 |  1.591 |

All outputs equal their algorithm's uncached reference. The empty repeated-word
case can reuse results within its first call. The empty diverse-word case includes
entry insertion costs. Fixed measurement order and runtime noise limit comparisons;
these times are observations from one run, with no speedup requirement. The cache
budget estimates retained storage and is not a measured JavaScript heap limit.

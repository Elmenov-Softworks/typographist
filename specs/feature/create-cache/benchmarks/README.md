# Word cache comparison

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

# Typography benchmark results

Measured with Node v24.21.0, ICU 78.3, 13th Gen Intel(R) Core(TM) i5-13420H, on linux 6.18.33.2-microsoft-standard-WSL2. Source commit: `0ee270b797d89c6a83c9eeac1db6329d86440b76`; the working tree was clean when the build and measurements ran. The core was freshly built before this run.

This run includes completed bundled quotation support and CR/LF normalization. Inputs are unchanged from the preceding run; they contain no CR/LF, so this measures the preparation pass on those inputs rather than line-ending-heavy text. It refreshes performance evidence but does not establish final feature acceptance. [Raw results](typography.json) contain full inputs, hashes, samples, environment and procedure. See the [harness documentation](../../../../tools/benchmarks/typography/README.md) for reproduction and limitations.

All times below are medians in milliseconds. Setup constructs a new service with both bundled locales; imports are excluded. English and Russian columns measure repeated calls on long prose after warming the shared instance. Other workloads are recorded in JSON. Each profile has seven samples after three preliminary/warm-up measurements; formatting samples contain five calls each.

| Categories          | Algorithm   | Cache MiB |     Setup |  Long en |  Long ru |
| ------------------- | ----------- | --------: | --------: | -------: | -------: |
| disabled            | knuth-liang |         0 | 12.730495 | 0.000264 | 0.000157 |
| disabled            | knuth-liang |        64 | 13.011863 | 0.000155 | 0.000190 |
| disabled            | khristov    |         0 |  0.311205 | 0.000088 | 0.000094 |
| disabled            | khristov    |        64 |  0.564253 | 0.000092 | 0.000086 |
| hyphenation         | knuth-liang |         0 | 15.968063 | 1.300835 | 2.188379 |
| hyphenation         | knuth-liang |        64 | 14.165038 | 1.064431 | 1.947437 |
| hyphenation         | khristov    |         0 |  0.252694 | 1.309844 | 2.061302 |
| hyphenation         | khristov    |        64 |  0.250487 | 1.062970 | 1.849226 |
| quotes              | knuth-liang |         0 | 12.889112 | 0.940279 | 0.908358 |
| quotes              | knuth-liang |        64 | 13.049695 | 0.849715 | 0.892992 |
| quotes              | khristov    |         0 |  0.236886 | 0.848611 | 0.941853 |
| quotes              | khristov    |        64 |  0.243367 | 0.872198 | 0.952747 |
| nonbreaking-spacing | knuth-liang |         0 | 12.696250 | 0.748306 | 1.663330 |
| nonbreaking-spacing | knuth-liang |        64 | 13.194504 | 0.705014 | 1.690214 |
| nonbreaking-spacing | khristov    |         0 |  0.262486 | 0.736091 | 1.549669 |
| nonbreaking-spacing | khristov    |        64 |  0.259493 | 0.783137 | 1.536985 |
| symbolic            | knuth-liang |         0 | 12.346625 | 1.964318 | 4.737006 |
| symbolic            | knuth-liang |        64 | 12.596889 | 1.969324 | 4.703632 |
| symbolic            | khristov    |         0 |  0.369079 | 1.996319 | 4.671503 |
| symbolic            | khristov    |        64 |  0.293386 | 2.040901 | 4.562140 |
| all                 | knuth-liang |         0 | 16.767602 | 3.529160 | 7.332685 |
| all                 | knuth-liang |        64 | 15.336042 | 3.058024 | 6.951495 |
| all                 | khristov    |         0 |  0.275433 | 3.686164 | 7.184840 |
| all                 | khristov    |        64 |  0.285746 | 3.214134 | 7.119199 |

The complete run covers 24 configurations and 144 configuration/workload pairs. Every pair passed deterministic-output and uncached-equivalence checks, and preserved its original letters, combining marks and digits. Disabled categories returned the exact input. These checks supplement the reference and content-preservation test suite; they do not prove numeric punctuation preservation or linguistic correctness.

Cache settings are approximate configured budgets, not measured heap limits. Heap snapshots cover the whole process without forced GC and include temporary allocations. First calls can reuse words from earlier workloads. Fixed profile order, JIT, GC and system noise prevent general speed claims from one run. No numerical performance target is asserted.

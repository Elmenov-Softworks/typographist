# Typography benchmark results

Measured with Node v24.21.0, ICU 78.3, 13th Gen Intel(R) Core(TM) i5-13420H, on linux 6.18.33.2-microsoft-standard-WSL2. Source commit: `72bd385fdf343503ad968014eaa04c734dfa05d8`; the working tree was clean when the build and measurements ran. The core was freshly built before this run.

This run includes completed bundled quotation support. It refreshes performance evidence but does not establish final feature acceptance. [Raw results](typography.json) contain full inputs, hashes, samples, environment and procedure. See the [harness documentation](../../../../tools/benchmarks/typography/README.md) for reproduction and limitations.

All times below are medians in milliseconds. Setup constructs a new service with both bundled locales; imports are excluded. English and Russian columns measure repeated calls on long prose after warming the shared instance. Other workloads are recorded in JSON. Each profile has seven samples after three preliminary/warm-up measurements; formatting samples contain five calls each.

| Categories          | Algorithm   | Cache MiB |     Setup |  Long en |  Long ru |
| ------------------- | ----------- | --------: | --------: | -------: | -------: |
| disabled            | knuth-liang |         0 | 17.662060 | 0.000270 | 0.000155 |
| disabled            | knuth-liang |        64 | 15.067582 | 0.000157 | 0.000180 |
| disabled            | khristov    |         0 |  0.299800 | 0.000095 | 0.000088 |
| disabled            | khristov    |        64 |  0.252922 | 0.000097 | 0.000088 |
| hyphenation         | knuth-liang |         0 | 18.606219 | 1.371230 | 2.123450 |
| hyphenation         | knuth-liang |        64 | 16.005196 | 1.060075 | 2.043316 |
| hyphenation         | khristov    |         0 |  0.252302 | 1.323653 | 1.988523 |
| hyphenation         | khristov    |        64 |  0.244657 | 1.008144 | 1.826477 |
| quotes              | knuth-liang |         0 | 15.555363 | 0.880352 | 0.957393 |
| quotes              | knuth-liang |        64 | 17.069539 | 0.890710 | 0.924847 |
| quotes              | khristov    |         0 |  0.229552 | 0.924390 | 0.988070 |
| quotes              | khristov    |        64 |  0.312949 | 0.855349 | 0.974704 |
| nonbreaking-spacing | knuth-liang |         0 | 16.790465 | 0.751622 | 1.592489 |
| nonbreaking-spacing | knuth-liang |        64 | 16.699404 | 0.743514 | 1.574247 |
| nonbreaking-spacing | khristov    |         0 |  0.259251 | 0.725365 | 1.606234 |
| nonbreaking-spacing | khristov    |        64 |  0.240777 | 0.738791 | 1.556410 |
| symbolic            | knuth-liang |         0 | 15.932586 | 2.031603 | 4.675071 |
| symbolic            | knuth-liang |        64 | 15.924246 | 1.972464 | 4.477444 |
| symbolic            | khristov    |         0 |  0.281667 | 2.039409 | 4.504489 |
| symbolic            | khristov    |        64 |  0.333325 | 2.081828 | 4.628423 |
| all                 | knuth-liang |         0 | 15.808709 | 3.644387 | 7.466614 |
| all                 | knuth-liang |        64 | 15.601063 | 3.196492 | 6.741699 |
| all                 | khristov    |         0 |  0.280424 | 3.643143 | 7.136104 |
| all                 | khristov    |        64 |  0.268991 | 3.304863 | 7.062415 |

The complete run covers 24 configurations and 144 configuration/workload pairs. Every pair passed deterministic-output and uncached-equivalence checks, and preserved its original letters, combining marks and digits. Disabled categories returned the exact input. These checks supplement the reference and content-preservation test suite; they do not prove numeric punctuation preservation or linguistic correctness.

Cache settings are approximate configured budgets, not measured heap limits. Heap snapshots cover the whole process without forced GC and include temporary allocations. First calls can reuse words from earlier workloads. Fixed profile order, JIT, GC and system noise prevent general speed claims from one run. No numerical performance target is asserted.

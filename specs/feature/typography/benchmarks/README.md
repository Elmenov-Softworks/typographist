# Typography benchmark results

Measured with Node v24.21.0, ICU 78.3, 13th Gen Intel(R) Core(TM) i5-13420H, on linux 6.18.33.2-microsoft-standard-WSL2. Source commit: `2606af97a72d2df69a50eb512208349a4b1df365`; the working tree was dirty because this benchmark slice was uncommitted. The core was freshly built before this run.

This records the currently implemented rules, not final feature acceptance. [Raw results](typography.json) contain full inputs, hashes, samples, environment and procedure. See the [harness documentation](../../../../tools/benchmarks/typography/README.md) for reproduction and limitations.

All times below are medians in milliseconds. Setup constructs a new service with both bundled locales; imports are excluded. English and Russian columns measure repeated calls on long prose after warming the shared instance. Other workloads are recorded in JSON. Each profile has seven samples after three preliminary/warm-up measurements; formatting samples contain five calls each.

| Categories          | Algorithm   | Cache MiB |     Setup |  Long en |  Long ru |
| ------------------- | ----------- | --------: | --------: | -------: | -------: |
| disabled            | knuth-liang |         0 | 19.787628 | 0.000264 | 0.000159 |
| disabled            | knuth-liang |        64 | 16.676290 | 0.000155 | 0.000281 |
| disabled            | khristov    |         0 |  0.328815 | 0.000090 | 0.000090 |
| disabled            | khristov    |        64 |  0.245343 | 0.000090 | 0.000088 |
| hyphenation         | knuth-liang |         0 | 13.566330 | 1.376067 | 2.306099 |
| hyphenation         | knuth-liang |        64 | 16.063274 | 1.047464 | 1.861550 |
| hyphenation         | khristov    |         0 |  0.460585 | 1.404386 | 1.969644 |
| hyphenation         | khristov    |        64 |  0.226481 | 0.960970 | 1.850614 |
| quotes              | knuth-liang |         0 | 11.857022 | 0.000090 | 0.000097 |
| quotes              | knuth-liang |        64 | 11.392513 | 0.000088 | 0.000087 |
| quotes              | khristov    |         0 |  0.237030 | 0.000089 | 0.000089 |
| quotes              | khristov    |        64 |  0.278192 | 0.000088 | 0.000089 |
| nonbreaking-spacing | knuth-liang |         0 | 11.019446 | 0.741847 | 1.554337 |
| nonbreaking-spacing | knuth-liang |        64 | 11.338173 | 0.706932 | 1.595850 |
| nonbreaking-spacing | khristov    |         0 |  0.238952 | 0.710281 | 1.624534 |
| nonbreaking-spacing | khristov    |        64 |  0.240221 | 0.706304 | 1.519534 |
| symbolic            | knuth-liang |         0 | 11.693419 | 1.419303 | 3.880970 |
| symbolic            | knuth-liang |        64 | 11.238879 | 1.450209 | 3.907157 |
| symbolic            | khristov    |         0 |  0.276687 | 1.452593 | 4.033059 |
| symbolic            | khristov    |        64 |  0.234288 | 1.437850 | 4.000176 |
| all                 | knuth-liang |         0 | 15.242463 | 2.968410 | 6.496792 |
| all                 | knuth-liang |        64 | 13.530930 | 3.281172 | 6.568569 |
| all                 | khristov    |         0 |  0.263200 | 2.866780 | 6.373506 |
| all                 | khristov    |        64 |  0.274105 | 2.710663 | 6.132393 |

The complete run covers 24 configurations and 144 configuration/workload pairs. Every pair passed deterministic-output and uncached-equivalence checks, and preserved its original letters, combining marks and digits. Disabled categories returned the exact input. These checks supplement the reference and content-preservation test suite; they do not prove numeric punctuation preservation or linguistic correctness.

Cache settings are approximate configured budgets, not measured heap limits. Heap snapshots cover the whole process without forced GC and include temporary allocations. First calls can reuse words from earlier workloads. Fixed profile order, JIT, GC and system noise prevent general speed claims from one run. No numerical performance target is asserted.

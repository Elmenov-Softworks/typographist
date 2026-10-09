# Symbolic formatting optimization

Measured on Node 24.21.0 against Typograf 7.8.0. The baseline is `9cbda8622f7fa26a206865f578151b933db7fa00`.
The optimized snapshot is identified by source hashes in [the raw comparison](typograf-optimized.json).
[HTML charts](typograf-optimized.html) include baseline and optimized symbolic/full profiles plus selected/default Typograf.

Profiling found these costs:

- Protected segments prepared hyphenation boundaries even when hyphenation was disabled. This scanned and classified every candidate word. Disabled hyphenation now has no finishing stage.
- Enabled hyphenation classified all candidates on the first protected boundary. It now classifies only candidates crossing a boundary and reuses the classification when several boundaries cross one candidate.
- Russian weekday/month range expressions tested Unicode boundaries throughout texts without such ranges. A compiled candidate expression now checks for a range before the original boundary-aware expression runs.
- Quotation nesting iterated over every character in JavaScript. Native `replace` now invokes JavaScript only at relevant quote glyphs.
- Quotation spacing scanned the whole text twice and allocated two full-length byte arrays. Native quote matching now visits relevant boundaries; directional cursors reuse skipped quote runs without those arrays.
- Address detection scanned ordinary characters in JavaScript whenever an address marker existed. Native marker search now locates candidate addresses; local-part, hostname and scheme behavior remains.
- Segment character context used regex matches and temporary arrays. Native `codePointAt` keeps complete surrogate pairs without those matches.

The profile records category measurements and sampled functions in [symbolic-profile.json](symbolic-profile.json).
Those instrumented timings are diagnostic; the table uses a separate run without CPU sampling.

Both libraries received the same inputs. Symbolic profiles exclude hyphenation. Typographist quote-boundary spacing is disabled for this comparison. Typograf enables the 38 Include/Adapt IDs from the current rule inventory, including its normally disabled number-word binding. The selected profiles produce identical output on all prose rows below.

Times are median milliseconds per complete call. Nine rotated-order batches follow ten warmups. Instances and module loading are outside timing. Each call uses the original input. Both baseline/optimized profiles run in the same process, and their output is asserted equal for every workload.

| Workload     | UTF-16 units | Ours baseline | Ours optimized | Typograf selected | Typograf / ours |
| ------------ | -----------: | ------------: | -------------: | ----------------: | --------------: |
| prose-20-en  |        1,900 |         0.102 |          0.054 |             0.099 |           1.85× |
| prose-160-en |       15,200 |         0.771 |          0.407 |             0.638 |           1.57× |
| prose-640-en |       60,800 |         3.063 |          1.641 |             2.542 |           1.55× |
| prose-20-ru  |        2,040 |         0.274 |          0.126 |             0.184 |           1.46× |
| prose-160-ru |       16,320 |         2.003 |          0.848 |             1.223 |           1.44× |
| prose-640-ru |       65,280 |         7.994 |          3.306 |             4.649 |           1.41× |

The mixed address workloads still favor Typograf: 0.685 vs 1.053 ms for English and 1.189 vs 2.629 ms for Russian. Their outputs differ, so these compare different formatting behavior. Our pipeline runs each selected handler on every unprotected segment; those handler calls and segment contexts remain visible in the profile.

Full default formatting includes quote-boundary spacing and warmed Khristov hyphenation with a 64 MiB configured cache. It is a separate workload from Typograf typography. On the longer prose rows, our full profile is approximately 2.5–2.7 times faster than the baseline.

The six-profile run showed a slower full-profile median on mostly-unique English. An isolated repeat with 200 warmups and 15 alternating batches of 100 calls gave 0.685 ms before and 0.681 ms after. The slower result did not reproduce with longer warmup; it is retained in the raw main report.

Validation passed: 2,124 tests in 76 files, workspace build/type checking, ESLint and formatting. One regression test was added for adjacent address boundaries. Temporary differential checks compared 210,112 quote outputs, 250,007 address span results and 324,000 range/service outputs against the baseline. These probes supplement the maintained tests.

The raw JSON reports store full inputs, hashes, settings and timing samples. The optimized comparison and profile also store their temporary harness sources. Reproduction requires Typograf 7.8.0 extracted under `/tmp/typographist-typograf-speed/package` and a build of the baseline copied under `/tmp/typographist-symbolic-profile/baseline-dist`; the harness sources record local paths. No competitor dependency was added to the package.

This is a Node/WSL benchmark, not a browser measurement. Results include JIT, garbage collection and machine-load variation. No memory benchmark or cold-cache comparison was performed.

# Typography acceptance

The approved scope is [spec.md](../spec.md), including the owner correction:
symbolic glyph formatting, prescribed nonbreaking bindings and existing hyphenation.
Letters, case, word order, digits and notation remain unchanged. Existing extra
whitespace, indentation, line endings, trailing whitespace, NBSPs and repeated
punctuation/quotes are preserved. Bindings require same-line content.

The bundle covers ru/en. Quote spacing defaults to U+202F and supports
`spacing: false`. Universal custom rules, typography-only locales, protection,
category selection and both mandatory algorithm datasets remain supported.
No builtin whitespace cleanup, error correction or content conversion is included.

Tests cover:

- Retained glyph/binding rules and their actual boundary cases.
- Preservation fixtures grouped by behavior, without per-rule algorithm/cache matrices.
- Pipeline ordering, URL/email/literal protection and synchronous custom handlers.
- Both algorithms and cache modes in integration tests, plus cache behavior tests.
- Quotation nesting, custom pairs, empty pairs and long repeated sequences.
- Locale registration, configuration errors, snapshotting and rollback.

Intermediate audit notes and superseded passing-test counts were removed. Git retains
implementation history. Historical Typograf comparisons and browser measurements
predate the current scope and are not evidence for the current implementation.

Local cleanup validation on Node v24.21.0 passed 2123 tests across 76 files,
workspace build, typecheck, lint and formatting. The previous suite had 3,608 tests
across 96 files. All 137 preservation inputs were audited; two rule-ID strings
mistakenly included as text fixtures were dropped. The remaining 135 inputs retain
exact-output checks, alongside separate integration and protection regressions.

A temporary deterministic comparison matched old/new quotation output on 210,112
inputs across both locales and seven pair/spacing configurations. This includes
Unicode and long repeated quotation runs. These checks ran outside the test suite
and do not add permanent combinatorial tests.

[Default-format measurements](../benchmarks/scope-cleanup.json) compare this cleanup
against `6469d88` with matched locale, algorithm and cache settings. Nine alternating
samples of ten calls follow ten warmups. Exact output and repeat-pass comparisons
run outside timing. Ordinary prose improved by 1.24–2.48×, quoted prose by 1.73–1.87×,
and address-heavy prose by 1.16–1.25× on these workloads. These are local measurements,
not guarantees for arbitrary inputs. No new browser run was performed.

Publishing remains outside this local task.

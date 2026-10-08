# Typography benchmarks

Build the current core before measuring its public package entry point:

```sh
npm run build --workspace=@elmenov-softworks/typographist
node tools/benchmarks/typography/typography.ts --output /tmp/typographist-benchmarks/typography.json
```

Use the repository's required Node version. No reference library or additional dependency is needed.

The matrix measures disabled categories, hyphenation only, quotes only, nonbreaking spacing only, symbolic typography without hyphenation, and all categories. Each selection runs with both algorithms and with a zero or 64 MiB approximate word-cache budget. Algorithm/cache comparisons use exactly the same categories and inputs. The all profile selects the current default categories explicitly so its workload remains visible in the report.

Each service registers both bundled locales. English and Russian each have long prose, repeated words, and deterministic mostly unique words. Prose includes quotes, dashes, ellipses, protected addresses, Unicode and unchanged numeric notation. Synthetic unique words measure cache behavior, not linguistic accuracy. Full inputs and SHA-256 hashes are saved with the results.

Construction and repeated formatting have separate raw samples and min/median/max timings. Construction excludes module imports and process startup; three preliminary samples are discarded before seven measured samples. The formatter shares one instance across all workloads and languages. First-call timings can reuse earlier words and are not described as empty-cache measurements. Three warm-up calls precede seven samples of five calls each; timings are divided by five. Every call formats the original input, rather than repeatedly feeding output back into the service.

Validation runs outside timed sections. It checks lexical/digit preservation, deterministic output and equality with an uncached service using the same algorithm and categories. The disabled profile must return the exact input. Existing behavior tests remain responsible for reference equivalence, numeric delimiters, grapheme-safe hyphenation and documented second-pass interactions.

The JSON records runtime, ICU, OS, CPU, inputs, repetitions and all results. Supply `--source-commit <full-SHA>` and `--working-tree clean|dirty` to record source provenance; omitted metadata is recorded as `null`. These values describe the build being measured and are supplied by the caller; the tool does not invoke Git or other subprocesses.

Heap snapshots are process-wide observations without forced garbage collection. They include temporary objects and cannot establish retained cache memory, peak allocations or compliance with the approximate memory budget. Fixed profile order, JIT, GC and machine load affect timings; compare runs on the same machine. No numerical performance target is asserted.

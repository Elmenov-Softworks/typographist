# Bounded word cache

Status: Approved by the owner. The owner confirmed this specification and requested a documentation commit.

## Goal and current behavior

Avoid repeating word analysis and hyphenation for words already processed by the same Typographist instance. Support both Knuth–Liang and Khristov without changing their output.

Currently, `TypographistConfig` has no cache option. Each instance prepares its registered algorithms once, but each eligible word passes through `formatWord` again on every occurrence and formatting call. Text scanning checks addresses and exclusions before word formatting. Rules registration compiles replacements before publishing them, so failed replacements preserve the previous service.

## Scope

Add an in-memory LRU word cache and the public constructor option `cacheSize`. Use one budget and one recency policy across all registered languages of an instance. Keep instances independent.

Preserve language coverage, custom rules, `compile(useFast)`, synchronous formatting, exception precedence, break minima, locale typing, and existing error behavior. No persistent storage, CacheStorage, whole-text cache, eager warm-up, public cache management or statistics API, or new runtime dependency is requested. Do not change algorithm rules or existing benchmark snapshots.

## Requirements

### Configuration and memory budget

Extend `TypographistConfig` with optional numeric `cacheSize`, measured in MiB: one unit equals 1,048,576 bytes of estimated cache storage. The default is 64. Positive finite fractional values are valid; zero disables caching. Reject negative, non-finite, and non-number values at initialization. Document the accepted values and default in the public API and README.

The cache starts empty. The configured budget is a ceiling for estimated retained entries, not an immediate allocation or an exact JavaScript heap limit. Use a deterministic storage estimate that accounts for retained word keys, results, rule/locale identity, and entry overhead. Document the estimate and its limits; do not promise identical physical RAM usage across runtimes. Prepared language data and temporary formatting allocations are outside this budget.

Do not retain an entry whose estimate exceeds the entire budget. Formatting must still return its normal result. With caching disabled, bypass cache lookups and retention.

### Entries and LRU behavior

Cache a word's final formatted result after the existing context-sensitive protection checks. Repeated eligible occurrences, including those in later `format` calls, reuse their result and avoid repeated normalization, matching, and break insertion. An unchanged computed result can also be cached.

Identify entries by the exact original word and its registered rule context. Case variants and distinct Unicode representations must not reuse a result containing different original characters. A shared budget must not allow one locale's results to be used for another locale. Avoid ambiguous composite-key collisions.

A successful lookup makes the entry most recently used. New retained entries become most recently used. When an insertion would exceed the budget, evict least recently used entries until it fits. Recency and eviction are global across the instance's languages, rather than separate per-language quotas.

Use facilities available in both supported Node and browser runtimes. Keep ownership explicit and follow the existing module structure. Do not introduce process-wide shared state or expose internal cache entities through the package API.

### Rules lifecycle

After a successful `addRules`, including addition or replacement, clear the entire instance cache. After `removeRules` actually removes a registered locale, clear the entire instance cache. A removal returning `false` changes nothing. Failed compilation, validation, or registration must preserve both the previous rules and cache.

The owner confirmed that dynamic locale changes are rare. Full invalidation is intentional; selective per-language retention is outside scope. Removed locales must still fail lookup even if they had cached results. Re-added or replaced rules must produce results from their new data.

### Output compatibility

Cached and uncached formatting must return identical strings for fixed rules, configuration, and runtime. Preserve original characters, case, Unicode representation, grapheme boundaries, and insertion of U+00AD only. Keep formatting deterministic and idempotent.

A cached ordinary word must not bypass address protection, exact excluded words, identifier handling, unsupported-token preservation, existing soft hyphens, or non-breaking compound handling when later encountered in another context. Preserve the current treatment of visible-hyphen components. Locale validation and input validation still run at their existing boundaries, including calls with empty text.

## Acceptance criteria

- Omitted `cacheSize` enables a 64 MiB estimated budget; explicit positive integer and fractional budgets work. Zero disables the cache. Invalid sizes fail initialization.
- In each algorithm mode, repeated eligible words reuse computation within a call and across calls while producing the uncached output. Include a computed no-break result.
- Case variants, composed/decomposed Unicode, different locales with different results for the same word, and separate instances remain independent.
- A small deterministic budget demonstrates hit-based recency: insert A and B, access A, then insert C so B is evicted. Demonstrate cross-language eviction under the same total budget.
- Estimated retained storage stays within the configured budget. An oversized entry is formatted correctly without retention, and later calls recompute it.
- Successful addition, replacement, and actual removal invalidate all cached languages. Failed replacement and absent-locale removal preserve existing entries. Removed-locale calls fail, and new rules cannot return stale output.
- Regression cases cover a previously cached word inside a protected address, exclusions, unsupported words, exceptions including no-break exceptions, minima, existing soft hyphens, source preservation, and idempotence in both modes.

## Verification

Repository investigation inspected constructor and registry behavior, the text formatting pipeline, and existing public API and word-formatting tests. No implementation checks have been run for this specification-only task.

During implementation, add deterministic behavior tests at the relevant existing boundaries. Verify reuse and eviction with computation instrumentation where appropriate; do not add public APIs solely for tests or rely on garbage collection or exact heap readings.

Run focused cache and formatting tests first, then the applicable project checks under Node 24.21.0:

- `npm run test --workspace=@elmenov-softworks/typographist`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm test`

Compare cache-disabled, initially empty, and warmed runs for both algorithms on identical repeated-word and diverse-word inputs. Report the workload, cache size, warm-up procedure, output equality, and measured times. Keep rule preparation and cache warm-up distinguishable from timed repeated formatting. Do not prescribe a speedup threshold or treat the estimated budget as measured heap usage. Use isolated output paths so historical benchmark reports remain intact.

## Confirmed decisions

The owner selected configurable `cacheSize`, a 64 MiB default, positive fractional values, zero to disable caching, LRU eviction, a shared budget across languages, approximate memory accounting, RAM-only lifetime, and full invalidation after successful rule changes. No unresolved product decisions remain.

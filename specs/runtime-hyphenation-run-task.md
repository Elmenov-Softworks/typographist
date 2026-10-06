# Runtime hyphenation orchestration prompt

Use the prompt below in the session that will start the implementation. The currently inspected runner cannot honor the publication restriction; the preflight must resolve that before launch. This file does not start a run or authorize changes to the external orchestrator.

## Prompt

Implement the approved specification at `specs/runtime-hyphenation.md` in `/home/alex/projects/elmenov-softworks/typographist` using the `run-task` orchestrator. Read the full specification, including its report and execution-authorization sections, and the applicable `AGENTS.md` rules before starting.

First inspect `/home/alex/projects/ai-rules/scripts/run-task.sh`, its coordinator, and its current documented options. Verify that it supports completing local implementation, checks, independent agent review, documentation, and commits, then stopping before every push or remote PR operation for manual owner review. Its previously inspected `--approve` option unconditionally authorized automatic publication; do not use that behavior. If no supported local-only mode or explicit manual publication gate exists, stop before launching and explain the missing capability. Do not invent a flag, rely on worker prose to stop coordinator code, or modify the external runner without a separate instruction.

Once that prerequisite is satisfied, use the supported mode, an existing clean feature branch, the repository above, the approved specification, and GitHub repository `Elmenov-Softworks/typographist`. Preserve unrelated work. Do not discard or stash changes to satisfy preflight. Keep coordinator state and logs locally and report the run directory.

The owner has already authorized implementation within the specification, local debugging scripts, bounded experiments, tests, linters, formatting, type checks, builds, benchmarks, and granular local commits. Do not ask again for these actions or routine internal naming, representation, fixture, and optimization decisions. Workers must follow the coordinator's Git ownership rather than commit independently. Do not reinterpret this authorization as permission to add dependencies, change engineering rules, bypass sandbox restrictions, expand scope, or overwrite unrelated work. Report a concrete blocker when an additional decision or environment permission is actually required.

Prepare a reviewed check configuration outside the working tree, using argument arrays for these existing commands:

- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm test`
- `npm run build`

Complete the additional core-package, consumer, package-content, and benchmark verification required by the specification. The existing GitHub check names are `lint`, `tests`, and `typecheck`; they are relevant only after separately authorized publication. Before publication, report local verification without claiming remote CI success. Do not change the unrelated empty wrapper packages to manufacture passing tests.

Use scoped implementation slices and independent review. Fix task-related failures and review findings within the authorized scope, following the runner's documented recovery procedure; do not waive checks or conceal blockers. Preserve the runtime contracts, approved data sources, and package boundaries. Do not implement DOM/framework wrappers or Khristov in this task.

Produce and commit `specs/runtime-hyphenation-report.md` as required by the specification. Include actual reproducible Node.js measurements of preparation and full-service processing, representative and adversarial datasets, scaling, iteration/warm-up details, environment, measured implementation revision, considered optimizations, check outcomes, and limitations. Keep results current with the final runtime code. No benchmark dependency or comparison with other libraries is required.

At the local handoff, report the completed behavior, commit IDs, checks, benchmark command, a compact table of measured results, report path, and remaining issues. Identify the exact local HEAD for manual review. Stop there. Do not push branches/tags, create/update remote PRs, release packages, or publish documentation. Only a later explicit owner approval after manual review can authorize publication; agent review and this execution instruction do not provide it.

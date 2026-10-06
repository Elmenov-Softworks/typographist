# Runtime hyphenation orchestration prompt

Use the prompt below in the session that will start the implementation. The owner authorized the standard feature-branch push and PR flow. This file does not itself start a run or authorize changes to the external orchestrator.

## Prompt

Implement the approved specification at `specs/runtime-hyphenation.md` in `/home/alex/projects/elmenov-softworks/typographist` using the `run-task` orchestrator. Read the full specification, including its report and execution-authorization sections, and the applicable `AGENTS.md` rules before starting.

Inspect `/home/alex/projects/ai-rules/scripts/run-task.sh` and its current documented options. Launch its standard `--approve` flow on an existing clean feature branch, with the repository above, the approved specification, and GitHub repository `Elmenov-Softworks/typographist`. The owner permits ordinary base-branch merges into the task branch, pushing the task feature branch, and creating/updating its PR after the configured checks and independent agent review. No manual stop before push is required. Preserve unrelated work; do not discard or stash changes to satisfy preflight. Keep coordinator state and logs locally and report the run directory.

The owner has already authorized implementation within the specification, local debugging scripts, bounded experiments, tests, linters, formatting, type checks, builds, benchmarks, and granular local commits. Do not ask again for these actions or routine internal naming, representation, fixture, and optimization decisions. Workers must follow the coordinator's Git ownership rather than commit independently. Do not reinterpret this authorization as permission to add dependencies, change engineering rules, bypass sandbox restrictions, expand scope, or overwrite unrelated work. Report a concrete blocker when an additional decision or environment permission is actually required.

Prepare a reviewed check configuration outside the working tree, using argument arrays for these existing commands:

- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm test`
- `npm run build`

Complete the additional core-package, consumer, package-content, and benchmark verification required by the specification. Configure the existing GitHub check names `lint`, `tests`, and `typecheck` as required checks and wait for their actual results on the reviewed PR head. Before publication, report local verification without claiming remote CI success. Do not change the unrelated empty wrapper packages to manufacture passing tests.

Use scoped implementation slices and independent review. Fix task-related failures and review findings within the authorized scope, following the runner's documented recovery procedure; do not waive checks or conceal blockers. Preserve the runtime contracts, approved data sources, and package boundaries. Do not implement DOM/framework wrappers or Khristov in this task.

Produce and commit `specs/runtime-hyphenation-report.md` as required by the specification. Include actual reproducible Node.js measurements of preparation and full-service processing, representative and adversarial datasets, scaling, iteration/warm-up details, environment, measured implementation revision, considered optimizations, check outcomes, and limitations. Keep results current with the final runtime code. No benchmark dependency or comparison with other libraries is required.

At completion, report the delivered behavior, commit IDs, PR URL and reviewed head, local and GitHub check outcomes, benchmark command, a compact table of measured results, report path, and remaining issues. Leave the PR for manual owner review. Do not merge the PR, push the base branch or tags, release packages, or publish documentation. Report any blocking failure honestly rather than claiming the run completed.

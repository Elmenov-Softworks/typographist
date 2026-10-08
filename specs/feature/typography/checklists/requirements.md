# Specification review checklist

- [x] Record current behavior and the repository baseline.
- [x] Pin the reference package and Spec Kit template revision.
- [x] Catalogue all public reference rules and mark scope exclusions.
- [x] Separate universal locale contracts from optional hyphenation data.
- [x] Include configuration, compatibility, failure, and performance verification scenarios.
- [x] Resolve bundled-locale coverage: Russian and English.
- [x] Exclude content and number conversions from the supported rule scope.
- [x] Record symbolic-only formatting and content-preservation acceptance requirements.
- [x] Obtain owner approval of the final saved draft on 2026-10-08.

These checks describe specification preparation, not implementation or test completion.

## Workspace verification — 2026-10-08

Verified on `feature/typography` at `c5302a39a12a661ce647b3fe5e882cdfe4f6a413`
with Node v24.21.0. The working tree was clean before verification.

| Command                                   | Result                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                | Passed: 57 files, 1,519 tests.                                                                                            |
| `npm run typecheck`                       | Passed; Nx reused cached task results.                                                                                    |
| `NX_SKIP_NX_CACHE=true npm run typecheck` | Passed: root TypeScript check and all five project checks, including the core build prerequisite, without Nx cache reuse. |
| `npm run lint`                            | Passed; the TypeScript resolver emitted its multiple-project performance warning.                                         |
| `npm run format:check`                    | Passed.                                                                                                                   |
| `npm run build`                           | Passed; one of five project tasks reused the Nx cache.                                                                    |
| `NX_SKIP_NX_CACHE=true npm run build`     | Passed: all five projects without Nx cache reuse.                                                                         |

A Node ESM smoke check imported `packages/typographist/dist/index.js` and
passed ten assertions across both algorithms: English and Russian
hyphenation-only outputs, punctuation-only ellipsis formatting without soft
hyphens, and exact input preservation with every category disabled.
This checks emitted import resolution in Node; it is not a browser runtime test.

An additional quotation smoke assertion failed: selecting `categories: ['quotes']`
left `"hello"` unchanged instead of applying English quotation marks.
The registry currently prepares bundled spacing, dash, punctuation and
nonbreaking-spacing rules, but has no bundled quotation handler. TP-R056
(`common/punctuation/quote`) therefore remains unimplemented. The green suite
does not establish quotation acceptance under US1 or FR-003.

Feature acceptance remains open. Implement and verify bundled quotation
behavior, then finish the reference-rule coverage audit. The README now documents
the category default change, hyphenation-only migration, settings, protection and
consumer text locales, and explicitly identifies the missing bundled quote handler.
The existing benchmark report explicitly measures an earlier implementation;
it does not establish performance of the completed feature.

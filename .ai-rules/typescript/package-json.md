# Package Manifest and Scripts

## Field order

Preserve this relative order when fields are present:

1. name
2. version
3. description
4. private
5. type
6. Author, license, repository, and other project metadata
7. exports
8. files
9. engines
10. scripts
11. dependencies
12. peerDependencies
13. devDependencies

Use type: module for new projects. Omit unnecessary fields and do not fabricate metadata.

Do not alphabetically sort dependencies. Group scripts by purpose, not alphabetically.

## Scripts

Use these names where applicable:

- dev
- build
- typecheck
- lint
- lint:fix
- format
- format:check
- test
- test:watch

typecheck checks types without emitting. lint and format:check must not modify files. lint:fix and format explicitly apply fixes.

test runs once and terminates; test:watch is interactive.

Do not add test:coverage or coverage collection by default. Do not add an aggregate check script. CI and hook orchestration belong to separate skills.

Only add commands supported by actual tools. Keep substantial configuration in dedicated files.

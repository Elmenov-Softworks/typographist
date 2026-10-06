# TypeScript Engineering Rules

These rules complement the global engineering rules. New projects must follow them. For existing projects, preserve established tooling and behavior unless the user explicitly requests migration.

The explicitly agreed conventions in these documents are mandatory, not optional style suggestions. Existing-project preservation does not permit unapproved type-safety escapes in newly written code. Detailed Clean Code guidance and examples remain applicable alongside the tooling conventions.

## Supporting rules

Read the relevant supporting documents before working on an area. These are required instructions, not optional background. Do not assume linked files are loaded automatically. For new projects, read the complete set.

- [Code style](typescript/code-style.md)
- [Project structure](typescript/project-structure.md)
- [Dependencies](typescript/dependencies.md)
- [Package manifest and scripts](typescript/package-json.md)
- [TypeScript configuration and builds](typescript/typescript-config.md)
- [ESLint](typescript/eslint.md)
- [Prettier](typescript/prettier.md)
- [Testing](typescript/testing.md)
- [Development workflow](typescript/workflow.md)

## Rules and skills

Rules define required outcomes; skills implement repeatable procedures.

For a new project, use an applicable project-setup skill when available. If unavailable, report that and obtain approval before manual setup. Do not invent a skill name or claim to run a missing skill.

Use the `typescript-project-setup` skill when it is available in the agent's environment. This project-local rules copy does not install shared skills. Locate skills in the installed catalog or the complete ai-rules checkout; do not assume they exist in this repository.

CI, Husky, and publication setup belong to separately requested skills. Do not add these procedures or automation speculatively.

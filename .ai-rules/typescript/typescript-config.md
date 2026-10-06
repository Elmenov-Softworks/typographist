# TypeScript Configuration and Builds

Enable strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride, noFallthroughCasesInSwitch, and verbatimModuleSyntax.

Use import type for type-only imports. Avoid accidental runtime imports.

Let ESLint check unused variables and parameters; do not duplicate checks with noUnusedLocals or noUnusedParameters.

Use noEmit for application type checking when another tool builds the application. Libraries must emit declaration files.

Default to tsc for library builds. Use Rollup or other tooling only for concrete requirements such as additional module formats. Default to Vite for UI builds.

Match target, module, moduleResolution, and lib to the runtime and tooling. Do not use bundler resolution for direct Node.js execution merely to silence errors.

Keep tsconfig.json as the main configuration. Add separate build and test configurations only when their requirements differ.

Verify alias resolution in tests, runtime, and emitted output. Ensure consumers can execute the package's public entry point.

Use TypeScript for executable tool configurations when supported. tsconfig and other tools requiring JSON remain JSON; do not force unsupported formats.

# TypeScript Project Structure

Prefer one entity per file. Small declarations of roughly one to three lines may remain together when separation adds no value.

Use role suffixes where applicable: *.types.ts, *.interfaces.ts, *.util.ts, *.service.ts, *.repository.ts, *.controller.ts, *.constants.ts, *.mapper.ts, and *.factory.ts. Use .util.ts, not .utils.ts.

Non-exported types may stay beside implementation. Move exported type and interface declarations into separate role-specific files. Keep dependencies minimal; separation alone does not prevent cycles.

Group by feature and concept first. Role-based subdirectories within a feature are allowed when useful. Keep utilities close to their semantic owner; avoid dumping grounds.

Prefer Feature-Sliced Design for UI projects, not libraries, packages, or projects without UI. Do not create unused layers to complete a template.

Review directories around 8–12 source files or when unrelated concepts accumulate. These are signals, not limits. Keep nesting meaningful and feature roots easy to scan.

Prefer alias imports for internal modules. Avoid ../../../ chains. Configure aliases consistently for TypeScript, tests, and the build or runtime; TypeScript paths alone do not rewrite emitted imports.

Avoid circular dependencies and imports into another module's private implementation.

Generally avoid barrels. For published npm packages, provide one public entry point and export only the intended API.

Several hundred lines should trigger a responsibility review. Files around 500 lines should be uncommon. Normal application files approaching or exceeding 1000 lines must be decomposed.

Split by meaningful responsibility, not line counts or numbered fragments. Generated code, schemas, migrations, static data, and vendored files may be exceptions.

Improve related overloaded structures safely without unrelated repository-wide refactoring.

## Detailed engineering guidance

## File organization

Keep different responsibilities in separate files when doing so improves navigation and ownership.

Use consistent suffixes for common file roles.

Preferred examples:

```text
user.types.ts
user.interfaces.ts
user.util.ts
user.service.ts
user.repository.ts
user.controller.ts
user.constants.ts
user.mapper.ts
user.factory.ts
```

Types should normally live in `*.types.ts`.

Interfaces should normally live in `*.interfaces.ts`.

Utilities should live in `*.util.ts`, not `*.utils.ts`.

Services should normally live in `*.service.ts`.

Keep related files close to the feature or module they belong to.

Do not create large generic directories containing unrelated project-wide types, utilities, services, or constants when they naturally belong to a feature.

Prefer feature-local organization over dumping everything into global folders.

Do not put unrelated interfaces, types, constants, utility functions, and implementation code into the same file.

Small non-exported declarations may remain next to their implementation when separating them would make navigation worse. Exported types and interfaces must live in separate role-specific files.

File separation exists to make responsibilities clearer, not to maximize file count.

## File size and decomposition

Large source files are a design smell.

A source file approaching several hundred lines should trigger a review of its responsibilities and internal structure.

Files around 500 lines or more should be uncommon and should remain that large only when keeping the code together clearly improves understanding.

Normal application source files approaching or exceeding 1000 lines should be split.

Do not keep a large file intact merely because all of its code belongs to the same broad feature.

Look for meaningful boundaries such as:

- types;
- interfaces;
- services;
- repositories;
- mappers;
- validation;
- serialization;
- API clients;
- orchestration;
- state management;
- utilities;
- domain logic.

Do not split files mechanically by line count.

The extracted file should represent a real concept or responsibility.

Do not create meaningless fragments such as:

```text
user-service-part-1.ts
user-service-part-2.ts
helpers-2.ts
misc-extra.ts
```

merely to reduce line count.

Generated code, schemas, migrations, static data, vendored code, and similar machine-oriented files may be exceptions.

When modifying an already oversized file, avoid adding another substantial responsibility to it when the affected code can be safely separated.

## Imports

Keep imports clear and predictable.

Prefer direct imports from the module that owns the symbol.

Avoid deep imports into another module's internal implementation unless that path is intentionally public.

Avoid circular dependencies.

Keep import paths consistent with the project structure.

Do not reorganize imports manually when the project's formatter or linter already owns that behavior.

Separate import groups visually when the project convention supports it.

For example, external dependencies, internal modules, and local relative imports may form separate groups when that improves scanning.

Do not add meaningless empty lines between individual imports.

## Barrel files

Generally avoid barrel files and automatic index.ts files.

For a published npm package, expose one public entry point. Export only the intended public API, not every internal file.

Avoid barrels that hide ownership, create circular dependencies, expose implementation details, or make symbol origins difficult to identify.

## Utilities

Utilities should be small, focused, and genuinely reusable.

Do not move domain behavior into generic utility files.

If a helper belongs to one feature, keep it inside that feature.

A utility should normally have a clear technical responsibility and minimal domain knowledge.

Avoid large `utils.ts` files containing unrelated functions.

Split utilities by responsibility when necessary.

## Services

A service should represent a meaningful application, domain, or infrastructure responsibility.

Do not turn service files into collections of unrelated operations.

Keep service boundaries coherent.

A service may coordinate several dependencies when coordination is its responsibility.

Do not split a cohesive service into many tiny services merely to satisfy a pattern.

If a service approaches several hundred lines, review whether orchestration, transformation, persistence, external integrations, or validation have been mixed together.

Do not let service files grow beyond 1000 lines in normal application code.

## Interfaces between layers

Do not leak transport-specific or persistence-specific types into unrelated layers without a reason.

Keep external API models, persistence models, and internal domain models separate when they represent different concerns.

Do not create duplicate mapping layers when the shapes are intentionally identical and there is no meaningful boundary to protect.

Mapping should exist because models differ or because the boundary matters, not because architecture diagrams usually contain mappers.

## Directory structure

Organize code by domain, feature, or responsibility first and by file role second.

Do not allow a feature directory to become a large flat list of unrelated files.

A directory should represent one coherent concept or responsibility.

When a directory contains several distinct concepts, split them into subdirectories.

For example, avoid structures like:

```text
analysis/
  analyzer.service.ts
  analyzer.types.ts
  declaration.mapper.ts
  diagnostics.service.ts
  domain.types.ts
  domain.util.ts
  expression-evaluator.service.ts
  flow.interfaces.ts
  member.util.ts
  narrowing.util.ts
  program.factory.ts
  program.interfaces.ts
  range-checker.service.ts
  state.util.ts
  syntax.util.ts
  type-resolver.service.ts
  type-resolver.types.ts
```

Prefer grouping related files by concept:

```text
analysis/
  analyzer/
    analyzer.service.ts
    analyzer.types.ts

  diagnostics/
    diagnostics.service.ts

  domain/
    domain.types.ts
    domain.util.ts
    member.util.ts
    state.util.ts

  evaluator/
    expression-evaluator.service.ts

  flow/
    flow.interfaces.ts

  narrowing/
    narrowing.util.ts

  program/
    program.factory.ts
    program.interfaces.ts

  range/
    range-checker.service.ts

  syntax/
    declaration.mapper.ts
    syntax.util.ts

  type-resolver/
    type-resolver.service.ts
    type-resolver.types.ts
```

The exact grouping depends on actual ownership and dependencies. Do not move files together merely because their names look similar.

### Prefer vertical grouping

Keep the files that implement one concept close to each other.

For example:

```text
user/
  user.service.ts
  user.types.ts
  user.interfaces.ts
  user.mapper.ts
```

is usually preferable to:

```text
services/
  user.service.ts

types/
  user.types.ts

interfaces/
  user.interfaces.ts

mappers/
  user.mapper.ts
```

unless those directories represent meaningful architectural boundaries.

A developer working on one concept should not need to navigate several distant directories for its service, types, interfaces, utilities, and mappers.

### Detect flat-directory growth

Review the structure when a directory:

- contains roughly 8-12 or more source files;
- contains several unrelated filename prefixes;
- contains multiple services for different responsibilities;
- contains many unrelated `*.util.ts` files;
- requires scanning the entire directory to find the files for one concept;
- mixes domain logic, parsing, mapping, state, infrastructure, and orchestration at the same level.

These are signals, not mechanical limits.

Do not wait until a directory contains dozens of files before introducing meaningful subdirectories.

### Keep related files together

Files with the same conceptual owner should normally live together.

For example:

```text
type-resolver/
  type-resolver.service.ts
  type-resolver.types.ts
```

rather than placing both in a large flat parent directory.

The same applies to:

```text
program/
  program.factory.ts
  program.interfaces.ts
```

and similar groups.

### Utilities belong to their owner

Do not accumulate many unrelated utility files in the root of a feature.

Prefer:

```text
domain/
  domain.util.ts
  member.util.ts
```

when those utilities belong to the domain concept.

A utility should live as close as possible to the code that owns its semantics.

Move a utility to a broader shared location only when it is genuinely used across independent concepts.

Do not create generic `utils/`, `helpers/`, or `common/` directories as dumping grounds.

### Subdirectories must have meaning

Do not create a subdirectory for every individual file.

A directory should represent a stable conceptual boundary.

A one-file directory is acceptable when the concept itself is meaningful and is expected to own more implementation, or when the directory establishes an important architectural boundary.

Do not create artificial nesting merely to make the tree look organized.

### Directory depth

Prefer a small number of meaningful nesting levels.

For example:

```text
analysis/
  type-resolver/
    type-resolver.service.ts
    type-resolver.types.ts
```

is clear.

Avoid unnecessary structures such as:

```text
analysis/
  services/
    resolution/
      types/
        internal/
          type-resolver.service.ts
```

unless those levels correspond to real architectural boundaries.

### Feature roots

The root of a feature or module should remain easy to scan.

Prefer keeping only:

- major submodules;
- public entry points;
- module-level configuration;
- a small number of genuinely top-level files.

Do not use the feature root as the default location for every new file.

Before creating a new file, first determine which existing concept owns it.

If no concept owns it, consider whether a new submodule should be created.

### Index files

Avoid index.ts barrels in application code. For published npm packages, use one public entry point.

Do not add `index.ts` to every directory automatically.

An index file should expose the intended public API of a module, not blindly re-export every internal file.

Internal implementation files should remain internal.

### Refactoring existing structure

When working in a directory that has already become flat and difficult to navigate, improve the structure when doing so is reasonably related to the task.

Do not continue adding unrelated files to an already overloaded directory.

Move a coherent group together rather than relocating individual files randomly.

Preserve module boundaries and update imports consistently.

Do not perform a large unrelated repository-wide restructuring during a focused task, but do not use scope control as an excuse to make an obviously bad structure worse.

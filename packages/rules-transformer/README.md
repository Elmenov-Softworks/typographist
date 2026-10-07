# Rules transformer

`@elmenov-softworks/rules-transformer` converts UTF-8 TeX hyphenation tables to
TypeScript locale rules. It is independent of the typography runtime and has
no runtime dependencies.

After globally installing the package, run its bin command directly:

```sh
transform-rules source.tex generated-rules.ts
transform-rules --help
```

The package declares `"bin": { "transform-rules": "./dist/cli.js" }`.
The emitted executable has a Node.js shebang; callers invoke the command without
an explicit interpreter. For a local project installation, the same executable
is available at `node_modules/.bin/transform-rules`.

To install a locally built archive before publication, run from the workspace:

```sh
npm run build --workspace=@elmenov-softworks/rules-transformer
npm pack --workspace=@elmenov-softworks/rules-transformer
npm install --global ./elmenov-softworks-rules-transformer-0.1.0.tgz
transform-rules source.tex generated-rules.ts
```

Input must have one plain `\patterns{...}` block and an optional plain
`\hyphenation{...}` block. This is a converter for pattern tables, not a general
TeX interpreter. Invalid syntax fails before writing the destination. Input and
output must be different files; an existing destination is replaced. Its parent
directory must already exist.

Output exports frozen `patterns` and `exceptions` arrays for use in a
`TypographistRules` plugin. Exception hyphens become UTF-16 offsets; an entry
without hyphens prevents breaks. Source comments, including copyright and
permission notices, are retained.

The package also exports `transformRulesFile` for the repository's regeneration
helper. [Bundled table regeneration](../../tools/rules-transformer/README.md)
verifies retained byte lengths and SHA-256 hashes before converting the sources.

Build, typecheck, lint and test use the shared workspace tooling. Run them with
`npm run <command> --workspace=@elmenov-softworks/rules-transformer`.

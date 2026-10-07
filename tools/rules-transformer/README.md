# Bundled locale rule regeneration

The CLI implementation lives in
[`@elmenov-softworks/rules-transformer`](../../packages/rules-transformer/README.md).
Its installable bin command is `transform-rules source.tex generated-rules.ts`.
This tools directory contains only the repository's pinned-source helper.

From the repository root, regenerate English and Russian tables with:

```sh
npm run build --workspace=@elmenov-softworks/rules-transformer
node tools/rules-transformer/regenerate-bundled.ts
```

The helper checks byte lengths and SHA-256 against
`packages/typographist/locale-rules/provenance.json`, uses the converter's public
package entry point, and formats generated files with the workspace's existing
Prettier dependency. The standalone CLI accepts other sources without requiring
them to appear in this manifest.

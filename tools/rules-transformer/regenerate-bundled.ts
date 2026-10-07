import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';

import { format } from 'prettier';

import provenance from '../../packages/typographist/locale-rules/provenance.json' with { type: 'json' };
import { transformRulesFile } from '@elmenov-softworks/rules-transformer';

const packageRoot = new URL('../../packages/typographist/', import.meta.url);

for (const input of provenance.files) {
  const source = new URL(`locale-rules/${input.file}`, packageRoot);
  const bytes = await readFile(source);

  if (bytes.length !== input.bytes || createHash('sha256').update(bytes).digest('hex') !== input.sha256) {
    throw new Error(`Pinned source checksum or byte length mismatch: ${input.file}`);
  }

  const name = input.file.replace(/^hyph-/u, '').replace(/\.tex$/u, '');
  const destination = new URL(`src/languages/bundled/${name}-data.constants.ts`, packageRoot);
  const result = await transformRulesFile(fileURLToPath(source), fileURLToPath(destination));
  const generated = await readFile(destination, 'utf8');

  await writeFile(
    destination,
    await format(generated, {
      parser: 'typescript',
      singleQuote: true,
      printWidth: 120,
      trailingComma: 'all',
    }),
  );
  console.log(`${input.file}: ${String(result.patterns)} patterns, ${String(result.exceptions)} exceptions`);
}

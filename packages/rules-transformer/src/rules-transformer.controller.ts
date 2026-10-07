import { readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { parseTexRules } from '@/tex/parse-tex-rules.util.js';
import { renderRules } from '@/typescript/render-rules.util.js';

export const transformRulesFile = async (input: string, output: string) => {
  const sourcePath = await realpath(input);
  const destinationPath = await realpath(output).catch((error: unknown) => {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return resolve(output);
    }

    throw error;
  });

  if (sourcePath === destinationPath) {
    throw new RangeError('Input and output must be different files');
  }

  const bytes = await readFile(sourcePath);
  const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const rules = parseTexRules(source);

  await writeFile(destinationPath, renderRules(rules));

  return { patterns: rules.patterns.length, exceptions: rules.exceptions.length };
};

import { readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { parseTexRules } from '#src/tex/parse-tex-rules.util.js';
import { renderRules } from '#src/typescript/render-rules.util.js';

/**
 * Converts a UTF-8 TeX rules file into TypeScript arrays and resolves with pattern and exception counts.
 * Requires one nonempty plain patterns block and at most one hyphenation block; retains source comment notices.
 * Creates or overwrites the output after parsing succeeds. Rejects invalid sources, paths to the same underlying file,
 * and file system errors; the destination's parent directory must already exist.
 *
 * @example
 * await transformRulesFile('./hyph-ru.tex', './ru-data.constants.ts');
 */
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

  const [sourceFile, destinationFile] = await Promise.all([
    stat(sourcePath),
    stat(destinationPath).catch((error: unknown) => {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return null;
      }

      throw error;
    }),
  ]);

  if (destinationFile !== null && sourceFile.dev === destinationFile.dev && sourceFile.ino === destinationFile.ino) {
    throw new RangeError('Input and output must be different files');
  }

  const bytes = await readFile(sourcePath);
  const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const rules = parseTexRules(source);

  await writeFile(destinationPath, renderRules(rules));

  return { patterns: rules.patterns.length, exceptions: rules.exceptions.length };
};

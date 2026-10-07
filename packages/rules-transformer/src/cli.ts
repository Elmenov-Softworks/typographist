#!/usr/bin/env node
import { parseArgs } from 'node:util';

import { transformRulesFile } from '@/rules-transformer.controller.js';

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { help: { type: 'boolean', short: 'h' } },
  });

  if (values.help) {
    console.log('Usage: transform-rules <source.tex> <destination.ts>');
  } else {
    const [input, output] = positionals;

    if (positionals.length !== 2 || input === undefined || output === undefined) {
      throw new TypeError('Usage: transform-rules <source.tex> <destination.ts>');
    }

    const result = await transformRulesFile(input, output);
    console.log(`${String(result.patterns)} patterns, ${String(result.exceptions)} exceptions -> ${output}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

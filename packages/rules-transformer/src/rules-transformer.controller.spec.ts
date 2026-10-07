import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { transformRulesFile } from '@/rules-transformer.controller.js';
import { parseTexRules } from '@/tex/parse-tex-rules.util.js';

describe('rules transformer', () => {
  it('converts patterns and exceptions, preserving source notices and Unicode offsets', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'rules-transformer-'));
    const input = join(directory, 'input.tex');
    const output = join(directory, 'output.ts');

    try {
      await writeFile(input, '% Copyright example\n\\patterns{a1b b2c}\n\\hyphenation{a-bcd present 𐐀-bc}');

      expect(await transformRulesFile(input, output)).toEqual({ patterns: 2, exceptions: 3 });
      const generated = await readFile(output, 'utf8');

      expect(generated).toContain('// Copyright example');
      expect(generated).toContain("'a1b'");
      expect(generated).toContain("word: 'abcd', positions: Object.freeze([1])");
      expect(generated).toContain("word: 'present', positions: Object.freeze([])");
      expect(generated).toContain("word: '𐐀bc', positions: Object.freeze([2])");
      expect(await readFile(input, 'utf8')).toContain('\\patterns');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('rejects malformed sources before overwriting output, and rejects overwriting the input', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'rules-transformer-'));
    const input = join(directory, 'input.tex');
    const output = join(directory, 'output.ts');

    try {
      await writeFile(input, '\\patterns{1}');
      await writeFile(output, 'previous output');

      await expect(transformRulesFile(input, output)).rejects.toThrow();
      expect(await readFile(output, 'utf8')).toBe('previous output');
      await expect(transformRulesFile(input, input)).rejects.toThrow('different files');

      await writeFile(input, new Uint8Array([0xff]));

      await expect(transformRulesFile(input, output)).rejects.toThrow();
      expect(await readFile(output, 'utf8')).toBe('previous output');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('accepts a patterns-only source and rejects ambiguous or nested blocks', () => {
    expect(parseTexRules('\\patterns{a1b}').exceptions).toEqual([]);
    expect(() => parseTexRules('\\patterns{a1b} \\patterns{b1c}')).toThrow();
    expect(() => parseTexRules('\\patterns{a1b {b1c}}')).toThrow();
    expect(() => parseTexRules('\\patterns{a1b} \\hyphenation{a--b}')).toThrow();
  });
});

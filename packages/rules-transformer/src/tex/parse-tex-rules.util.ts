import { validatePatterns } from '@/tex/validate-patterns.util.js';

const extractBlock = (source: string, command: string) => {
  const blocks = Array.from(source.matchAll(new RegExp(String.raw`\\${command}\s*\{([^{}]*)\}`, 'gu')));
  const block = blocks[0]?.[1];
  const commands = Array.from(source.matchAll(new RegExp(String.raw`\\${command}\b`, 'gu')));

  if (command === 'hyphenation' && blocks.length === 0 && !source.includes('\\hyphenation')) {
    return [];
  }

  if (commands.length !== 1 || blocks.length !== 1 || block === undefined || /[\\{}]/u.test(block)) {
    throw new TypeError(`Expected one plain ${command} block`);
  }

  return block.trim() === '' ? [] : block.trim().split(/\s+/u);
};

export const parseTexRules = (source: string) => {
  const stripped = source.replace(/%[^\n]*/gu, '');
  const patterns = extractBlock(stripped, 'patterns');

  if (patterns.length === 0) {
    throw new TypeError('The patterns block must not be empty');
  }

  validatePatterns(patterns);

  const exceptions = extractBlock(stripped, 'hyphenation').map((entry) => {
    if (!/^[\p{L}]+(?:-[\p{L}]+)*$/u.test(entry)) {
      throw new TypeError(`Unsupported exception syntax: ${entry}`);
    }

    const positions: number[] = [];
    let word = '';

    for (const symbol of entry) {
      if (symbol === '-') {
        positions.push(word.length);
      } else {
        word += symbol;
      }
    }

    return { word, positions };
  });
  const notices = source
    .split(/\r\n|[\n\r\u2028\u2029]/u)
    .filter((line) => /^\s*%/u.test(line))
    .map((line) => line.replace(/^\s*% ?/u, ''));

  return { patterns, exceptions, notices };
};

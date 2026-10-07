import { parseTexRules } from '@/tex/parse-tex-rules.util.js';

describe('TeX pattern validation', () => {
  it.each(['12a', '.', '.1.', 'a..b', 'ab.c', 'a\u0000b', 'a\\macro'])('rejects invalid pattern %j', (pattern) => {
    expect(() => parseTexRules(`\\patterns{${pattern}}`)).toThrow();
  });

  it('retains anchored patterns, duplicate keys and literal compound characters', () => {
    expect(parseTexRules('\\patterns{.a1b a2b a1b a1-1b b1c.}').patterns).toEqual([
      '.a1b',
      'a2b',
      'a1b',
      'a1-1b',
      'b1c.',
    ]);
  });
});

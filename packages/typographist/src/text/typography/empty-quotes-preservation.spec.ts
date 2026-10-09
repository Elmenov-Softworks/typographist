import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('empty quotation preservation for %s', (locale) => {
  describe.each([false, true])('spacing=%s', (spacing) => {
    it.each([false, true])('preserves native and custom pairs with default profile=%s', (defaultProfile) => {
      const native = locale === 'ru' ? { left: '«', right: '»' } : { left: '“', right: '”' };

      for (const pair of [native, { left: '「', right: '」' }, { left: '|', right: '|' }]) {
        const instance = new Typographist({
          locale,
          ...(defaultProfile ? {} : { categories: ['quotes'] }),
          settings: { 'common/punctuation/quote': { ...pair, spacing } },
        });

        for (const whitespace of ['', ' ', '   ', '\t', ' \t ', '\u00a0', '\u202f', ' \r ', ' \n ', ' \r\n ']) {
          const empty = pair.left + whitespace + pair.right;

          for (const input of [empty, `\t ${empty} \t\r\n`]) {
            expect(instance.format(input)).toBe(input);
            expect(instance.format(instance.format(input))).toBe(input);
          }
        }
      }
    });
  });

  it('keeps content bindings inside nested native and custom pairs', () => {
    const native = locale === 'ru' ? { left: '«„', right: '»“' } : { left: '“‘', right: '”’' };

    for (const pair of [native, { left: '「『', right: '」』' }]) {
      const instance = new Typographist({
        locale,
        categories: ['quotes'],
        settings: { 'common/punctuation/quote': pair },
      });
      const input = `${pair.left.charAt(0)} ${pair.left.charAt(1)} cat ${pair.right.charAt(1)} ${pair.right.charAt(0)}`;
      const expected = `${pair.left.charAt(0)}\u202f${pair.left.charAt(1)}\u202fcat\u202f${pair.right.charAt(1)}\u202f${pair.right.charAt(0)}`;

      expect(instance.format(input)).toBe(expected);
      expect(instance.format(expected)).toBe(expected);
    }
  });
});

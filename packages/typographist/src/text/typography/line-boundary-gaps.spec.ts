import { Typographist } from '@/index.js';

describe('symbolic gaps require same-line content', () => {
  it.each(['en', 'ru'] as const)('preserves indentation before prose dashes in %s', (locale) => {
    for (const profile of [{}, { categories: ['dashes'] }] as const) {
      const service = new Typographist({ locale, ...profile });

      for (const lineBreak of ['', '\r', '\n', '\r\n', '\u2028', '\u2029']) {
        for (const indentation of ['  ', '\t ', ' \t ', '\u00a0 ', '\u202f ']) {
          for (const dash of ['—', '-', '--', '–']) {
            for (const suffix of [' ', '  ', ' \r\n', ' cat']) {
              const input = (lineBreak ? 'cat' + lineBreak : '') + indentation + dash + suffix;
              const expected = (lineBreak ? 'cat' + lineBreak : '') + indentation + '—' + suffix;

              expect(service.format(input)).toBe(expected);
              expect(service.format(expected)).toBe(expected);
            }
          }
        }
      }

      expect(service.format('cat  - dog')).toBe('cat \u00a0— dog');
      expect(service.format('cat\t - dog')).toBe('cat\t\u00a0— dog');
      expect(service.format('cat\u00a0— dog')).toBe('cat\u00a0— dog');
    }
  });

  it.each(['en', 'ru'] as const)('preserves whitespace-only boundaries with default quote spacing in %s', (locale) => {
    const pair = locale === 'ru' ? { left: '«', right: '»' } : { left: '“', right: '”' };
    const service = new Typographist({ locale, categories: ['quotes'] });

    for (const gap of [' ', '   ', ' \r', ' \n', '  \r\n', ' \t', ' \u00a0', ' \u202f']) {
      for (const input of [pair.left + gap, gap + pair.right, pair.left + gap + '\r\ncat\r\n' + gap + pair.right]) {
        expect(service.format(input)).toBe(input);
        expect(service.format(service.format(input))).toBe(input);
      }
    }
  });

  it.each(['en', 'ru'] as const)('preserves native and custom quotation boundaries in %s', (locale) => {
    const native = locale === 'ru' ? { left: '«', right: '»' } : { left: '“', right: '”' };

    for (const pair of [native, { left: '「', right: '」' }]) {
      for (const spacing of [true, false]) {
        const service = new Typographist({
          locale,
          categories: ['quotes'],
          settings: { 'common/punctuation/quote': { ...pair, spacing } },
        });

        for (const gap of [' ', '   ', ' \r', '  \n', ' \r\n', ' \t', '  \t']) {
          for (const input of [
            pair.left + gap,
            gap + pair.right,
            pair.left + gap + 'cat' + gap + pair.right,
            pair.left + gap + '\r\ncat\r\n' + gap + pair.right,
          ]) {
            const expected =
              spacing && /^[ \t]+$/.test(gap) && input.includes('cat') && !input.includes('\n')
                ? pair.left +
                  '\u202f' +
                  gap.slice(1) +
                  'cat' +
                  (gap.endsWith(' ') ? gap.slice(0, -1) + '\u202f' : gap) +
                  pair.right
                : input;

            expect(service.format(input)).toBe(expected);
            expect(service.format(expected)).toBe(expected);
          }
        }
      }
    }
  });

  it.each([false, true])('preserves direct-speech trailing gaps with useFast=%s', (useFast) => {
    for (const cacheSize of [0, 1]) {
      for (const profile of [{}, { categories: ['dashes'] }] as const) {
        const service = new Typographist({ locale: 'ru', useFast, cacheSize, ...profile });

        for (const dash of ['—', '-', '--']) {
          for (const suffix of [' ', '   ', ' \r', ' \n', '  \r\n', ' \t', '  \tcat', '\u00a0\r\n']) {
            for (const [prefix, boundPrefix] of [
              ['', ''],
              ['cat! ', 'cat!\u00a0'],
            ] as const) {
              const input = prefix + dash + suffix;
              const expected = boundPrefix + '—' + suffix;

              expect(service.format(input)).toBe(expected);
              expect(service.format(expected)).toBe(expected);
            }
          }
        }

        expect(service.format('—   cat')).toBe('—\u00a0  cat');
        expect(service.format('cat! —  cat')).toBe('cat!\u00a0—\u00a0 cat');
      }
    }
  });

  it('does not bind whitespace next to protected content', () => {
    const input = '« \r\ncat\r\n »\r\n— \r\n';
    const service = new Typographist({ locale: 'ru', protectedContent: ['cat'] });

    expect(service.format(input)).toBe(input);
    expect(service.format(service.format(input))).toBe(input);
  });

  it.each(['en', 'ru'] as const)('requires real targets in analogous nonbreaking bindings in %s', (locale) => {
    const service = new Typographist({ locale, categories: ['nonbreakingSpacing'] });
    const prefixes = locale === 'ru' ? ['в', 'ООО', 'мкр-н', 'литер', '§', '¶', '№'] : ['a', 'the', '§', '¶'];

    for (const prefix of prefixes) {
      for (const gap of [' ', '   ', ' \r', ' \n', '  \r\n', ' \t', '  \tcat']) {
        const input = prefix + gap;

        expect(service.format(input)).toBe(input);
        expect(service.format(service.format(input))).toBe(input);
      }
    }
  });
});

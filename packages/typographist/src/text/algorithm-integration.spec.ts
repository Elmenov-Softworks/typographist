import { Typographist, TypographistRules } from '@/index.js';

describe.each([
  { profile: 'default', config: {} },
  { profile: 'hyphenation only', config: { categories: ['hyphenation'] as const } },
])('public text guarantees with $profile', ({ config }) => {
  describe.each([false, true])('public text guarantees with useFast=%s', (useFast) => {
    describe.each([0, 64])('with cacheSize=%s', (cacheSize) => {
      it('preserves protected tokens and unsupported complete words', () => {
        const instance = new Typographist({ useFast, cacheSize, ...config });
        const text =
          'bananaж ba\u0301nana ba\u200dnana ba\ud800nana ba\u00adnana banana123 banana_name bananaName banana\u2011banana first.last+tag@banana.com https://banana.com';

        expect(instance.format(text)).toBe(text);
      });

      it.each([
        { text: 'banana123', protectedContent: ['123'] },
        { text: '123banana', protectedContent: ['123'] },
        { text: 'banana_name', protectedContent: ['_'] },
        { text: 'bananaName', protectedContent: ['N'] },
        { text: 'banana\u00adbanana', protectedContent: ['\u00ad'] },
        { text: 'bananabanana', protectedContent: ['na'] },
        { text: 'banana\u2011banana', protectedContent: ['\u2011'] },
      ])('preserves complete excluded candidates around $protectedContent', ({ text, protectedContent }) => {
        const instance = new Typographist({
          useFast,
          cacheSize,
          ...config,
          protectedContent,
          excludedWords: ['bananabanana'],
        });

        expect(instance.format(text)).toBe(text);
        const ordinary = new Typographist({ useFast, cacheSize, ...config }).format('computer');

        expect(ordinary).toContain('\u00ad');
        expect(instance.format('computer')).toBe(ordinary);
        expect(instance.format(text)).toBe(text);
      });

      it.each([
        { text: 'bananaж', protectedContent: ['ж'] },
        { text: 'жbanana', protectedContent: ['ж'] },
        { text: 'banana\u0301', protectedContent: ['\u0301'] },
        { text: 'banana\u0301banana', protectedContent: ['\u0301'] },
        { text: 'banana\u200dbanana', protectedContent: ['\u200d'] },
        { text: 'banana\u200cbanana', protectedContent: ['\u200c'] },
        { text: 'banana\ud800banana', protectedContent: ['\ud800'] },
        { text: 'banana\udc00banana', protectedContent: ['\udc00'] },
        { text: 'banana𐐀banana', protectedContent: ['𐐀'] },
      ])('preserves unsupported complete candidates around $protectedContent', ({ text, protectedContent }) => {
        const configuration = { useFast, cacheSize, ...config };
        const unprotected = new Typographist(configuration);
        const instance = new Typographist({ ...configuration, protectedContent });

        expect(unprotected.format(text)).toBe(text);
        expect(instance.format(text)).toBe(text);
        expect(instance.format(text)).toBe(text);

        const ordinary = unprotected.format('computer');

        expect(ordinary).toContain('\u00ad');
        expect(instance.format('computer')).toBe(ordinary);
      });

      it('keeps exact exclusions case-sensitive across protected fragments', () => {
        const instance = new Typographist({
          useFast,
          cacheSize,
          ...config,
          protectedContent: ['X'],
          excludedWords: ['bananaXbanana'],
        });

        expect(instance.format('bananaXbanana')).toBe('bananaXbanana');
        expect(instance.format('BANANAXBANANA')).toBe('BA\u00adNANAXBA\u00adNANA');
      });

      it('snapshots exclusions and processes visible-hyphen components', () => {
        const excludedWords = ['banana'];
        const instance = new Typographist({ useFast, cacheSize, ...config, excludedWords });
        excludedWords.push('BANANA');
        const broken = 'BA\u00adNANA';
        const text = 'banana-BANANA ba\u00adnana 😀';
        const output = instance.format(text);

        expect(output).toBe(`banana-${broken} ba\u00adnana 😀`);
        expect(output.replaceAll('\u00ad', '')).toBe(text.replaceAll('\u00ad', ''));
        expect(instance.format(output)).toBe(output);
      });

      it('maps normalized exceptions and filters expansion boundaries in original graphemes', () => {
        const shared = {
          locale: 'custom',
          alphabet: 'i\u0307bcё',
          leftMin: 1,
          rightMin: 1,
          exceptions: [
            { word: 'i\u0307bcb', positions: [2, 3] },
            { word: 'bёbc', positions: [2] },
            { word: 'bёbё', positions: [] },
          ],
        };
        const rules = new TypographistRules({
          standard: { ...shared, patterns: ['b1ё'] },
          fast: { ...shared, vowels: 'iё', consonants: '\u0307bc', specialLetters: '' },
        });
        const instance = new Typographist({ useFast, cacheSize, ...config, locale: 'custom', rules: [rules] });

        expect(instance.format('İbcb bе\u0308bc BЁBЁ')).toBe('İ\u00adb\u00adcb bе\u0308\u00adbc BЁBЁ');
        expect(instance.format('bе\u0308\u0301bc')).toBe('bе\u0308\u0301bc');
      });
    });
  });
});

it('snapshots fast data and preserves instance isolation through replacement and removal', () => {
  const positions = [3];
  const fast = {
    locale: 'custom',
    alphabet: 'abc',
    leftMin: 1,
    rightMin: 1,
    vowels: 'a',
    consonants: 'bc',
    specialLetters: '',
    exceptions: [{ word: 'bacaba', positions }],
  };
  const standard = { locale: 'custom', alphabet: 'abc', leftMin: 1, rightMin: 1, patterns: [] };
  const rules = new TypographistRules({ standard, fast });
  const first = new Typographist({ useFast: true, locale: 'custom', rules: [rules] });
  const second = new Typographist({ useFast: true, locale: 'custom', rules: [rules] });
  fast.vowels = 'b';
  fast.consonants = 'ac';
  positions[0] = 2;
  fast.exceptions.length = 0;

  expect(first.format('baba bacaba')).toBe('ba\u00adba bac\u00adaba');
  first.addRules(rules);

  expect(first.format('baba')).toBe('baba');
  expect(second.format('baba bacaba')).toBe('ba\u00adba bac\u00adaba');
  fast.vowels = 'ab';

  expect(() => {
    first.addRules(rules);
  }).toThrow(TypeError);
  expect(first.format('baba')).toBe('baba');
  expect(first.removeRules('custom')).toBe(true);
  expect(second.format('baba')).toBe('ba\u00adba');
});

import { Typographist, TypographistRules } from '@/index.js';

describe.each([false, true])('public text guarantees with useFast=%s', (useFast) => {
  it('preserves protected tokens and unsupported complete words', () => {
    const instance = new Typographist({ useFast });
    const text =
      'bananaж ba\u0301nana ba\u200dnana ba\ud800nana ba\u00adnana banana123 banana_name bananaName banana\u2011banana first.last+tag@banana.com https://banana.com';

    expect(instance.format(text)).toBe(text);
  });

  it('snapshots exclusions and processes visible-hyphen components', () => {
    const excludedWords = ['banana'];
    const instance = new Typographist({ useFast, excludedWords });
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
    const instance = new Typographist({ useFast, locale: 'custom', rules: [rules] });

    expect(instance.format('İbcb bе\u0308bc BЁBЁ')).toBe('İ\u00adb\u00adcb bе\u0308\u00adbc BЁBЁ');
    expect(instance.format('bе\u0308\u0301bc')).toBe('bе\u0308\u0301bc');
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

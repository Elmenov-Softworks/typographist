import { Typographist, TypographistRules } from '@/index.js';
import * as wordFormatting from '@/text/word-breaks/format-word.util.js';
import type { TextRule } from '@/text/typography/text-rule.types.js';

const rules = (locale = 'en', positions: readonly number[] = [2]) => {
  const common = {
    locale,
    alphabet: 'abcё',
    leftMin: 2,
    rightMin: 2,
    exceptions: [
      { word: 'bacaba', positions },
      { word: 'bёba', positions: [2] },
      { word: 'caca', positions: [] },
    ],
  };

  return new TypographistRules({
    standard: { ...common, patterns: ['a1b'] },
    fast: { ...common, vowels: 'aё', consonants: 'bc', specialLetters: '' },
  });
};

afterEach(() => vi.restoreAllMocks());

describe.each([false, true])('word cache with useFast=%s', (useFast) => {
  it('invalidates shared entries after typography-only locale addition, replacement, and removal', () => {
    const compute = vi.spyOn(wordFormatting, 'formatWord');
    const instance = new Typographist({
      useFast,
      rules: [rules(), rules('ru')],
    });
    const binding: TextRule = {
      id: 'custom/binding',
      category: 'nonbreakingSpacing',
      order: 1,
      defaults: {},
      prepare: () => (text) => text.replaceAll('  ', '\u00a0'),
    };
    const warm = () => {
      expect(instance.format('bacaba')).toBe('ba\u00adcaba');
      expect(instance.format('bacaba', 'ru')).toBe('ba\u00adcaba');
    };

    warm();
    warm();
    expect(compute).toHaveBeenCalledTimes(2);

    instance.addTextLocale({ locale: 'custom', textRules: [binding] });
    expect(instance.format('Abc  Abc', 'custom')).toBe('Abc\u00a0Abc');
    warm();
    expect(compute).toHaveBeenCalledTimes(4);

    instance.addTextLocale({ locale: 'custom', textRules: [] });
    expect(instance.format('Abc  Abc', 'custom')).toBe('Abc  Abc');
    warm();
    expect(compute).toHaveBeenCalledTimes(6);

    expect(instance.removeRules('custom')).toBe(true);
    expect(() => instance.format('', 'custom')).toThrow('Unregistered locale');
    warm();
    expect(compute).toHaveBeenCalledTimes(8);
  });

  it('preserves typography and warm entries when replacement preparation fails', () => {
    const compute = vi.spyOn(wordFormatting, 'formatWord');
    const binding: TextRule = {
      id: 'custom/binding',
      category: 'nonbreakingSpacing',
      order: 1,
      defaults: {},
      prepare: () => (text) => text.replaceAll('  ', '\u00a0'),
    };
    const instance = new Typographist({
      useFast,
      rules: [rules(), rules('ru')],
      textLocales: [{ locale: 'custom', textRules: [binding] }],
    });
    instance.format('bacaba');
    instance.format('bacaba', 'ru');
    const failing: TextRule = {
      ...binding,
      prepare: () => {
        throw new Error('Typography preparation failed');
      },
    };

    expect(() => {
      instance.addTextLocale({ locale: 'custom', textRules: [failing] });
    }).toThrow('Typography preparation failed');
    expect(() => {
      instance.addTextLocale({ locale: 'custom', textRules: [binding, binding] });
    }).toThrow('unique');
    expect(instance.format('Abc  Abc', 'custom')).toBe('Abc\u00a0Abc');
    expect(instance.format('bacaba')).toBe('ba\u00adcaba');
    expect(instance.format('bacaba', 'ru')).toBe('ba\u00adcaba');
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('reuses computed break and no-break results within and across calls', () => {
    const compute = vi.spyOn(wordFormatting, 'formatWord');
    const instance = new Typographist({ useFast, rules: [rules()] });

    expect(instance.format('baba cccc baba cccc')).toBe('ba\u00adba cccc ba\u00adba cccc');
    expect(instance.format('baba cccc')).toBe('ba\u00adba cccc');
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('keeps source representations, locales, and instances independent', () => {
    const compute = vi.spyOn(wordFormatting, 'formatWord');
    const instance = new Typographist({ useFast, rules: [rules(), rules('ru', [3])] });
    const second = new Typographist({ useFast, rules: [rules()] });
    const text = 'bёba bе\u0308ba BЁBA BЕ\u0308BA';
    const output = 'bё\u00adba bе\u0308\u00adba BЁ\u00adBA BЕ\u0308\u00adBA';

    expect(instance.format(text)).toBe(output);
    expect(instance.format(text)).toBe(output);
    expect(compute).toHaveBeenCalledTimes(4);
    expect(instance.format('bacaba')).toBe('ba\u00adcaba');
    expect(instance.format('bacaba', 'ru')).toBe('bac\u00adaba');
    expect(second.format('bacaba')).toBe('ba\u00adcaba');
    expect(compute).toHaveBeenCalledTimes(7);
  });

  it('refreshes hit recency and evicts across registered languages', () => {
    const compute = vi.spyOn(wordFormatting, 'formatWord');
    const instance = new Typographist({ useFast, rules: [rules(), rules('ru')], cacheSize: 270 / 1_048_576 });

    instance.format('baba');
    instance.format('caca', 'ru');
    instance.format('baba');
    instance.format('cccc');
    instance.format('baba');
    expect(compute).toHaveBeenCalledTimes(3);
    instance.format('caca', 'ru');
    expect(compute).toHaveBeenCalledTimes(4);
  });

  it.each([0, 1 / 1_048_576])('recomputes without retention for cacheSize=%s', (cacheSize) => {
    const compute = vi.spyOn(wordFormatting, 'formatWord');
    const instance = new Typographist({ useFast, rules: [rules()], cacheSize });

    expect(instance.format('baba baba')).toBe('ba\u00adba ba\u00adba');
    expect(instance.format('baba')).toBe('ba\u00adba');
    expect(compute).toHaveBeenCalledTimes(3);
  });

  it('invalidates every language after successful addition, replacement, and removal', () => {
    const compute = vi.spyOn(wordFormatting, 'formatWord');
    const instance = new Typographist({ useFast, rules: [rules(), rules('ru')] });
    const warm = () => {
      instance.format('bacaba');
      instance.format('bacaba', 'ru');
    };
    warm();
    warm();
    expect(compute).toHaveBeenCalledTimes(2);

    instance.addRules(rules('de'));
    warm();
    expect(compute).toHaveBeenCalledTimes(4);
    instance.addRules(rules('en', [3]));
    expect(instance.format('bacaba')).toBe('bac\u00adaba');
    expect(instance.format('bacaba', 'ru')).toBe('ba\u00adcaba');
    expect(compute).toHaveBeenCalledTimes(6);
    expect(instance.removeRules('de')).toBe(true);
    warm();
    expect(compute).toHaveBeenCalledTimes(8);

    expect(instance.removeRules('ru')).toBe(true);
    expect(() => instance.format('', 'ru')).toThrow('Unregistered locale');
    instance.addRules(rules('ru', [3]));
    expect(instance.format('bacaba', 'ru')).toBe('bac\u00adaba');
  });

  it('preserves warm entries after absent removal and failed compilation or validation', () => {
    const compute = vi.spyOn(wordFormatting, 'formatWord');
    const instance = new Typographist({ useFast, rules: [rules(), rules('ru')] });
    instance.format('bacaba');
    instance.format('bacaba', 'ru');
    const failing = rules();
    vi.spyOn(failing, 'compile').mockImplementation(() => {
      throw new Error('Compilation failed');
    });

    expect(instance.removeRules('de')).toBe(false);
    expect(() => {
      instance.addRules(failing);
    }).toThrow('Compilation failed');
    expect(() => {
      instance.addRules(rules('invalid locale'));
    }).toThrow(TypeError);
    expect(() => {
      instance.addRules(rules('en', [999]));
    }).toThrow(RangeError);
    expect(instance.format('bacaba')).toBe('ba\u00adcaba');
    expect(instance.format('bacaba', 'ru')).toBe('ba\u00adcaba');
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('matches uncached output through protections, exceptions, minima, and idempotence', () => {
    const options = { useFast, rules: [rules()], excludedWords: ['BABA'] };
    const cached = new Typographist(options);
    const uncached = new Typographist({ ...options, cacheSize: 0 });
    cached.format('baba bacaba caca bёba');
    const text =
      'baba BABA baba@example.com https://baba.com/baba baba123 baba_name babaName baba\u2011baba ' +
      'ba\u00adba baba-baba babaж ba\u0301ba ba\u200dba ba\ud800ba bacaba caca bab bёba bе\u0308ba 😀';
    const output = cached.format(text);

    expect(output).toBe(uncached.format(text));
    expect(output).toContain('ba\u00adba BABA');
    expect(output).toContain('baba@example.com https://baba.com/baba baba123 baba_name babaName baba\u2011baba');
    expect(output).toContain('ba\u00adba-ba\u00adba');
    expect(output).toContain('ba\u00adcaba caca bab bё\u00adba bе\u0308\u00adba');
    expect(output.replaceAll('\u00ad', '')).toBe(text.replaceAll('\u00ad', ''));
    expect(cached.format(output)).toBe(output);
    expect(cached.format('')).toBe('');
    expect(() => {
      Reflect.apply(cached.format.bind(cached), cached, [null]);
    }).toThrow(TypeError);
    expect(() => cached.format('', 'ru')).toThrow('Unregistered locale');
  });
});

import type { ITypographistRules } from '@/rules/typographist-rules.interfaces.js';
import * as api from '@/index.js';
import { Typographist, TypographistRules } from '@/index.js';
import type { CompiledRules } from '@/index.js';
import { locales } from '@/rules/locale.constants.js';

class TestRules extends TypographistRules implements ITypographistRules {
  #rules: CompiledRules;

  constructor(locale: string = 'en', patterns: readonly string[] = ['a1b']) {
    super();
    this.#rules = { locale, alphabet: 'abcdefghijklmnopqrstuvwxyz', leftMin: 1, rightMin: 1, patterns };
  }

  override compile = vi.fn((_useFast: boolean) => this.#rules);
}

describe('public package API', () => {
  it('only offers bundled locales by default', () => {
    const typographist = new Typographist();

    expect(locales).toEqual(['en', 'ru']);
    // @ts-expect-error German has no bundled rules.
    expect(() => typographist.format('abcd', 'de')).toThrow('Unregistered locale');
    // @ts-expect-error The locale alone must not widen the default configuration.
    expect(() => new Typographist({ locale: 'de' })).toThrow('Unregistered locale');
    // @ts-expect-error Only bundled locales are removable on the default instance.
    expect(typographist.removeRules('de')).toBe(false);
  });

  it('infers custom locales from supplied rules and supports declared dynamic locales', () => {
    const rules = new TypographistRules({
      standard: { locale: 'de', alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'] },
    });
    const configured = new Typographist({ locale: 'de', rules: [rules] });
    const dynamic = new Typographist<'de'>();
    dynamic.addRules(rules);

    expect(configured.format('abcd')).toBe('a\u00adbcd');
    expect(dynamic.format('abcd', 'de')).toBe('a\u00adbcd');
    // @ts-expect-error The supplied plugin does not declare French.
    expect(() => configured.format('abcd', 'fr')).toThrow('Unregistered locale');
    expect(dynamic.removeRules('de')).toBe(true);
  });

  it('extends a declared union with both custom locales alongside bundled locales', () => {
    const typographist = new Typographist<'de' | 'zu'>();
    const german = new TypographistRules({
      standard: { locale: 'de', alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'] },
    });
    const zulu = new TypographistRules({
      standard: { locale: 'zu', alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['b1c'] },
    });
    typographist.addRules(german);
    typographist.addRules(zulu);

    expect(typographist.format('abcd', 'de')).toBe('a\u00adbcd');
    expect(typographist.format('abcd', 'zu')).toBe('ab\u00adcd');
    expect(typographist.format('table', 'en')).toBe('ta\u00adble');
    expect(typographist.format('асбест', 'ru')).toBe('ас\u00adбест');
    // @ts-expect-error The union does not declare French rules.
    expect(() => typographist.format('abcd', 'fr')).toThrow('Unregistered locale');
    expect(typographist.removeRules('zu')).toBe(true);
    expect(typographist.removeRules('de')).toBe(true);
  });

  it('exposes two runtime classes and three Typographist methods', () => {
    expect(Object.keys(api).sort()).toEqual(['Typographist', 'TypographistRules']);
    expect(Object.getOwnPropertyNames(Typographist.prototype).sort()).toEqual([
      'addRules',
      'constructor',
      'format',
      'removeRules',
    ]);
    expect(Object.keys(new Typographist())).toEqual([]);
  });

  it.each([false, true])('formats bundled English and Russian with useFast=%s', (useFast) => {
    const typographist = new Typographist({ useFast });

    expect(typographist.format('table TABLE present')).toBe('ta\u00adble TA\u00adBLE present');
    expect(typographist.format('асбест', 'ru')).toBe('ас\u00adбест');
    expect(typographist.format('асбест')).toBe('асбест');
  });

  it('uses the configured default while call overrides remain local to the call', () => {
    const typographist = new Typographist({ locale: 'ru' });

    expect(typographist.format('асбест')).toBe('ас\u00adбест');
    expect(typographist.format('table', 'en')).toBe('ta\u00adble');
    expect(typographist.format('асбест')).toBe('ас\u00adбест');
  });

  it.each([false, true])('compiles plugins once and passes useFast=%s', (useFast) => {
    const rules = new TestRules();
    const typographist = new Typographist({ rules: [rules], useFast });

    expect(typographist.format('Abcd!')).toBe('A\u00adbcd!');
    expect(typographist.format('abcd')).toBe('a\u00adbcd');
    expect(rules.compile).toHaveBeenCalledExactlyOnceWith(useFast);
    expect(() => typographist.format('асбест', 'ru')).toThrow('Unregistered locale');
  });

  it('snapshots exact excluded words and compiled rules', () => {
    const excludedWords = ['abcd'];
    const patterns = ['a1b'];
    const typographist = new Typographist({ excludedWords, rules: [new TestRules('en', patterns)] });
    excludedWords.push('Abcd');
    patterns[0] = 'b1c';

    expect(typographist.format('abcd Abcd')).toBe('abcd A\u00adbcd');
  });

  it('adds, replaces and removes locale rules without affecting other instances', () => {
    const first = new Typographist({ rules: [new TestRules()] });
    const second = new Typographist({ rules: [new TestRules()] });
    first.addRules(new TestRules('de'));

    expect(first.format('abcd', 'de')).toBe('a\u00adbcd');
    expect(() => second.format('abcd', 'de')).toThrow('Unregistered locale');

    first.addRules(new TestRules('en', ['b1c']));

    expect(first.format('abcd')).toBe('ab\u00adcd');
    expect(second.format('abcd')).toBe('a\u00adbcd');
    expect(first.removeRules('de')).toBe(true);
    expect(first.removeRules('de')).toBe(false);
    expect(() => first.format('abcd', 'de')).toThrow('Unregistered locale');
    expect(first.removeRules('en')).toBe(true);
    expect(() => first.format('abcd')).toThrow('Unregistered locale');

    first.addRules(new TestRules());

    expect(first.format('abcd')).toBe('a\u00adbcd');
  });

  it('retains the previous rules when replacement compilation fails', () => {
    const typographist = new Typographist({ rules: [new TestRules()] });

    expect(() => {
      typographist.addRules(new TestRules('en', ['1']));
    }).toThrow();
    expect(typographist.format('abcd')).toBe('a\u00adbcd');
  });

  it('selects mode-specific rule sets and falls back to standard rules', () => {
    const standard: CompiledRules = { locale: 'en', alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'] };
    const fast: CompiledRules = { ...standard, patterns: ['b1c'] };
    const rules = new TypographistRules({ standard, fast });

    expect(new Typographist({ rules: [rules] }).format('abcd')).toBe('a\u00adbcd');
    expect(new Typographist({ rules: [rules], useFast: true }).format('abcd')).toBe('ab\u00adcd');
    expect(new Typographist({ rules: [new TypographistRules({ standard })], useFast: true }).format('abcd')).toBe(
      'a\u00adbcd',
    );
    expect(() => new Typographist({ rules: [new TypographistRules()] })).toThrow('Supply rule sets');
  });

  it('rejects duplicate or missing default locales in configuration', () => {
    expect(() => new Typographist({ rules: [new TestRules(), new TestRules()] })).toThrow('Duplicate locale');
    expect(() => new Typographist<'de'>({ locale: 'de' })).toThrow('Unregistered locale');
    expect(() => new Typographist({ rules: [] })).toThrow('Unregistered locale');
  });

  it.each(['', ' en', 'en ', '-en', 'en-', 'en--US', 'тест'])('rejects invalid locale %j at registration', (locale) => {
    const typographist = new Typographist({ rules: [new TestRules()] });

    expect(() => {
      typographist.addRules(new TestRules(locale));
    }).toThrow(TypeError);
    expect(typographist.format('abcd')).toBe('a\u00adbcd');
  });

  it.each([
    null,
    [],
    { useFast: 'yes' },
    { useFast: null },
    { rules: null },
    { excludedWords: ['word', 1] },
    { locale: 'custom' },
  ])('rejects malformed JavaScript configuration: %j', (config) => {
    expect(() => {
      Reflect.construct(Typographist, [config]);
    }).toThrow();
  });

  it('rejects malformed JavaScript plugins without replacing registered rules', () => {
    const typographist = new Typographist({ rules: [new TestRules()] });
    const rules = new TestRules();
    Reflect.set(rules, 'compile', () => null);

    expect(() => {
      typographist.addRules(rules);
    }).toThrow('compile must return');
    expect(typographist.format('abcd')).toBe('a\u00adbcd');

    Reflect.set(rules, 'compile', () => ({ locale: '', alphabet: 'abcd', patterns: ['a1b'] }));

    expect(() => {
      typographist.addRules(rules);
    }).toThrow('Language identifier');
    expect(typographist.format('abcd')).toBe('a\u00adbcd');
  });

  it('preserves addresses, identifiers and Unicode and stays idempotent', () => {
    const typographist = new Typographist();
    const text = 'TABLE userName ISO9001 a@example.com https://example.com/table 😀 table';
    const output = typographist.format(text);

    expect(output).toBe('TA\u00adBLE userName ISO9001 a@example.com https://example.com/table 😀 ta\u00adble');
    expect(output.replaceAll('\u00ad', '')).toBe(text);
    expect(typographist.format(output)).toBe(output);
    expect(typographist.format('')).toBe('');
  });
});

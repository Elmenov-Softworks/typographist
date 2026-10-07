import { createHyphenator, enUS, prepareKnuthLiang, ru } from '../../index.js';

const algorithm = prepareKnuthLiang([ru, enUS]);
const russian = createHyphenator({ algorithm, defaultLanguage: 'ru' });
const english = createHyphenator({ algorithm, defaultLanguage: 'en-US' });

describe('pinned bundled language data', () => {
  it('matches representative words using the pinned patterns', () => {
    expect(russian.hyphenate('машина ПЕРЕНОС молоко ёлочка')).toBe(
      'ма\u00ADши\u00ADна ПЕ\u00ADРЕ\u00ADНОС мо\u00ADло\u00ADко ёлоч\u00ADка',
    );
    expect(english.hyphenate('hyphenation computer representation')).toBe(
      'hy\u00ADphen\u00ADation com\u00ADputer rep\u00ADre\u00ADsen\u00ADta\u00ADtion',
    );
  });

  it('preserves all converted patterns and source exceptions', () => {
    expect(ru.patterns).toHaveLength(7021);
    expect(ru.exceptions).toHaveLength(184);
    expect(enUS.patterns).toHaveLength(4938);
    expect(enUS.exceptions).toHaveLength(14);
  });

  it('uses source break and no-break exceptions across case variants', () => {
    expect(english.hyphenate('table TABLE present')).toBe('ta\u00ADble TA\u00ADBLE present');
    expect(russian.hyphenate('асбест АСБЕСТ рсфср')).toBe('ас\u00ADбест АС\u00ADБЕСТ рсфср');
  });

  it('maps a canonical spelling through a user exception', () => {
    const service = createHyphenator({
      algorithm,
      defaultLanguage: 'ru',
      languages: { ru: { exceptions: [{ word: 'ёлка', positions: [2] }] } },
    });

    expect(service.hyphenate('е\u0308лка ЁЛКА')).toBe('е\u0308л\u00ADка ЁЛ\u00ADКА');
  });

  it('preserves unsupported complete words and protected tokens', () => {
    const text = 'ма\u0301шина mother\u2011in\u2011law first.last+tag@example-domain.com пе\u00ADренос 😀';

    expect(russian.hyphenate(text)).toBe(text);
    expect(english.hyphenate("don't naïve userName ISO9001")).toBe("don't naïve userName ISO9001");
  });

  it('routes explicit languages and never applies region fallback', () => {
    const service = createHyphenator({
      algorithm,
      defaultLanguage: 'ru',
      wordSelector: (word) => (/^[A-Za-z]+$/u.test(word) ? 'EN-us' : 'ru'),
    });

    expect(service.hyphenate('асбест table')).toBe('ас\u00ADбест ta\u00ADble');
    expect(russian.hyphenate('table', { language: 'en-us' })).toBe('ta\u00ADble');
    expect(() => english.hyphenate('', { language: 'en-GB' })).toThrow(RangeError);
  });

  it('keeps bundled data immutable and allows replacing it with a custom plugin', () => {
    expect(Object.isFrozen(ru)).toBe(true);
    expect(Object.isFrozen(ru.patterns)).toBe(true);
    expect(Object.isFrozen(ru.exceptions?.[0]?.positions)).toBe(true);
    const replacement = prepareKnuthLiang([{ ...enUS, patterns: [], exceptions: [] }]);
    const service = createHyphenator({ algorithm: replacement, defaultLanguage: 'en-US' });

    expect(service.hyphenate('table')).toBe('table');
    expect(english.hyphenate('table-table')).toBe('ta\u00ADble-ta\u00ADble');
    expect(english.hyphenate(english.hyphenate('table-table'))).toBe('ta\u00ADble-ta\u00ADble');
  });
});

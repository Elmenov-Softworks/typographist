import { Typographist, TypographistRules } from '@/index.js';
import { createBundledRules } from '@/rules/bundled/bundled-rules.js';
import { patterns as ruPatterns, exceptions as ruExceptions } from '@/languages/bundled/ru-data.constants.js';
import { patterns as enPatterns, exceptions as enExceptions } from '@/languages/bundled/en-us-data.constants.js';

const typographist = new Typographist();

describe('pinned bundled language data', () => {
  it('matches representative words using the pinned patterns', () => {
    expect(typographist.format('машина ПЕРЕНОС молоко ёлочка', 'ru')).toBe(
      'ма\u00adши\u00adна ПЕ\u00adРЕ\u00adНОС мо\u00adло\u00adко ёлоч\u00adка',
    );
    expect(typographist.format('hyphenation computer representation')).toBe(
      'hy\u00adphen\u00adation com\u00adputer rep\u00adre\u00adsen\u00adta\u00adtion',
    );
  });

  it('preserves all converted patterns and source exceptions', () => {
    expect(ruPatterns).toHaveLength(7021);
    expect(ruExceptions).toHaveLength(184);
    expect(enPatterns).toHaveLength(4938);
    expect(enExceptions).toHaveLength(14);
  });

  it('uses source break and no-break exceptions across case variants', () => {
    expect(typographist.format('table TABLE present')).toBe('ta\u00adble TA\u00adBLE present');
    expect(typographist.format('асбест АСБЕСТ рсфср', 'ru')).toBe('ас\u00adбест АС\u00adБЕСТ рсфср');
  });

  it('preserves unsupported complete words and protected tokens', () => {
    const text = 'ма\u0301шина mother\u2011in\u2011law first.last+tag@example-domain.com пе\u00adренос 😀';

    expect(typographist.format(text, 'ru')).toBe(text);
    expect(typographist.format("don't naïve userName ISO9001")).toBe("don't naïve userName ISO9001");
  });

  it('keeps data immutable and replaces locale rules independently', () => {
    const english = createBundledRules()[0];
    if (english === undefined) throw new Error('Missing bundled English rules');
    const fast = english.compile(true);
    if (!('vowels' in fast)) throw new Error('Missing bundled English Khristov rules');
    const replacement = new TypographistRules({
      fast,
      standard: { ...english.compile(false), patterns: [], exceptions: [] },
    });
    const instance = new Typographist();
    instance.addRules(replacement);

    expect(Object.isFrozen(enPatterns)).toBe(true);
    expect(Object.isFrozen(enExceptions[0]?.positions)).toBe(true);
    expect(instance.format('table')).toBe('table');
    expect(instance.format('асбест', 'ru')).toBe('ас\u00adбест');
    expect(typographist.format('table-table')).toBe('ta\u00adble-ta\u00adble');
    expect(typographist.format(typographist.format('table-table'))).toBe('ta\u00adble-ta\u00adble');
  });
});

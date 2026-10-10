import { Typographist } from '@/index.js';
import { createBundledTextRules } from '@/text/typography/bundled-text-rules.factory.js';
import type { TextRule } from '@/text/typography/text-rule.types.js';

describe('bundled rule ordering', () => {
  it.each(['en', 'ru'] as const)('runs quotation settings before ellipsis conversion for %s', (locale) => {
    const instance = new Typographist({
      locale,
      categories: ['quotes', 'punctuation'],
      settings: { 'common/punctuation/quote': { spacing: false, left: '...', right: '...' } },
    });

    expect(instance.format('"""word"""')).toBe('…word…');
  });

  it('preserves repeated punctuation produced by quotation settings', () => {
    const instance = new Typographist({
      locale: 'en',
      categories: ['quotes', 'punctuation'],
      settings: { 'common/punctuation/quote': { spacing: false, left: '!', right: '?' } },
    });

    expect(instance.format('""word""')).toBe('!!word??');
  });

  it('retains consumer registration order at equal priority after bundled rules', () => {
    const rules: TextRule[] = ['first', 'second'].map((id) => ({
      id,
      category: 'punctuation',
      order: 410,
      defaults: {},
      prepare: () => (text) => `${text} ${id}`,
    }));
    const instance = new Typographist({ categories: ['punctuation'], textRules: rules });

    expect(instance.format('word...')).toBe('word… first second');
    expect(createBundledTextRules('en', rules).slice(-2)).toEqual(rules);
  });
});

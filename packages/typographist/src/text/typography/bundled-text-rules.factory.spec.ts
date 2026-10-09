import { readFileSync } from 'node:fs';
import { Typographist } from '@/index.js';
import { createBundledTextRules } from '@/text/typography/bundled-text-rules.factory.js';
import type { TextRule } from '@/text/typography/text-rule.types.js';

const inventory = readFileSync(
  new URL('../../../../../specs/feature/typography/typograf-rule-inventory.md', import.meta.url),
  'utf8',
);
const referenceIds = [
  ...new Set(
    [...inventory.matchAll(/^\| TP-R\d+\s*\| `([^`]+)`/gm)].map((match) => match[1]).filter((id) => id !== undefined),
  ),
];

describe('complete bundled reference ordering', () => {
  it.each(['en', 'ru'] as const)('audits every assembled equal-priority group for %s', (locale) => {
    const rules = createBundledTextRules(locale);
    const extensions = ['common/dash/minus'];

    expect(rules.filter((rule) => !referenceIds.includes(rule.id)).map((rule) => rule.id)).toEqual(extensions);

    for (const priority of new Set(rules.map((rule) => rule.order))) {
      const ids = rules
        .filter((rule) => rule.order === priority && !extensions.includes(rule.id))
        .map((rule) => rule.id);
      const expected = referenceIds.filter((id) => ids.includes(id));

      expect(ids, `priority ${String(priority)}`).toEqual(expected);
    }
  });

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

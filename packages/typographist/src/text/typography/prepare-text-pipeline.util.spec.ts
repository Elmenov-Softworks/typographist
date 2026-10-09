import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import type { TextRule } from '@/text/typography/text-rule.types.js';

const spacing: TextRule = {
  id: 'custom/spacing',
  category: 'spacing',
  order: 10,
  defaults: { separator: ' ' },
  prepare: (settings) => {
    const separator = settings.separator;

    if (typeof separator !== 'string') {
      throw new TypeError('separator must be a string');
    }

    return (text) => text.replace(/ {2,}/g, separator);
  },
};

describe('prepared text pipeline', () => {
  it('supports a custom locale without hyphenation data and prepares once', () => {
    const prepare = vi.fn(spacing.prepare);
    const format = prepareTextPipeline([{ ...spacing, locales: ['custom'], prepare }], 'custom', {
      categories: ['spacing'],
    });

    expect(format('A  B')).toBe('A B');
    expect(format('C  D')).toBe('C D');
    expect(prepare).toHaveBeenCalledTimes(1);
  });

  it('filters categories and locales without preparing disabled rules', () => {
    const prepare = vi.fn(spacing.prepare);
    const rule = { ...spacing, locales: ['custom'], prepare };

    expect(prepareTextPipeline([rule], 'custom', { categories: [] })('A  B')).toBe('A  B');
    expect(prepareTextPipeline([rule], 'en')('A  B')).toBe('A  B');
    expect(prepare).not.toHaveBeenCalled();
  });

  it('orders rules by priority and keeps registration order for ties', () => {
    const rule = (id: string, order: number, from: string, to: string) => {
      const definition: TextRule = {
        id,
        order,
        category: 'punctuation',
        defaults: {},
        prepare: () => (text) => text.replaceAll(from, to),
      };

      return definition;
    };
    const format = prepareTextPipeline(
      [rule('second', 2, '!', '?'), rule('third', 2, '?', '…'), rule('first', 1, '.', '!')],
      'custom',
    );

    expect(format('.')).toBe('…');
  });

  it('preserves addresses and overlapping literal protected content', () => {
    const rule: TextRule = {
      ...spacing,
      prepare: () => (text) => text.replaceAll('-', '—'),
    };
    const format = prepareTextPipeline([rule], 'custom', {
      categories: ['spacing'],
      protectedContent: ['a-b-c', 'b-c', '😀-x'],
    });

    expect(format('a-b-c - https://site.test/a-b x-y@mail.test - 😀-x')).toBe(
      'a-b-c — https://site.test/a-b x-y@mail.test — 😀-x',
    );
  });

  it('supplies complete original token context after earlier handlers change segment length', () => {
    const before = `${'𐐀'.repeat(2000)}\u00ad+1`;
    const after = `3/4\u00ad${'é'.repeat(2000)}`;
    const seen: string[][] = [];
    const inspect: TextRule = {
      ...spacing,
      id: 'custom/context',
      order: 20,
      prepare: () => (text, context) => {
        seen.push([context?.precedingToken ?? '', context?.followingToken ?? '']);

        return text;
      },
    };
    const format = prepareTextPipeline([{ ...spacing, prepare: () => () => '!' }, inspect], 'custom', {
      categories: ['spacing'],
      protectedContent: [before, after],
    });

    expect(format(`${before}-2${after}`)).toBe(`${before}!${after}!`);
    expect(seen).toEqual([
      [before, after],
      [`${before}-2${after}`, ''],
    ]);
  });

  it('copies settings and protected content during preparation', () => {
    const settings = { separator: '\u00a0' };
    const protectedContent = ['A  B'];
    const format = prepareTextPipeline([spacing], 'custom', {
      categories: ['spacing'],
      settings: { 'custom/spacing': settings },
      protectedContent,
    });
    settings.separator = '!';
    protectedContent.length = 0;

    expect(format('A  B C  D')).toBe('A  B C\u00a0D');
  });

  it('rejects duplicate IDs, unknown settings, and mismatched setting types', () => {
    expect(() => prepareTextPipeline([spacing, spacing], 'custom')).toThrow('unique');
    expect(() => prepareTextPipeline([spacing], 'custom', { settings: { missing: {} } })).toThrow('Unknown');
    expect(() =>
      prepareTextPipeline([spacing], 'custom', {
        settings: { 'custom/spacing': { missing: true } },
      }),
    ).toThrow('Invalid setting');
    expect(() =>
      prepareTextPipeline([spacing], 'custom', {
        settings: { 'custom/spacing': { separator: false } },
      }),
    ).toThrow('Invalid setting');
  });

  it('rejects asynchronous or non-string handler results', () => {
    const prepare = vi.fn().mockReturnValue(() => Promise.resolve('text'));
    const format = prepareTextPipeline([{ ...spacing, prepare }], 'custom', { categories: ['spacing'] });

    expect(() => format('text')).toThrow('synchronously');
  });

  it('preserves empty, whitespace, and Unicode text with disabled rules', () => {
    const format = prepareTextPipeline([spacing], 'custom', { categories: [] });

    for (const text of ['', ' \r\n\t', '😀 e\u0301 $100 1.25 1/2 2026-10-08']) {
      expect(format(text)).toBe(text);
    }
  });
});

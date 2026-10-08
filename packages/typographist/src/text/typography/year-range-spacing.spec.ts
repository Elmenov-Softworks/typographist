import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('Russian year-range spacing', () => {
  const id = 'ru/nbsp/years';
  const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, 'ru');

  it.each(['-', '--', '‒', '–', '—'])('preserves range glyph %s and abbreviation spelling', (dash) => {
    for (const label of ['г', 'г.', 'гг.', 'г.г.', 'г г.', 'г. г.', 'г.\u00a0г.']) {
      for (const space of ['', ' ', '\u00a0']) {
        const expected = `2025${dash}2026\u00a0${label}`;

        expect(format(`2025${dash}2026${space}${label}`)).toBe(expected);
        expect(format(expected)).toBe(expected);
      }
    }
  });

  it.each([
    '',
    ' \r\n\t',
    '2025−2026 г.',
    '2025-2026 ГГ.',
    '2025-2026 год',
    '2025-2026\tг.',
    '2025-2026  г.',
    '12025-2026 г.',
    '2025-2026гx',
    '2026-10-08',
    '$100 100 руб. 12345 1.25 1/2 +7-999-123-45-67 word word MiXeD мiкс',
  ])('preserves unsupported input %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('matches reference boundaries without rewriting the label', () => {
    expect(format('😀2025-2026г., 2027-2028гг.!\r\n2029-2030 г.г.')).toBe(
      '😀2025-2026\u00a0г., 2027-2028\u00a0гг.!\r\n2029-2030\u00a0г.г.',
    );
    expect(rules).toHaveLength(1);
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledNonbreakingSpacing('en').some((rule) => rule.id === id)).toBe(false);
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
  });

  it('respects categories and protected content', () => {
    const text = '2025-2026 г.г.';
    const service = new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'], protectedContent: [text] });

    expect(service.format(`${text} https://example.com/2025-2026г. user2025-2026г@example.com`)).toBe(
      `${text} https://example.com/2025-2026г. user2025-2026г@example.com`,
    );
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format(text)).toBe(text);
    }
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('2025–2026\u00a0г.\u00a0г. примеры');

    expect(service.format('2025-2026  г.г. примеры')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

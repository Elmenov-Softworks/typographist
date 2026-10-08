import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/nbsp/page';
const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian page-reference spacing', () => {
  it.each([
    ['стр. 12', 'стр. 12'],
    ['ГЛ.12', 'ГЛ. 12'],
    ['рис.   001', 'рис. 001'],
    ['ил. 2, илл. 3', 'ил. 2, илл. 3'],
    ['ст. 4; п. 5: c. 6!', 'ст. 4; п. 5: c. 6!'],
    [')стр. 12?', ')стр. 12?'],
    ['😀 стр. 12\r\nе́ РИС. 34\n', '😀 стр. 12\r\nе́ РИС. 34\n'],
  ])('changes only whitespace in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each([
    '',
    ' \r\n\t',
    'стр.',
    'стр. слово',
    'стр 12',
    'стр.\t12',
    'стр.\n12',
    'стр. 12',
    '(стр. 12)',
    'астр. 12',
    'стр. 12а',
    'стр. 12)',
    'стр. 1/2',
    'стр. 1-2',
    'стр. 2026-10-08',
    'с. 12',
  ])('preserves negative boundary %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('preserves reference matching for adjacent references', () => {
    const first = format('стр. 1 стр. 2 стр. 3');

    expect(first).toBe('стр. 1 стр. 2 стр. 3');
    expect(format(first)).toBe('стр. 1 стр. 2 стр. 3');
  });

  it('preserves numeric and lexical representations', () => {
    const text = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 слово слово MiXeD';

    expect(format(text)).toBe(text);
  });

  it('rejects settings and supplies no implicit rule to other locales', () => {
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    for (const locale of ['en', 'custom']) {
      expect(createBundledNonbreakingSpacing(locale).some((rule) => rule.id === id)).toBe(false);
    }
  });

  it('respects categories and protected content', () => {
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format('стр. 12')).toBe('стр. 12');
    }
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['стр. 12'],
    });

    expect(service.format('стр. 12 рис. 34, https://example.com/стр.12 name@example.com')).toBe(
      'стр. 12 рис. 34, https://example.com/стр.12 name@example.com',
    );
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика стр. 12345');

    expect(service.format('Типографика стр.  12345')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

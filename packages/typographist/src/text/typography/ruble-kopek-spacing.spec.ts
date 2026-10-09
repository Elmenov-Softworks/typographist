import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/nbsp/rubleKopek';
const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian ruble and kopek label spacing', () => {
  it.each([
    ['100 руб. 25 коп.', '100 руб. 25 коп.'],
    ['001руб. 02коп.', '001 руб. 02 коп.'],
    ['1.25руб. 1/2коп.', '1.25 руб. 1/2 коп.'],
    ['-100 руб., +25 коп.!', '-100 руб., +25 коп.!'],
    ['123456руб.коп.', '123456 руб.коп.'],
    ['a1руб. x2коп.', 'a1 руб. x2 коп.'],
    ['10 руб.лей 20 коп.ейка', '10 руб.лей 20 коп.ейка'],
    ['😀 100руб.\r\nе́ 25коп.\n', '😀 100 руб.\r\nе́ 25 коп.\n'],
    ['100 руб. 25 коп.', '100 руб. 25 коп.'],
  ])('changes only whitespace in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each([
    '',
    ' \r\n\t',
    'руб. коп.',
    '100 руб 25 коп',
    '100 РУБ. 25 Коп.',
    '100  руб. 25  коп.',
    '100\tруб. 25\nкоп.',
    '100\rруб. 25\u202fкоп.',
    '$100 100 рубль 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 слово слово MiXeD',
  ])('preserves negative boundary %j', (text) => {
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
      expect(new Typographist({ locale: 'ru', categories }).format('100руб.')).toBe('100руб.');
    }
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['100руб.'],
      excludedWords: ['коп'],
    });

    expect(service.format('100руб. 25коп. https://example.com/10руб. 20@example.com')).toBe(
      '100руб. 25 коп. https://example.com/10руб. 20@example.com',
    );
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика 100 руб. 25 коп.');

    expect(service.format('Типографика 100 руб. 25коп.')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

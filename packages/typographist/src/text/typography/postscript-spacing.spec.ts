import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/nbsp/ps';
const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian postscript spacing', () => {
  it.each([
    ['P.S. text', 'P. S. text'],
    ['p. s.: text', 'p. s.: text'],
    ['P.P.S. text', 'P. P. S. text'],
    ['p. P. s.: text', 'p. P. s.: text'],
    ['з.ы. текст', 'з. ы. текст'],
    ['З. з. Ы.: текст', 'З. з. Ы.: текст'],
    ['😀\r\nP.S. text е́', '😀\r\nP. S. text е́'],
    ['P. S. text', 'P. S. text'],
    ['P.S. one P.P.S. two', 'P. S. one P. P. S. two'],
  ])('changes only whitespace in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each([
    '',
    ' \r\n\t',
    'P.S.',
    'P.S.:',
    'P.S.\ntext',
    '(P.S. text',
    'xP.S. text',
    'P.  S. text',
    'P.\tS. text',
    'P.S text',
    'P.S.:text',
    'P.\u202fS. text',
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
      expect(new Typographist({ locale: 'ru', categories }).format('P.S. text')).toBe('P.S. text');
    }
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['P.S. protected'],
    });

    expect(service.format('P.S. protected P.S. text https://example.com/P.S. user@example.com')).toBe(
      'P.S. protected P. S. text https://example.com/P.S. user@example.com',
    );
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('P. S.: Типографика');

    expect(service.format('P. S.: Типографика')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

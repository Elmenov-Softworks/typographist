import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/nbsp/centuries';
const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian century-label spacing', () => {
  it.each([
    ['XV в.', 'XV в.'],
    ['XVв', 'XV в'],
    ['XV в!', 'XV в!'],
    ['XV-XVI вв.', 'XV-XVI вв.'],
    ['XV--XVIв.в.', 'XV--XVI в.в.'],
    ['XV‒XVI в. в.', 'XV‒XVI в. в.'],
    ['XV–XVI в в', 'XV–XVI в в'],
    ['XV—XVI в', 'XV—XVI в'],
    ['XV − XVI в.', 'XV − XVI в.'],
    ['😀 XV в.\r\nXIX в.', '😀 XV в.\r\nXIX в.'],
    ['е́ XV в., XIX в.', 'е́ XV в., XIX в.'],
  ])('changes only whitespace in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each(['', ' \r\n\t', 'XV В.', 'xv в.', 'XV вв.', 'XV в. далее', 'XV  в.', 'XV\tв.', '(XV в.)', 'L в.', 'AXV в.'])(
    'preserves negative boundary %j',
    (text) => {
      expect(format(text)).toBe(text);
    },
  );

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
      expect(new Typographist({ locale: 'ru', categories }).format('XV в.')).toBe('XV в.');
    }
    const service = new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'], protectedContent: ['XV в.'] });

    expect(service.format('XV в. XIX в., https://example.com/XVв. XVв.@example.com')).toBe(
      'XV в. XIX в., https://example.com/XVв. XVв.@example.com',
    );
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика XV в.');

    expect(service.format('Типографика XV в.')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

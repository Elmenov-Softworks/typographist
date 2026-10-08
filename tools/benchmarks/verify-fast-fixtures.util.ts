import assert from 'node:assert/strict';

import type { BenchmarkLocale, TextFormatter } from './benchmark.types.ts';

const fixtures: readonly (readonly [BenchmarkLocale, string, string])[] = [
  ['ru', 'машина', 'ма|ши|на'],
  ['ru', 'молоко', 'мо|ло|ко'],
  ['ru', 'ёлочка', 'ёлоч|ка'],
  ['ru', 'майка', 'май|ка'],
  ['ru', 'пальма', 'паль|ма'],
  ['ru', 'объём', 'объ|ём'],
  ['ru', 'подъезд', 'подъ|езд'],
  ['ru', 'сестра', 'сест|ра'],
  ['ru', 'отстранять', 'отс|тра|нять'],
  ['ru', 'поэт', 'по|эт'],
  ['ru', 'поэзия', 'по|эзия'],
  ['ru', 'какао', 'ка|као'],
  ['ru', 'аист семья взгляд агентство', 'аист семья взгляд агентство'],
  ['ru', 'вьюга', 'вь|юга'],
  ['ru', 'е\u0308лочка', 'е\u0308лоч|ка'],
  ['en', 'hyphenation', 'hyp|he|na|tion'],
  ['en', 'computer', 'com|pu|ter'],
  ['en', 'representation', 'rep|re|sen|ta|tion'],
  ['en', 'banana', 'ba|nana'],
  ['en', 'yellow', 'yel|low'],
  ['en', 'syllable', 'syl|lable'],
  ['en', 'beautiful', 'be|auti|ful'],
  ['en', 'queue', 'qu|eue'],
  ['en', 'astray', 'ast|ray'],
  ['en', 'speak lead extra rhythm myth strengths', 'speak lead extra rhythm myth strengths'],
  ['en', 'table present', 'ta|ble present'],
];

export const verifyFastFixtures = (format: TextFormatter) => {
  for (const [locale, input, marked] of fixtures) {
    const expected = marked.replaceAll('|', '\u00ad');

    assert.equal(format(input, locale), expected, `Fast fixture: ${locale}, ${input}`);
    assert.equal(format(input.toUpperCase(), locale), expected.toUpperCase());
  }

  for (const locale of ['en', 'ru'] as const) {
    const protectedText =
      'first.last+tag@example-domain.com https://example.com/typography userName ISO9001 пе\u00adренос ма\u0301шина';

    assert.equal(format(protectedText, locale), protectedText);
  }
};

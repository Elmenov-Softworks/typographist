import { prepareKhristov } from '@/algorithms/khristov/prepare-khristov.factory.js';
import { englishKhristovRules, russianKhristovRules } from '@/languages/bundled/khristov-data.constants.js';
import { createHyphenator } from '@/text/create-hyphenator.factory.js';

const english = createHyphenator({
  algorithm: prepareKhristov(englishKhristovRules),
  excludedWords: new Set<string>(),
});
const russian = createHyphenator({
  algorithm: prepareKhristov(russianKhristovRules),
  excludedWords: new Set<string>(),
});

describe('bundled Khristov data', () => {
  it.each([
    ['машина', 'ма|ши|на'],
    ['молоко', 'мо|ло|ко'],
    ['ёлочка', 'ёлоч|ка'],
    ['майка', 'май|ка'],
    ['пальма', 'паль|ма'],
    ['объём', 'объ|ём'],
    ['подъезд', 'подъ|езд'],
    ['сестра', 'сест|ра'],
    ['отстранять', 'отс|тра|нять'],
    ['поэт', 'по|эт'],
    ['поэзия', 'по|эзия'],
    ['какао', 'ка|као'],
    ['аист', 'аист'],
    ['семья', 'семья'],
    ['взгляд', 'взгляд'],
    ['агентство', 'агентство'],
    ['вьюга', 'вь|юга'],
    ['е\u0308лочка', 'е\u0308лоч|ка'],
  ])('formats Russian %s with the selected special-letter classification', (word, expected) => {
    expect(russian.hyphenate(word)).toBe(expected.replaceAll('|', '\u00ad'));
    expect(russian.hyphenate(word.toUpperCase())).toBe(expected.toUpperCase().replaceAll('|', '\u00ad'));
  });

  it.each([
    ['hyphenation', 'hyp|he|na|tion'],
    ['computer', 'com|pu|ter'],
    ['representation', 'rep|re|sen|ta|tion'],
    ['banana', 'ba|nana'],
    ['yellow', 'yel|low'],
    ['syllable', 'syl|lable'],
    ['beautiful', 'be|auti|ful'],
    ['queue', 'qu|eue'],
    ['astray', 'ast|ray'],
    ['speak', 'speak'],
    ['lead', 'lead'],
    ['extra', 'extra'],
    ['rhythm', 'rhythm'],
    ['myth', 'myth'],
    ['strengths', 'strengths'],
    ['table', 'ta|ble'],
    ['present', 'present'],
  ])('formats English %s with y classified as a vowel', (word, expected) => {
    expect(english.hyphenate(word)).toBe(expected.replaceAll('|', '\u00ad'));
    expect(english.hyphenate(word.toUpperCase())).toBe(expected.toUpperCase().replaceAll('|', '\u00ad'));
  });

  it.each([english, russian])('preserves protected spelling and remains idempotent', (engine) => {
    const protectedText =
      'ма\u0301шина naïve first.last+tag@example-domain.com userName ISO9001 mother\u2011in\u2011law пе\u00adренос';
    const text = 'hyphenation table машина ёлочка';
    const formatted = engine.hyphenate(text);

    expect(engine.hyphenate(protectedText)).toBe(protectedText);
    expect(engine.hyphenate(formatted)).toBe(formatted);
    expect(formatted.replaceAll('\u00ad', '')).toBe(text);
  });
});

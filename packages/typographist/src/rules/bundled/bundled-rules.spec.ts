import { Typographist } from '@/index.js';

const english = new Typographist({ useFast: true });
const russian = new Typographist({ useFast: true, locale: 'ru' });

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
    expect(russian.format(word)).toBe(expected.replaceAll('|', '\u00ad'));
    expect(russian.format(word.toUpperCase())).toBe(expected.toUpperCase().replaceAll('|', '\u00ad'));
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
    expect(english.format(word)).toBe(expected.replaceAll('|', '\u00ad'));
    expect(english.format(word.toUpperCase())).toBe(expected.toUpperCase().replaceAll('|', '\u00ad'));
  });

  it.each([english, russian])('preserves protected spelling and remains idempotent', (engine) => {
    const protectedText =
      'ма\u0301шина naïve first.last+tag@example-domain.com userName ISO9001 mother\u2011in\u2011law пе\u00adренос';
    const text = 'hyphenation table машина ёлочка';
    const formatted = engine.format(text);

    expect(engine.format(protectedText)).toBe(protectedText);
    expect(engine.format(formatted)).toBe(formatted);
    expect(formatted.replaceAll('\u00ad', '')).toBe(text);
  });
});

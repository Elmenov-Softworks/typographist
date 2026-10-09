import { Typographist } from '@/typographist/typographist.js';

describe('protected range boundaries', () => {
  it.each([
    ['IDEO', 'X-VIDEO'],
    ['MI', 'MIX-V'],
    ['V', 'X-VIDEO'],
    ['X', 'MIX-V'],
    ['ьX', 'май-июньX'],
    ['м', 'май-июньX'],
    ['аX', 'среда-пятницаX'],
    ['с', 'среда-пятницаX'],
    ['аX', '2020-2021 годаX'],
    ['2', '12020-2021 г.'],
    ['0X', '9:00-18:30X'],
    ['1', '19:00-18:30X'],
    ['/', '9:00-18:30/identifier'],
    ['(', '(9:00-18:30'],
    ['/', '/20-30-е годы'],
    ['/', '/1-3 января'],
  ])('preserves identifiers adjoining protected %j in %j', (protectedLiteral, input) => {
    const service = new Typographist({ locale: 'ru', categories: ['dashes'], protectedContent: [protectedLiteral] });
    const unprotected = new Typographist({ locale: 'ru', categories: ['dashes'] });

    expect(unprotected.format(input)).toBe(input);
    expect(service.format(input)).toBe(input);
    expect(service.format(service.format(input))).toBe(input);
  });

  it.each([
    ['I', 'XI-V'],
    ['II', 'X-VII'],
    ['ь', 'май-июнь'],
    ['м', 'май-июнь'],
    ['а', 'среда-пятница'],
    ['с', 'среда-пятница'],
    ['а', '2020-2021 года'],
    ['2', '2020-2021 г.'],
    ['0', '9:00-18:30'],
    ['я', '1-3 января'],
    ['г', '20-30-е годы'],
  ])('does not complete a range endpoint or label using protected %j in %j', (protectedLiteral, input) => {
    const service = new Typographist({ locale: 'ru', categories: ['dashes'], protectedContent: [protectedLiteral] });

    expect(service.format(input)).toBe(input);
  });

  it.each([
    ['X-XI', 'X–XI'],
    ['май-июнь', 'май–июнь'],
    ['среда-пятница', 'среда–пятница'],
    ['2020-2021 года', '2020–2021 года'],
    ['9:00-18:30', '9:00–18:30'],
    ['1-3 января', '1–3\u00a0января'],
    ['20-30-е годы', '20–30-е годы'],
  ])('formats complete unprotected range %j beside protected delimiters', (input, expected) => {
    const service = new Typographist({ locale: 'ru', categories: ['dashes'], protectedContent: ['@ ', '!'] });

    expect(service.format(`@ ${input}!`)).toBe(`@ ${expected}!`);
    expect(service.format(input)).toBe(expected);
  });

  it('keeps boundary handling bounded across many fragments in one identifier', () => {
    const identifier = `X-${'VI'.repeat(4000)}DEO`;
    const service = new Typographist({ locale: 'ru', categories: ['dashes'], protectedContent: ['I'] });

    expect(service.format(`${identifier} X-XI`)).toBe(`${identifier} X-XI`);
    expect(service.format(`${identifier} X-V`)).toBe(`${identifier} X–V`);
  });
});

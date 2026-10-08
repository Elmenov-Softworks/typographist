import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('bundled prose dashes', () => {
  it('matches Russian month reference fixtures with symbolic settings and identifier protection', () => {
    const rules = createBundledDashes('ru').filter((rule) => rule.id === 'ru/dash/month');
    const format = prepareTextPipeline(rules, 'ru');
    const fixtures = [
      ['январь-март', 'январь–март'],
      ['В МАЕ -- Июне', 'В МАЕ–Июне'],
      ['май ‒июнь', 'май–июнь'],
      ['июль—август', 'июль–август'],
      ['января-марта', 'января-марта'],
      ['январь-феврале', 'январь-феврале'],
    ] as const;

    for (const [input, output] of fixtures) {
      expect(format(input)).toBe(output);
      expect(format(output)).toBe(output);
    }

    const unchanged =
      'xмай-июнь май-июньX _май-июнь май-июнь1 май\u0301-июнь май-июнь-июль май−июнь май\t-июнь май  -июнь май\u00a0-июнь';

    expect(format(unchanged)).toBe(unchanged);
    expect(format('')).toBe('');
    expect(format(' \r\n\t ')).toBe(' \r\n\t ');
    expect(createBundledDashes('en').some((rule) => rule.id === 'ru/dash/month')).toBe(false);

    for (const dash of ['-', '--', '‒', '–', '—', '−']) {
      const configured = prepareTextPipeline(rules, 'ru', { settings: { 'ru/dash/month': { dash } } });

      expect(configured('май-июнь')).toBe(`май${dash}июнь`);
    }

    for (const dash of ['', 'word', '1', '$&', '——']) {
      expect(() => prepareTextPipeline(rules, 'ru', { settings: { 'ru/dash/month': { dash } } })).toThrow(
        'dash must be',
      );
    }
  });

  it('combines Russian month ranges with protections and both hyphenation algorithms', () => {
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content} май-июнь май - июнь https://example.com/май-июнь user-name@example.com июль-август`;
    const output = `${content} май–июнь май\u00a0— июнь https://example.com/май-июнь user-name@example.com июль-август`;
    const service = new Typographist({ locale: 'ru', categories: ['dashes'], protectedContent: ['июль-август'] });

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale: 'ru', categories: [] }).format(input)).toBe(input);

    for (const useFast of [false, true]) {
      const combined = new Typographist({ locale: 'ru', useFast });
      const hyphenation = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });

      expect(combined.format('май-июнь')).toBe(hyphenation.format('май–июнь'));
    }
  });

  it('matches isolated Russian weekday reference fixtures and preserves identifier boundaries', () => {
    const rules = createBundledDashes('ru').filter((rule) => rule.id === 'ru/dash/weekday');
    const format = prepareTextPipeline(rules, 'ru');
    const fixtures = [
      ['понедельник-пятница', 'понедельник–пятница'],
      ['ВТОРНИК -- Суббота', 'ВТОРНИК–Суббота'],
      ['среда ‒четверг', 'среда–четверг'],
      ['пятница–воскресенье', 'пятница–воскресенье'],
      ['суббота — понедельник', 'суббота–понедельник'],
    ] as const;

    for (const [input, output] of fixtures) {
      expect(format(input)).toBe(output);
      expect(format(output)).toBe(output);
    }

    const unchanged =
      'среда−четверг среда\t-четверг среда  -четверг среда\u00a0-четверг среда-пятница-воскресенье ' +
      'xсреда-пятница среда-пятницаX _среда-пятница среда-пятница1 среда\u0301-пятница monday-friday';

    expect(format(unchanged)).toBe(unchanged);
    expect(format('')).toBe('');
    expect(format(' \r\n\t ')).toBe(' \r\n\t ');
    expect(createBundledDashes('en').some((rule) => rule.id === 'ru/dash/weekday')).toBe(false);

    for (const dash of ['-', '--', '‒', '–', '—', '−']) {
      const configured = prepareTextPipeline(rules, 'ru', { settings: { 'ru/dash/weekday': { dash } } });

      expect(configured('среда-пятница')).toBe(`среда${dash}пятница`);
    }

    for (const dash of ['', 'word', '1', '$&', '——']) {
      expect(() => prepareTextPipeline(rules, 'ru', { settings: { 'ru/dash/weekday': { dash } } })).toThrow(
        'dash must be',
      );
    }
  });

  it('combines Russian weekday ranges with protections, prose dashes and hyphenation', () => {
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content} среда-пятница среда - пятница https://example.com/среда-пятница user-name@example.com вторник-суббота`;
    const output = `${content} среда–пятница среда\u00a0— пятница https://example.com/среда-пятница user-name@example.com вторник-суббота`;
    const service = new Typographist({ locale: 'ru', categories: ['dashes'], protectedContent: ['вторник-суббота'] });

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale: 'ru', categories: [] }).format(input)).toBe(input);

    for (const useFast of [false, true]) {
      const combined = new Typographist({ locale: 'ru', useFast });
      const hyphenation = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });

      expect(combined.format('среда-пятница')).toBe(hyphenation.format('среда–пятница'));
    }
  });

  it.each(['en', 'ru'] as const)('matches reference glyph and whitespace cases for %s', (locale) => {
    const rules = createBundledDashes(locale);
    const format = prepareTextPipeline(rules, locale);

    for (const dash of ['-', '--', '‒', '–', '—']) {
      for (const before of [' ', '\u00a0']) {
        for (const after of [' ', '\u00a0', '\n']) {
          expect(format(`word${before}${dash}${after}next`)).toBe(`word\u00a0—${after}next`);
        }
      }
    }

    const unchanged = '- start a-b 1-2 -3 2026-10-08 +7-999-123-45-67 a --- b a\t- b a -\tb a − b';

    expect(format(unchanged)).toBe(unchanged);
    expect(format('end -')).toBe('end -');
    expect(format('')).toBe('');
    expect(format(' \r\n\t ')).toBe(' \r\n\t ');
    for (const rule of rules) {
      expect(() => prepareTextPipeline(rules, locale, { settings: { [rule.id]: { unknown: true } } })).toThrow(
        'Invalid setting',
      );
    }
  });

  it.each(['en', 'ru'] as const)('preserves composition, protections and category selection for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['dashes'], protectedContent: ['Keep - this'] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content} word - next https://example.com/a-b user-name@example.com Keep - this`;
    const output = `${content} word\u00a0— next https://example.com/a-b user-name@example.com Keep - this`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['punctuation'] }).format(input)).toBe(input);
  });

  it.each([false, true])('runs after spacing and before hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });

    expect(service.format('table  -  table')).toBe(legacy.format('table\u00a0— table'));
    expect(legacy.format('table - table')).toBe(`${legacy.format('table')} - ${legacy.format('table')}`);
  });

  it('does not bundle dashes for consumer locales', () => {
    expect(createBundledDashes('custom')).toEqual([]);
  });
});

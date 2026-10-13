import { Typographist } from '#src/index.js';

describe('unsupported locale policy', () => {
  it.each(['', ' \t\n ', '<b>"source"...</b>', 'soft\u00adhyphen'])('preserves exact source %j', (text) => {
    const formatter = new Typographist<'nl'>({ locale: 'nl', unsupportedLocale: 'preserve' });

    expect(formatter.format(text)).toBe(text);
    expect(formatter.format(text, 'nl')).toBe(text);
    expect(formatter.hasLocale('nl')).toBe(false);
  });

  it.each(['throw', 'preserve'] as const)('formats registered locales under %s', (unsupportedLocale) => {
    const formatter = new Typographist({ unsupportedLocale });
    const strict = new Typographist();

    expect(formatter.format('"table"...')).toBe(strict.format('"table"...'));
    expect(formatter.format('"машина"...', 'ru')).toBe(strict.format('"машина"...', 'ru'));
  });

  it('keeps strict defaults and explicit throw errors', () => {
    for (const config of [{}, { unsupportedLocale: 'throw' }] as const) {
      const formatter = new Typographist<'nl'>(config);

      expect(() => formatter.format('', 'nl')).toThrow(new RangeError('Unregistered locale: nl'));
      expect(() => new Typographist<'nl'>({ ...config, locale: 'nl' })).toThrow(RangeError);
    }
  });

  it('reflects registration, replacement and removal without regional fallback', () => {
    const formatter = new Typographist<'nl' | 'NL' | 'en-US'>({ locale: 'nl', unsupportedLocale: 'preserve' });

    formatter.addTextLocale({ locale: 'nl', textRules: [] });
    expect(formatter.hasLocale('NL')).toBe(true);
    expect(formatter.hasLocale('en')).toBe(true);
    expect(formatter.hasLocale('en-US')).toBe(false);

    formatter.addTextLocale({ locale: 'NL', textRules: [] });
    expect(formatter.hasLocale('nl')).toBe(true);
    expect(formatter.removeRules('nl')).toBe(true);
    expect(formatter.hasLocale('NL')).toBe(false);
    expect(formatter.format('"source"...')).toBe('"source"...');

    formatter.removeRules('en');
    expect(formatter.hasLocale('en')).toBe(false);
    expect(formatter.format('"source"...', 'en')).toBe('"source"...');
  });

  it.each(['', ' fr', 'fr_', 'fr--CA'])('rejects malformed locale %j under preserve', (locale) => {
    const formatter = new Typographist<string>({ unsupportedLocale: 'preserve' });

    expect(() => formatter.format('', locale)).toThrow(TypeError);
    expect(() => formatter.hasLocale(locale)).toThrow(TypeError);
    expect(() => new Typographist<string>({ locale, unsupportedLocale: 'preserve' })).toThrow(TypeError);
  });

  it('rejects invalid text for unregistered locales', () => {
    const formatter = new Typographist<'nl'>({ unsupportedLocale: 'preserve' });

    // @ts-expect-error Runtime callers must supply strings.
    expect(() => formatter.format(null, 'nl')).toThrow(TypeError);
  });

  it.each(['fallback', null, false])('rejects invalid policy %j', (unsupportedLocale) => {
    // @ts-expect-error Runtime callers must supply a supported policy.
    expect(() => new Typographist({ unsupportedLocale })).toThrow(TypeError);
  });

  it('propagates errors from registered rules under preserve', () => {
    const failure = new Error('Rule failed');
    const formatter = new Typographist<'nl'>({
      locale: 'nl',
      unsupportedLocale: 'preserve',
      textLocales: [
        {
          locale: 'nl',
          textRules: [
            {
              id: 'failure',
              category: 'punctuation',
              order: 0,
              defaults: {},
              prepare: () => () => {
                throw failure;
              },
            },
          ],
        },
      ],
    });

    expect(() => formatter.format('source')).toThrow(failure);
  });
});

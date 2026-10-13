import { prepareProvider } from '#src/integrations/prepare-provider.factory.js';
import { Typographist } from '#src/typographist/typographist.js';
import { createAlphabeticRules } from '#src/rules/bundled/alphabetic-rules.factory.js';

const examples = [
  { locale: 'es', word: 'constitución', standard: 'cons|ti|tu|ción', fast: 'cons|ti|tu|ci|ón' },
  { locale: 'fr', word: 'éléphant', standard: 'élé|phant', fast: 'élép|hant' },
  { locale: 'de', word: 'übertragung', standard: 'über|tra|gung', fast: 'übert|ra|gung' },
  { locale: 'pt', word: 'coração', standard: 'co|ra|ção', fast: 'co|ra|ção' },
  { locale: 'it', word: 'città', standard: 'cit|tà', fast: 'cit|tà' },
] as const;

it.each([false, true])('registers paired alphabetic datasets with useFast=%s', (useFast) => {
  const formatter = new Typographist({
    locale: 'es',
    rules: createAlphabeticRules(),
    useFast,
    categories: ['hyphenation'],
  });

  for (const { locale, word, standard, fast } of examples) {
    expect(formatter.hasLocale(locale)).toBe(true);

    for (const input of [word, word.toUpperCase(), word.normalize('NFD')]) {
      const output = formatter.format(input, locale);

      expect(output.normalize('NFC').toLowerCase()).toBe((useFast ? fast : standard).replaceAll('|', '\u00ad'));
      expect(output.replaceAll('\u00ad', '')).toBe(input);
      expect(formatter.format(output, locale)).toBe(output);
    }

    const protectedText = 'https://example.com/constitución first.last@example.com';
    expect(formatter.format(protectedText, locale)).toBe(protectedText);
  }

  expect(formatter.format('hardware software', 'pt')).toBe('hard\u00adware soft\u00adware');
});

it.each([false, true])('selects alphabetic locales without consumer registration with useFast=%s', (useFast) => {
  const formatter = new Typographist<string>({ useFast, protectedContent: ['éléphant'] });

  for (const { locale, word, standard, fast } of examples) {
    const provider = prepareProvider({ locale, useFast });
    const expected = (useFast ? fast : standard).replaceAll('|', '\u00ad');

    expect(formatter.hasLocale(locale)).toBe(true);
    expect(provider.formatter.format(word)).toBe(expected);
    expect(prepareProvider({ locale, useFast }, provider)).toBe(provider);
    expect(formatter.format(word, locale)).toBe(locale === 'fr' ? word : expected);
    expect(formatter.hasLocale(`${locale}-XX`)).toBe(false);
    expect(formatter.removeRules(locale)).toBe(true);
    expect(formatter.hasLocale(locale)).toBe(false);
    expect(() => formatter.format(word, locale)).toThrow('Unregistered locale');
    expect(provider.formatter.format(word)).toBe(expected);
  }

  const custom = new Typographist({ rules: [], textLocales: [{ locale: 'en', textRules: [] }] });
  expect(custom.hasLocale('es')).toBe(false);
});

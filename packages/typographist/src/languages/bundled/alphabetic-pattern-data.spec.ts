import { prepareKnuthLiang } from '#src/algorithms/knuth-liang/prepare-knuth-liang.factory.js';
import { insertWordBreaks } from '#src/text/word-breaks/insert-word-breaks.util.js';
import { patterns as esPatterns, exceptions as esExceptions } from '#src/languages/bundled/es-data.constants.js';
import { patterns as frPatterns, exceptions as frExceptions } from '#src/languages/bundled/fr-data.constants.js';
import { patterns as dePatterns, exceptions as deExceptions } from '#src/languages/bundled/de-1996-data.constants.js';
import { patterns as ptPatterns, exceptions as ptExceptions } from '#src/languages/bundled/pt-data.constants.js';
import { patterns as itPatterns, exceptions as itExceptions } from '#src/languages/bundled/it-data.constants.js';

describe('additional pinned alphabetic patterns', () => {
  it.each([
    {
      locale: 'es',
      patterns: esPatterns,
      exceptions: esExceptions,
      alphabet: 'abcdefghijklmnopqrstuvwxyzáéíóúüñ',
      rightMin: 2,
      word: 'constitución',
      expected: 'cons-ti-tu-ción',
    },
    {
      locale: 'fr',
      patterns: frPatterns,
      exceptions: frExceptions,
      alphabet: 'abcdefghijklmnopqrstuvwxyzàâæçéèêëîïôœùûüÿ',
      rightMin: 2,
      word: 'éléphant',
      expected: 'élé-phant',
    },
    {
      locale: 'de',
      patterns: dePatterns,
      exceptions: deExceptions,
      alphabet: 'abcdefghijklmnopqrstuvwxyzäöüß',
      rightMin: 2,
      word: 'übertragung',
      expected: 'über-tra-gung',
    },
    {
      locale: 'pt',
      patterns: ptPatterns,
      exceptions: ptExceptions,
      alphabet: 'abcdefghijklmnopqrstuvwxyzáâãàçéêíóôõúü',
      rightMin: 3,
      word: 'coração',
      expected: 'co-ra-ção',
    },
    {
      locale: 'it',
      patterns: itPatterns,
      exceptions: itExceptions,
      alphabet: 'abcdefghijklmnopqrstuvwxyzàèéìíòóùú',
      rightMin: 2,
      word: 'città',
      expected: 'cit-tà',
    },
  ])(
    'hyphenates $locale words and canonical equivalents',
    ({ locale, patterns, exceptions, alphabet, rightMin, word, expected }) => {
      const engine = prepareKnuthLiang({ locale, patterns, exceptions, alphabet, leftMin: 2, rightMin });

      for (const input of [word, word.toUpperCase(), word.normalize('NFD')]) {
        const normalized = engine.normalize(input);
        if (normalized === null) throw new Error(`Unsupported test word: ${input}`);
        const breaks = engine.exceptionBreaks(normalized.analysis) ?? engine.wordBreaks(normalized.analysis);
        const output = insertWordBreaks(input, breaks, normalized.graphemes, engine.leftMin, engine.rightMin);

        expect(output.normalize('NFC').toLowerCase()).toBe(expected.replaceAll('-', '\u00ad'));
      }
    },
  );

  it('retains Portuguese source exceptions', () => {
    expect(ptExceptions).toEqual([
      { word: 'hardware', positions: [4] },
      { word: 'software', positions: [4] },
    ]);
  });
});

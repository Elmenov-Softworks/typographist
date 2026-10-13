import { createAlphabeticRules } from '#src/rules/bundled/alphabetic-rules.factory.js';
import type { Locale } from '#src/rules/locale.types.js';
import type { ITypographistRules } from '#src/rules/typographist-rules.interfaces.js';
import { TypographistRules } from '#src/rules/typographist-rules.js';
import {
  patterns as englishPatterns,
  exceptions as englishExceptions,
} from '#src/languages/bundled/en-us-data.constants.js';
import {
  patterns as russianPatterns,
  exceptions as russianExceptions,
} from '#src/languages/bundled/ru-data.constants.js';

class BundledRules extends TypographistRules<Locale> implements ITypographistRules<Locale> {}

export const createBundledRules = () => [
  new BundledRules({
    fast: {
      locale: 'en',
      alphabet: 'abcdefghijklmnopqrstuvwxyz',
      vowels: 'aeiouy',
      consonants: 'bcdfghjklmnpqrstvwxz',
      specialLetters: '',
      leftMin: 2,
      rightMin: 3,
      exceptions: englishExceptions,
    },
    standard: {
      locale: 'en',
      alphabet: 'abcdefghijklmnopqrstuvwxyz',
      leftMin: 2,
      rightMin: 3,
      patterns: englishPatterns,
      exceptions: englishExceptions,
    },
  }),
  new BundledRules({
    fast: {
      locale: 'ru',
      alphabet: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
      vowels: 'аеёиоуыэюя',
      consonants: 'бвгджзклмнпрстфхцчшщ',
      specialLetters: 'йьъ',
      leftMin: 2,
      rightMin: 2,
      exceptions: russianExceptions,
    },
    standard: {
      locale: 'ru',
      alphabet: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
      leftMin: 2,
      rightMin: 2,
      patterns: russianPatterns,
      exceptions: russianExceptions,
    },
  }),
  ...createAlphabeticRules(),
];

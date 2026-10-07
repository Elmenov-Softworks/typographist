import type { Locale } from '@/rules/locale.types.js';
import type { ITypographistRules } from '@/rules/typographist-rules.interfaces.js';
import { TypographistRules } from '@/rules/typographist-rules.js';
import type { CompiledRules } from '@/rules/compiled-rules.types.js';
import {
  patterns as englishPatterns,
  exceptions as englishExceptions,
} from '@/languages/bundled/en-us-data.constants.js';
import { patterns as russianPatterns, exceptions as russianExceptions } from '@/languages/bundled/ru-data.constants.js';

class BundledRules extends TypographistRules<Locale> implements ITypographistRules<Locale> {
  constructor(rules: CompiledRules<Locale>) {
    super({ standard: rules });
  }
}

export const createBundledRules = () => [
  new BundledRules({
    locale: 'en',
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
    leftMin: 2,
    rightMin: 3,
    patterns: englishPatterns,
    exceptions: englishExceptions,
  }),
  new BundledRules({
    locale: 'ru',
    alphabet: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    leftMin: 2,
    rightMin: 2,
    patterns: russianPatterns,
    exceptions: russianExceptions,
  }),
];

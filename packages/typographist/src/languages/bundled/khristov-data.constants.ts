import type { KhristovRules } from '@/algorithms/khristov/khristov-rules.types.js';
import { exceptions as englishExceptions } from '@/languages/bundled/en-us-data.constants.js';
import { exceptions as russianExceptions } from '@/languages/bundled/ru-data.constants.js';

export const englishKhristovRules: KhristovRules<'en'> = Object.freeze({
  locale: 'en',
  alphabet: 'abcdefghijklmnopqrstuvwxyz',
  vowels: 'aeiouy',
  consonants: 'bcdfghjklmnpqrstvwxz',
  specialLetters: '',
  leftMin: 2,
  rightMin: 3,
  exceptions: englishExceptions,
});

export const russianKhristovRules: KhristovRules<'ru'> = Object.freeze({
  locale: 'ru',
  alphabet: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
  vowels: 'аеёиоуыэюя',
  consonants: 'бвгджзклмнпрстфхцчшщ',
  specialLetters: 'йьъ',
  leftMin: 2,
  rightMin: 2,
  exceptions: russianExceptions,
});

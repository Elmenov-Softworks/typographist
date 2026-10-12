import type { KhristovRules } from '#src/algorithms/khristov/khristov-rules.types.js';
import { exceptions as esExceptions } from '#src/languages/bundled/es-data.constants.js';
import { exceptions as frExceptions } from '#src/languages/bundled/fr-data.constants.js';
import { exceptions as deExceptions } from '#src/languages/bundled/de-1996-data.constants.js';
import { exceptions as ptExceptions } from '#src/languages/bundled/pt-data.constants.js';
import { exceptions as itExceptions } from '#src/languages/bundled/it-data.constants.js';

export const alphabeticKhristovRules = [
  {
    locale: 'es',
    alphabet: 'abcdefghijklmnopqrstuvwxyzáéíóúüñ',
    vowels: 'aeiouyáéíóúü',
    consonants: 'bcdfghjklmnpqrstvwxzñ',
    specialLetters: '',
    leftMin: 2,
    rightMin: 2,
    exceptions: esExceptions,
  },
  {
    locale: 'fr',
    alphabet: 'abcdefghijklmnopqrstuvwxyzàâæçéèêëîïôœùûüÿ',
    vowels: 'aeiouyàâæéèêëîïôœùûüÿ',
    consonants: 'bcdfghjklmnpqrstvwxzç',
    specialLetters: '',
    leftMin: 2,
    rightMin: 2,
    exceptions: frExceptions,
  },
  {
    locale: 'de',
    alphabet: 'abcdefghijklmnopqrstuvwxyzäöüß',
    vowels: 'aeiouyäöü',
    consonants: 'bcdfghjklmnpqrstvwxzß',
    specialLetters: '',
    leftMin: 2,
    rightMin: 2,
    exceptions: deExceptions,
  },
  {
    locale: 'pt',
    alphabet: 'abcdefghijklmnopqrstuvwxyzáâãàçéêíóôõúü',
    vowels: 'aeiouyáâãàéêíóôõúü',
    consonants: 'bcdfghjklmnpqrstvwxzç',
    specialLetters: '',
    leftMin: 2,
    rightMin: 3,
    exceptions: ptExceptions,
  },
  {
    locale: 'it',
    alphabet: 'abcdefghijklmnopqrstuvwxyzàèéìíòóùú',
    vowels: 'aeiouyàèéìíòóùú',
    consonants: 'bcdfghjklmnpqrstvwxz',
    specialLetters: '',
    leftMin: 2,
    rightMin: 2,
    exceptions: itExceptions,
  },
] as const satisfies readonly KhristovRules[];

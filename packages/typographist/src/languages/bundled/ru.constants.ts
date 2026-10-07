import type { KnuthLiangPlugin } from '../../algorithms/knuth-liang/knuth-liang-plugin.types.js';
import { createAlphabetNormalizer } from '../word-analysis.util.js';
import { exceptions, patterns } from './ru-data.constants.js';

export const ru: KnuthLiangPlugin = Object.freeze({
  id: 'ru',
  normalize: createAlphabetNormalizer('абвгдеёжзийклмнопрстуфхцчшщъыьэюя'),
  leftMin: 2,
  rightMin: 2,
  patterns,
  exceptions,
});

import type { KnuthLiangPlugin } from '@/algorithms/knuth-liang/knuth-liang-plugin.types.js';
import { createAlphabetNormalizer } from '@/languages/analysis/alphabet-normalizer.factory.js';
import { exceptions, patterns } from '@/languages/bundled/en-us-data.constants.js';

export const enUS: KnuthLiangPlugin = Object.freeze({
  id: 'en-US',
  normalize: createAlphabetNormalizer('abcdefghijklmnopqrstuvwxyz'),
  leftMin: 2,
  rightMin: 3,
  patterns,
  exceptions,
});

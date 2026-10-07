import { prepareKnuthLiang } from '@/algorithms/knuth-liang/prepare-knuth-liang.factory.js';

export const selectAlgorithm = (useFast: boolean) => {
  if (typeof useFast !== 'boolean') {
    throw new TypeError('useFast must be a boolean');
  }

  return prepareKnuthLiang;
};

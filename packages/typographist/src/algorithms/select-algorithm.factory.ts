import { prepareKnuthLiang } from '@/algorithms/knuth-liang/prepare-knuth-liang.factory.js';
import { prepareKhristov } from '@/algorithms/khristov/prepare-khristov.factory.js';
import type { KhristovRules } from '@/algorithms/khristov/khristov-rules.types.js';
import type { CompiledRules } from '@/rules/compiled-rules.types.js';

export const selectAlgorithm = (useFast: boolean) => {
  if (typeof useFast !== 'boolean') {
    throw new TypeError('useFast must be a boolean');
  }

  return (rules: CompiledRules | KhristovRules) => {
    if (useFast) {
      if (!('vowels' in rules) || 'patterns' in rules) {
        throw new TypeError('Fast mode requires Khristov rules');
      }

      return prepareKhristov(rules);
    }

    if (!('patterns' in rules) || 'vowels' in rules) {
      throw new TypeError('Standard mode requires Knuth–Liang rules');
    }

    return prepareKnuthLiang(rules);
  };
};

import { prepareLanguage } from '#src/languages/prepare-language.factory.js';
import { validatePatterns } from '#src/algorithms/knuth-liang/pattern-matcher.util.js';
import { prepareKnuthLiang } from '#src/algorithms/knuth-liang/prepare-knuth-liang.factory.js';
import { prepareKhristov } from '#src/algorithms/khristov/prepare-khristov.factory.js';
import type { KhristovRules } from '#src/algorithms/khristov/khristov-rules.types.js';
import type { CompiledRules } from '#src/rules/compiled-rules.types.js';

const requireFastRules = (rules: CompiledRules | KhristovRules) => {
  if (!('vowels' in rules) || 'patterns' in rules) {
    throw new TypeError('Fast mode requires Khristov rules');
  }

  return rules;
};

const requireStandardRules = (rules: CompiledRules | KhristovRules) => {
  if (!('patterns' in rules) || 'vowels' in rules) {
    throw new TypeError('Standard mode requires Knuth–Liang rules');
  }

  return rules;
};

export const validateAlgorithmRules = (rules: CompiledRules | KhristovRules, useFast: boolean) => {
  if (useFast) {
    prepareKhristov(requireFastRules(rules));
    return;
  }

  const standard = requireStandardRules(rules);
  prepareLanguage(standard);
  validatePatterns(standard.patterns);
};

export const selectAlgorithm = (useFast: boolean) => {
  if (typeof useFast !== 'boolean') {
    throw new TypeError('useFast must be a boolean');
  }

  return (rules: CompiledRules | KhristovRules) => {
    return useFast ? prepareKhristov(requireFastRules(rules)) : prepareKnuthLiang(requireStandardRules(rules));
  };
};

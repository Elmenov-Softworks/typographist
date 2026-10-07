import type { ExclusionOptions } from '@/text/exclusions/exclusion-options.types.js';

const readToggle = (name: string, value: unknown = true) => {
  if (typeof value !== 'boolean') {
    throw new TypeError(`Exclusion option ${name} must be a boolean`);
  }

  return value;
};

export const prepareExclusions = (options: ExclusionOptions = {}) => {
  const input: unknown = options;

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Exclusions must be an options object');
  }

  const addresses = readToggle('addresses', options.addresses);
  const numbers = readToggle('numbers', options.numbers);
  const underscores = readToggle('underscores', options.underscores);
  const camelCase = readToggle('camelCase', options.camelCase);
  const custom = options.custom;

  if (custom !== undefined && typeof custom !== 'function') {
    throw new TypeError('Exclusion option custom must be a synchronous predicate');
  }

  const preserves = (word: string) => {
    if (word.includes('\u00ad') || word.includes('\u2011')) {
      return true;
    }

    if (
      (numbers && /\p{N}/u.test(word)) ||
      (underscores && word.includes('_')) ||
      (camelCase && /\p{Ll}\p{Lu}/u.test(word))
    ) {
      return true;
    }

    if (custom === undefined) {
      return false;
    }

    const result: unknown = custom(word);

    if (typeof result !== 'boolean') {
      throw new TypeError('Custom exclusion must return a synchronous boolean');
    }

    return result;
  };

  return Object.freeze({ addresses, preserves });
};

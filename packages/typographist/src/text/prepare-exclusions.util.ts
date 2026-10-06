const readToggle = (name: string, value: unknown) => {
  if (value === undefined) {
    return true;
  }
  if (typeof value !== 'boolean') {
    throw new TypeError(`Exclusion option ${name} must be a boolean`);
  }
  return value;
};

export const prepareExclusions = (options: unknown = {}) => {
  if (typeof options !== 'object' || options === null || Array.isArray(options)) {
    throw new TypeError('Exclusions must be an options object');
  }

  const addresses = readToggle('addresses', 'addresses' in options ? options.addresses : undefined);
  const numbers = readToggle('numbers', 'numbers' in options ? options.numbers : undefined);
  const underscores = readToggle('underscores', 'underscores' in options ? options.underscores : undefined);
  const camelCase = readToggle('camelCase', 'camelCase' in options ? options.camelCase : undefined);
  const custom = 'custom' in options ? options.custom : undefined;
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

    const result: unknown = Reflect.apply(custom, null, [word]);
    if (typeof result !== 'boolean') {
      throw new TypeError('Custom exclusion must return a synchronous boolean');
    }
    return result;
  };

  return Object.freeze({ addresses, preserves });
};

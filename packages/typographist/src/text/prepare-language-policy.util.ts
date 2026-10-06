import { prepareExceptionTable } from '../languages/exception-table.util.js';
import type { PreparedLanguageProfile } from '../languages/prepared-language-profile.types.js';
import type { LanguagePolicyOptions } from './language-policy-options.types.js';

const validateLimit = (value: unknown, minimum: number, option: string, language: string) => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(`${option} for language ${language} must be a safe integer at least ${String(minimum)}`);
  }
  return value;
};

export const prepareLanguagePolicy = (profile: PreparedLanguageProfile, options: LanguagePolicyOptions = {}) => {
  const input: unknown = options;
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError(`Language policy for ${profile.id} must be an object`);
  }

  const leftMin = validateLimit(
    options.leftMin === undefined ? profile.leftMin : options.leftMin,
    profile.leftMin,
    'leftMin',
    profile.id,
  );
  const rightMin = validateLimit(
    options.rightMin === undefined ? profile.rightMin : options.rightMin,
    profile.rightMin,
    'rightMin',
    profile.id,
  );
  const minWordLength = validateLimit(
    options.minWordLength === undefined ? 0 : options.minWordLength,
    0,
    'minWordLength',
    profile.id,
  );
  const exceptions = prepareExceptionTable(
    options.exceptions === undefined ? [] : options.exceptions,
    profile.normalize,
  );

  return Object.freeze({ leftMin, rightMin, minWordLength, exceptionBreaks: exceptions.lookup });
};

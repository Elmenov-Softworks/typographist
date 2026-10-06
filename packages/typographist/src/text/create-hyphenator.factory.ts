import type { PreparedLanguageProfile } from '../languages/prepared-language-profile.types.js';
import { languageKey } from '../languages/language-identifier.util.js';
import { validateWordAnalysis } from '../languages/word-analysis.util.js';
import type { HyphenationCallOptions, HyphenationOptions } from './hyphenation-options.types.js';
import { insertWordBreaks } from './insert-word-breaks.util.js';
import { prepareExclusions } from './prepare-exclusions.util.js';
import { prepareLanguagePolicy } from './prepare-language-policy.util.js';
import { scanAddresses } from './scan-addresses.util.js';
import { scanCandidates } from './scan-candidates.util.js';

const requireObject = (value: unknown, name: string) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
};

export const createHyphenator = (options: HyphenationOptions) => {
  requireObject(options, 'Hyphenation options');
  const { algorithm, wordSelector } = options;
  requireObject(algorithm, 'Algorithm');
  if (!Array.isArray(algorithm.languages) || typeof algorithm.wordBreaks !== 'function') {
    throw new TypeError('Algorithm requires language profiles and synchronous wordBreaks');
  }
  if (wordSelector !== undefined && typeof wordSelector !== 'function') {
    throw new TypeError('wordSelector must be a synchronous function');
  }
  const wordBreaks = algorithm.wordBreaks;
  const profiles = new Map<string, PreparedLanguageProfile>();
  const languages: readonly PreparedLanguageProfile[] = algorithm.languages;
  for (const profile of languages) {
    requireObject(profile, 'Language profile');
    const key = languageKey(profile.id);
    if (profiles.has(key)) {
      throw new RangeError(`Duplicate language registration: ${profile.id}`);
    }
    if (typeof profile.normalize !== 'function' || typeof profile.exceptionBreaks !== 'function') {
      throw new TypeError(`Language ${profile.id} requires synchronous profile functions`);
    }
    for (const minimum of [profile.leftMin, profile.rightMin]) {
      if (!Number.isSafeInteger(minimum) || minimum < 1) {
        throw new RangeError(`Language ${profile.id} requires positive safe integer minima`);
      }
    }
    profiles.set(key, Object.freeze({ ...profile }));
  }

  const selectProfile = (id: string) => {
    const profile = profiles.get(languageKey(id));
    if (profile === undefined) {
      throw new RangeError(`Unregistered language: ${id}`);
    }
    return profile;
  };
  const defaultLanguage = selectProfile(options.defaultLanguage).id;
  const overrides = new Map<string, NonNullable<HyphenationOptions['languages']>[string]>();
  if (options.languages !== undefined) {
    requireObject(options.languages, 'Language policies');
    for (const [id, policy] of Object.entries(options.languages)) {
      const key = languageKey(selectProfile(id).id);
      if (overrides.has(key)) {
        throw new RangeError(`Duplicate language policy: ${id}`);
      }
      overrides.set(key, policy);
    }
  }
  const policies = new Map(
    [...profiles].map(([key, profile]) => [key, prepareLanguagePolicy(profile, overrides.get(key))]),
  );
  const exclusions = prepareExclusions(options.exclusions);

  const hyphenate = (text: string, callOptions: HyphenationCallOptions = {}) => {
    if (typeof text !== 'string') {
      throw new TypeError('Text must be a string');
    }
    requireObject(callOptions, 'Call options');
    const language = selectProfile(callOptions.language === undefined ? defaultLanguage : callOptions.language).id;
    const addresses = exclusions.addresses ? scanAddresses(text) : [];
    const parts: string[] = [];
    let addressIndex = 0;
    let copied = 0;

    for (const { start, end } of scanCandidates(text)) {
      while (addresses[addressIndex] !== undefined) {
        const span = addresses[addressIndex];
        if (span === undefined || span.end > start) {
          break;
        }
        addressIndex += 1;
      }
      const address = addresses[addressIndex];
      if (address !== undefined && address.start < end && address.end > start) {
        continue;
      }
      const word = text.slice(start, end);
      if (exclusions.preserves(word)) {
        continue;
      }
      const selected = wordSelector === undefined ? language : wordSelector(word, language);
      if (selected === null) {
        continue;
      }
      const profile = selectProfile(selected);
      const validated = validateWordAnalysis(word, profile.normalize(word));
      if (validated === null) {
        continue;
      }
      const policy = policies.get(languageKey(profile.id));
      if (policy === undefined) {
        throw new Error('Missing prepared language policy');
      }
      const { analysis, graphemes } = validated;
      if (graphemes.length - 1 < policy.minWordLength) {
        continue;
      }
      const positions =
        policy.exceptionBreaks(analysis) ?? profile.exceptionBreaks(analysis) ?? wordBreaks(word, profile.id, analysis);
      const replacement = insertWordBreaks(word, positions, graphemes, policy.leftMin, policy.rightMin);
      if (replacement !== word) {
        parts.push(text.slice(copied, start), replacement);
        copied = end;
      }
    }
    if (copied === 0) {
      return text;
    }
    parts.push(text.slice(copied));
    return parts.join('');
  };

  return Object.freeze({ hyphenate });
};

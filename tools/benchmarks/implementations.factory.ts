import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

import { Typographist } from '../../packages/typographist/dist/index.js';
import type { BenchmarkImplementation, TextFormatter } from './benchmark.types.ts';

export const currentImplementations: readonly BenchmarkImplementation[] = [false, true].map((useFast) => ({
  id: useFast ? 'current-fast' : 'current-standard',
  algorithm: 'knuth-liang',
  useFast,
  create: () => {
    const typographist = new Typographist({ useFast });

    return (text, locale) => typographist.format(text, locale);
  },
}));

const requireFormatter = (service: unknown) => {
  if (
    typeof service !== 'object' ||
    service === null ||
    !('hyphenate' in service) ||
    typeof service.hyphenate !== 'function'
  ) {
    throw new TypeError('Legacy createHyphenator must return a hyphenate service');
  }

  const hyphenate = service.hyphenate;

  return (text: string) => {
    const result: unknown = Reflect.apply(hyphenate, service, [text]);

    if (typeof result !== 'string') {
      throw new TypeError('Legacy hyphenate must return a string synchronously');
    }

    return result;
  };
};

export const loadLegacyImplementation = async (modulePath: string) => {
  const legacy: unknown = await import(pathToFileURL(resolve(modulePath)).href);

  if (
    typeof legacy !== 'object' ||
    legacy === null ||
    !('createHyphenator' in legacy) ||
    typeof legacy.createHyphenator !== 'function' ||
    !('prepareKnuthLiang' in legacy) ||
    typeof legacy.prepareKnuthLiang !== 'function' ||
    !('enUS' in legacy) ||
    !('ru' in legacy)
  ) {
    throw new TypeError('Legacy module must export createHyphenator, prepareKnuthLiang, enUS and ru');
  }

  const { createHyphenator, prepareKnuthLiang, enUS, ru } = legacy;
  const create = () => {
    const algorithm: unknown = Reflect.apply(prepareKnuthLiang, legacy, [[enUS, ru]]);
    const english: unknown = Reflect.apply(createHyphenator, legacy, [{ algorithm, defaultLanguage: 'en-US' }]);
    const russian: unknown = Reflect.apply(createHyphenator, legacy, [{ algorithm, defaultLanguage: 'ru' }]);
    const formatEnglish = requireFormatter(english);
    const formatRussian = requireFormatter(russian);
    const format: TextFormatter = (text, locale) => (locale === 'en' ? formatEnglish(text) : formatRussian(text));

    return format;
  };
  const implementation: BenchmarkImplementation = { id: 'legacy', algorithm: 'knuth-liang', useFast: null, create };

  return implementation;
};

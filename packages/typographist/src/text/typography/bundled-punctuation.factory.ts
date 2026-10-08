import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledPunctuation = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [];

  if (locale === 'ru') {
    rules.push(
      {
        id: 'ru/punctuation/hellipQuestion',
        category: 'punctuation',
        order: 410,
        defaults: {},
        prepare: () => (text) =>
          text.replace(/(^|[^.])(\.{3}|…),/g, '$1…').replace(/([!?])(\.{3}|…)(?=[^.]|$)/g, '$1..'),
      },
      {
        id: 'ru/punctuation/exclamation',
        category: 'punctuation',
        order: 410,
        defaults: {},
        prepare: () => (text) =>
          text.replace(/(^|[^!])!{2}($|[^!])/gm, '$1!$2').replace(/(^|[^!])!{4}($|[^!])/gm, '$1!!!$2'),
      },
    );
  }

  rules.push(
    {
      id: 'common/punctuation/hellip',
      category: 'punctuation',
      order: 410,
      defaults: {},
      prepare: () =>
        locale === 'ru'
          ? (text) => text.replace(/(^|[^.])\.{3,4}(?=[^.]|$)/g, '$1…')
          : (text) => text.replace(/(^|[^.])\.{3}(\.?)(?=[^.]|$)/g, '$1…$2'),
    },
    {
      id: 'common/punctuation/delDoublePunctuation',
      category: 'punctuation',
      order: 410,
      defaults: {},
      prepare: () => (text) =>
        text
          .replace(/(^|[^,]),,(?!,)/g, '$1,')
          .replace(/(^|[^:])::(?!:)/g, '$1:')
          .replace(/(^|[^!?.])\.\.(?!\.)/g, '$1.')
          .replace(/(^|[^;]);;(?!;)/g, '$1;')
          .replace(/(^|[^?])\?\?(?!\?)/g, '$1?'),
    },
  );

  if (locale === 'ru') {
    rules.push({
      id: 'ru/punctuation/exclamationQuestion',
      category: 'punctuation',
      order: 415,
      defaults: {},
      prepare: () => (text) => text.replace(/(^|[^!])!\?([^?]|$)/g, '$1?!$2'),
    });
  }

  return rules;
};

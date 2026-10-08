import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledSpacing = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [
    {
      id: 'common/space/replaceTab',
      category: 'spacing',
      order: 205,
      defaults: {},
      prepare: () => (text) => text.replace(/\t/g, '    '),
    },
    {
      id: 'common/space/trimLeft',
      category: 'spacing',
      order: 206,
      defaults: {},
      prepare: () => (text, context) => (context?.startsText === false ? text : text.trimStart()),
    },
    {
      id: 'common/space/trimRight',
      category: 'spacing',
      order: 207,
      defaults: {},
      prepare: () => (text, context) => (context?.endsText === false ? text : text.trimEnd()),
    },
    {
      id: 'common/space/delTrailingBlanks',
      category: 'spacing',
      order: 207,
      defaults: {},
      prepare: () => (text) => text.replace(/[ \t]+\n/g, '\n'),
    },
    {
      id: 'common/space/delRepeatSpace',
      category: 'spacing',
      order: 209,
      defaults: {},
      prepare: () => (text) => text.replace(/([^\n \t])[ \t]{2,}(?![\n \t])/g, '$1 '),
    },
    {
      id: 'common/space/delRepeatN',
      category: 'spacing',
      order: 209,
      defaults: { maxConsecutiveLineBreaks: 2 },
      prepare: ({ maxConsecutiveLineBreaks }) => {
        if (
          typeof maxConsecutiveLineBreaks !== 'number' ||
          !Number.isSafeInteger(maxConsecutiveLineBreaks) ||
          maxConsecutiveLineBreaks < 1
        ) {
          throw new TypeError('maxConsecutiveLineBreaks must be a positive safe integer');
        }

        const repeatedLineBreaks = /\n+/g;

        return (text) =>
          text.replace(repeatedLineBreaks, (lineBreaks) => lineBreaks.slice(0, maxConsecutiveLineBreaks));
      },
    },
    {
      id: 'common/space/delLeadingBlanks',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text, context) =>
        text.replace(/(^|[\r\n\u2028\u2029])[ \t]+/g, (match: string, boundary: string, offset: number) =>
          offset === 0 && boundary === '' && context?.startsLine === false ? match : boundary,
        ),
    },
    {
      id: 'common/space/squareBracket',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\[) +/g, '[').replace(/ +\]/g, ']'),
    },
    {
      id: 'common/space/delBetweenExclamationMarks',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/([!?]) (?=[!?])/g, '$1'),
    },
    {
      id: 'common/space/delBeforePunctuation',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(^|[^!?:;,.…]) ([!?:;,])(?!\))/g, '$1$2'),
    },
    {
      id: 'common/space/delBeforePercent',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\d)( |\u00a0)(%|‰|‱)/g, '$1$3'),
    },
    {
      id: 'common/space/delBeforeDot',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(^|[^!?:;,.…]) (\.|\.\.\.)(\s|$)/g, '$1$2$3'),
    },
    {
      id: 'common/space/bracket',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\() +/g, '(').replace(/ +\)/g, ')'),
    },
    {
      id: 'common/space/beforeBracket',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => {
        const beforeBracket = locale === 'ru' ? /([а-яё.!?,;…)])\(/gi : /([a-z.!?,;…)])\(/gi;

        return (text) => text.replace(beforeBracket, '$1 (');
      },
    },
    {
      id: 'common/space/afterSemicolon',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/;([^).…!;?\s[\]«‹»›„“‟”"])/g, '; $1'),
    },
    {
      id: 'common/space/afterExclamationMark',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/!([^).…!;?\s[\]«‹»›„“‟”"])/g, '! $1'),
    },
    {
      id: 'common/space/afterQuestionMark',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/\?([^).…!;?\s[\]«‹»›„“‟”"])/g, '? $1'),
    },
    {
      id: 'common/space/afterComma',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => {
        const afterComma = locale === 'ru' ? /(.),([^)",:.?\s/\\»“‘])/g : /(.),([^)",:.?\s/\\”’])/g;

        return (text) =>
          text.replace(afterComma, (match: string, before: string, after: string) =>
            /\d/.test(before) && /\d/.test(after) ? match : `${before}, ${after}`,
          );
      },
    },
    {
      id: 'common/space/afterColon',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\D):([^)",:.?\s/\\])/g, '$1: $2'),
    },
  ];

  if (locale === 'ru') {
    rules.unshift({
      id: 'ru/space/afterHellip',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) =>
        text.replace(/([а-яё])(\.\.\.|…)([А-ЯЁ])/g, '$1$2 $3').replace(/([?!]\.\.)([а-яёa-z])/gi, '$1 $2'),
    });
    rules.unshift({
      id: 'ru/space/year',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(^| |\u00a0)(\d{3,4})(год([ауе]|ом)?)([^а-яё]|$)/g, '$1$2 $3$5'),
    });
  }

  return rules;
};

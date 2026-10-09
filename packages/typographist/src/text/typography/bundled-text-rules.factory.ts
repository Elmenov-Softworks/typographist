import type { TextRule } from '@/text/typography/text-rule.types.js';
import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { createBundledPunctuation } from '@/text/typography/bundled-punctuation.factory.js';
import { createBundledQuotes } from '@/text/typography/bundled-quotes.factory.js';
import { createBundledSpacing } from '@/text/typography/bundled-spacing.factory.js';

const referenceOrder = [
  'common/dash/minus',
  'common/space/replaceTab',
  'common/space/trimLeft',
  'common/space/trimRight',
  'common/space/delTrailingBlanks',
  'common/space/delRepeatSpace',
  'common/space/delRepeatN',
  'ru/space/year',
  'ru/space/afterHellip',
  'common/space/squareBracket',
  'common/space/insertFinalNewline',
  'common/space/delLeadingBlanks',
  'common/space/delBetweenExclamationMarks',
  'common/space/delBeforePunctuation',
  'common/space/delBeforePercent',
  'common/space/delBeforeDot',
  'common/space/bracket',
  'common/space/beforeBracket',
  'common/space/afterSemicolon',
  'common/space/afterExclamationMark',
  'common/space/afterQuestionMark',
  'common/space/afterComma',
  'common/space/afterColon',
  'ru/dash/main',
  'en-US/dash/main',
  'ru/dash/years',
  'ru/dash/weekday',
  'ru/dash/time',
  'ru/dash/month',
  'ru/dash/directSpeech',
  'ru/dash/decade',
  'ru/dash/daysMonth',
  'ru/dash/centuries',
  'common/punctuation/quote',
  'common/punctuation/hellip',
  'common/punctuation/apostrophe',
  'ru/nbsp/year',
  'ru/nbsp/see',
  'ru/nbsp/rubleKopek',
  'ru/nbsp/ps',
  'ru/nbsp/page',
  'ru/nbsp/ooo',
  'ru/nbsp/mln',
  'ru/nbsp/initials',
  'ru/nbsp/dayMonth',
  'ru/nbsp/centuries',
  'ru/nbsp/afterNumberSign',
  'ru/nbsp/addr',
  'ru/nbsp/abbr',
  'common/nbsp/dpi',
  'common/nbsp/beforeShortLastWord',
  'common/nbsp/beforeShortLastNumber',
  'common/nbsp/afterShortWordByList',
  'common/nbsp/afterShortWord',
  'common/nbsp/afterSectionMark',
  'common/nbsp/afterParagraphMark',
  'common/nbsp/afterNumber',
  'ru/nbsp/years',
  'ru/nbsp/m',
  'ru/nbsp/beforeParticle',
];

const createLocaleRules = (locale: string) =>
  [
    ...createBundledSpacing(locale),
    ...createBundledDashes(locale),
    ...createBundledPunctuation(locale),
    ...createBundledQuotes(locale),
    ...createBundledNonbreakingSpacing(locale),
  ].sort(
    (left, right) => left.order - right.order || referenceOrder.indexOf(left.id) - referenceOrder.indexOf(right.id),
  );

export const createBundledTextRules = (locale: string, additionalRules: readonly TextRule[] = []) => [
  ...createLocaleRules(locale),
  ...additionalRules,
];

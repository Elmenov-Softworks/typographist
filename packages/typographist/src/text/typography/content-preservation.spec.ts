import { Typographist } from '@/index.js';

const fixtures: [string, string[]][] = [
  [
    'before-bracket',
    ['word(test)', 'слово(тест)', 'word  (test)', 'word\t(test)', 'word\r\n(test)', 'word\u00a0(test)'],
  ],
  [
    'colon-spacing',
    ['word:next', 'слово:далее', 'word::next', 'word:  next', 'word:\tnext', 'word:\r\nnext', 'word:\u00a0next'],
  ],
  [
    'comma-spacing',
    ['word,next', 'слово,далее', 'word,,next', 'word,  next', 'word,\tnext', 'word,\r\nnext', 'word,\u00a0next'],
  ],
  ['dot-spacing', ['word .', 'word  .', 'word\t.', 'word\r\n.', 'word\u00a0.', '1 .25']],
  [
    'ellipsis-boundary',
    [
      'слово…Далее',
      'Что?..next',
      'Да!..Слово',
      'слово…  Далее',
      'слово…\tДалее',
      'слово…\r\nДалее',
      'слово…\u00a0Далее',
    ],
  ],
  ['empty-line', ['\n\n\n\n', 'cat\n\n\n\ndog', 'cat\r\n\r\n\r\n\r\ndog', 'cat\r\r\r\rdog', 'cat\r\n\n\r\n\rdog']],
  [
    'exclamation-mark-boundary',
    ['word!next', 'слово!далее', 'word!!next', 'word!  next', 'word!\tnext', 'word!\r\nnext', 'word!\u00a0next'],
  ],
  ['exclamation-spacing', ['! !', '? ?', '! ? ! ?', '!! !! ?? ??', '!\t! ?\t?', '!\r\n! ?\r?', '!\u00a0! ?\u00a0?']],
  ['final-newline', ['', 'cat', 'cat\rdog', 'cat\r\ndog', 'cat\ndog', 'cat https://example.com/path', 'cat keep\r']],
  [
    'indentation',
    ['  cat', '\tcat', 'cat\n  dog', 'cat\r\tdog', 'cat\r\n \tdog', 'cat\u2028  dog\u2029\tdog', ' \t\r\n  \t'],
  ],
  [
    'line-ending',
    ['cat\rdog', 'cat\r\ndog', 'cat\ndog', 'cat\r\n\r\n\rdog', 'cat\u2028dog\u2029cat', 'cat\rKeep\r\nRAW\r\ndog'],
  ],
  ['outer-whitespace', ['cat\t', '\u00a0cat\u202f', '\ufeffcat\ufeff', 'KEEP\r\n\t ', '\u00a0\u202f\ufeff']],
  ['percent-spacing', ['10 %', '10\u00a0%', '10  ‰', '10\t‱', '10\r\n%', '10\n ‰']],
  [
    'punctuation-boundary',
    ['word !', 'word  ?', 'word :', 'word ;', 'word ,', '!  ! ?  ?', 'word\t,', 'word\r\n!', 'word\u00a0?'],
  ],
  [
    'question-spacing',
    ['word?next', 'слово?далее', 'word??next', 'word?  next', 'word?\tnext', 'word?\r\nnext', 'word?\u00a0next'],
  ],
  ['repeated-space', ['cat  dog', 'cat   dog', 'cat\t\tdog', 'cat \t dog', 'cat\u00a0\u00a0dog']],
  ['round-bracket', ['( word )', '(  word  )', '(\tword\t)', '(\r\nword\r\n)', '(\u00a0word\u00a0)', '[ ( word ) ]']],
  [
    'semicolon',
    ['word;next', 'слово;далее', 'word;;next', 'word;  next', 'word;\tnext', 'word;\r\nnext', 'word;\u00a0next'],
  ],
  ['square-bracket', ['[ word ]', '[  word  ]', '[\tword\t]', '[\r\nword\r\n]', '[\u00a0word\u00a0]', '[ [ word ] ]']],
  ['tab', ['cat\tdog', 'кот\tдом', 'cat\r\ndog\tcat', 'cat\u00a0dog\tcat', 'cat\tKEEP\tcat']],
  [
    'year-label',
    ['2027год', '123года', '2026году 2027годом', '2026  год', '2026\tгод', '2026\r\nгод', '2026\u00a0год'],
  ],
];

const removedIds = [
  'common/nbsp/replaceNbsp',
  'common/punctuation/delDoublePunctuation',
  'common/space/afterColon',
  'common/space/afterComma',
  'common/space/afterExclamationMark',
  'common/space/afterQuestionMark',
  'common/space/afterSemicolon',
  'common/space/beforeBracket',
  'common/space/bracket',
  'common/space/delBeforeDot',
  'common/space/delBeforePercent',
  'common/space/delBeforePunctuation',
  'common/space/delBetweenExclamationMarks',
  'common/space/delLeadingBlanks',
  'common/space/delRepeatN',
  'common/space/delRepeatSpace',
  'common/space/insertFinalNewline',
  'common/space/normalizeLineEndings',
  'common/space/replaceTab',
  'common/space/squareBracket',
  'common/space/delTrailingBlanks',
  'common/space/trimLeft',
  'common/space/trimRight',
  'ru/punctuation/exclamation',
  'ru/punctuation/exclamationQuestion',
  'ru/punctuation/hellip',
  'ru/space/afterHellip',
  'ru/space/year',
];

describe.each(['en', 'ru'] as const)('symbolic content preservation for %s', (locale) => {
  const service = new Typographist({
    locale,
    rules: [],
    textLocales: [{ locale, textRules: [] }],
  });

  it.each(fixtures)('preserves %s', (_name, inputs) => {
    for (const input of inputs) {
      expect(service.format(input), input).toBe(input);
      expect(service.format(service.format(input)), input).toBe(input);
    }
  });

  it('preserves missing gaps, extra whitespace and mistakes around converted glyphs', () => {
    const input = '\tword...next!!!??? (  text  ) [  text  ]  \r\n\r\n';
    const expected = '\tword…next!!!??? (  text  ) [  text  ]  \r\n\r\n';

    expect(service.format(input)).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

it.each(removedIds)('rejects removed rule %s', (id) => {
  expect(
    () => new Typographist({ rules: [], textLocales: [{ locale: 'en', textRules: [] }], settings: { [id]: {} } }),
  ).toThrow(TypeError);
});

it('rejects the removed duplicate-quote setting', () => {
  expect(
    () =>
      new Typographist({
        rules: [],
        textLocales: [{ locale: 'en', textRules: [] }],
        settings: { 'common/punctuation/quote': { removeDuplicateQuotes: true } },
      }),
  ).toThrow(TypeError);
});

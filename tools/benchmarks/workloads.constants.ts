import type { Workload } from './benchmark.types.ts';

const russianParagraph =
  'Перенос слов помогает читать длинные предложения. АСБЕСТ ёлка е\u0308лка машина ма\u0301шина 😀 пе\u00adренос. ';
const englishParagraph =
  'Hyphenation improves typography with representative vocabulary. TABLE present computer extraordinary userName ISO9001 first.last+tag@example-domain.com https://example.com/typography 😀. ';

export const createWorkloads = () => {
  let seed = 42;
  const variedWords = Array.from({ length: 2000 }, () => {
    let word = '';

    for (let index = 0; index < 12; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      word += String.fromCharCode(97 + (seed % 26));
    }

    return word;
  }).join(' ');
  const workloads: Workload[] = [
    { name: 'short-en', text: 'table extraordinary', locale: 'en' },
    { name: 'paragraph-ru', text: russianParagraph, locale: 'ru' },
    { name: 'paragraph-en', text: englishParagraph, locale: 'en' },
    { name: 'repeated-words', text: 'extraordinary '.repeat(2000), locale: 'en' },
    { name: 'varied-vocabulary', text: variedWords, locale: 'en' },
  ];

  for (const size of [1000, 4000, 16000]) {
    workloads.push(
      {
        name: `ru-${String(size)}`,
        text: russianParagraph.repeat(Math.ceil(size / russianParagraph.length)),
        locale: 'ru',
      },
      {
        name: `en-${String(size)}`,
        text: englishParagraph.repeat(Math.ceil(size / englishParagraph.length)),
        locale: 'en',
      },
      {
        name: `mixed-en-${String(size)}`,
        text: (russianParagraph + englishParagraph).repeat(
          Math.ceil(size / (russianParagraph.length + englishParagraph.length)),
        ),
        locale: 'en',
      },
      {
        name: `mixed-ru-${String(size)}`,
        text: (russianParagraph + englishParagraph).repeat(
          Math.ceil(size / (russianParagraph.length + englishParagraph.length)),
        ),
        locale: 'ru',
      },
      { name: `long-word-${String(size)}`, text: 'ab'.repeat(size / 2), locale: 'en' },
      { name: `combining-run-${String(size)}`, text: 'a' + '\u0301'.repeat(size) + 'b', locale: 'en' },
      { name: `email-near-match-${String(size)}`, text: 'a.'.repeat(size / 2) + '@invalid', locale: 'en' },
      { name: `scheme-near-match-${String(size)}`, text: 'a'.repeat(size) + ':/word', locale: 'en' },
    );
  }

  return workloads;
};

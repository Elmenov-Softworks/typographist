import type { Workload } from '../benchmark.types.ts';

/** Deterministic text inputs with punctuation, protected addresses and unchanged numeric notation. */
export const createTypographyWorkloads = () => {
  const paragraphs = {
    en: '"Typography"  improves reading... Next - sentence (-1.25). $100 12345 1/2 2026-10-08 word word MiXeD https://example.com/a-b user-name@example.com 😀 e\u0301. ',
    ru: '"Типографика"  помогает читать... Далее - предложение (-1.25). 100 руб. 12345 1/2 2026-10-08 слово слово МiКС https://example.com/a-b user-name@example.com 😀 е\u0301. ',
  };
  const workloads: Workload[] = [];

  for (const locale of ['en', 'ru'] as const) {
    const alphabet = locale === 'en' ? 'abcdefghijklmnopqrstuvwxyz' : 'абвгдежзийклмнопрстуфхцчшщыэюя';
    let seed = 42;
    const uniqueWords = Array.from({ length: 1200 }, () => {
      let word = '';

      for (let index = 0; index < 12; index += 1) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        word += alphabet.charAt(seed % alphabet.length);
      }

      return word;
    }).join(' ');

    workloads.push(
      { name: `long-${locale}`, locale, text: paragraphs[locale].repeat(100) },
      { name: `repeated-${locale}`, locale, text: (locale === 'en' ? 'extraordinary ' : 'типографика ').repeat(1200) },
      { name: `mostly-unique-${locale}`, locale, text: uniqueWords },
    );
  }

  return workloads;
};

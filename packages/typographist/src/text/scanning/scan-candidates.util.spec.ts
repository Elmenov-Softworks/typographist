import { scanCandidates } from '@/text/scanning/scan-candidates.util.js';

const words = (text: string) => scanCandidates(text).map(({ start, end }) => text.slice(start, end));

describe('scanCandidates', () => {
  it('keeps mixed scripts, numbers, underscores, marks and soft hyphens together', () => {
    expect(words('Приветhello v2 user_name пе\u00adренос ма\u0301шина')).toEqual([
      'Приветhello',
      'v2',
      'user_name',
      'пе\u00adренос',
      'ма\u0301шина',
    ]);
  });

  it('separates visible hyphens and retains non-breaking compounds', () => {
    expect(words('mother-in-law mother\u2010in\u2010law mother\u2011in\u2011law')).toEqual([
      'mother',
      'in',
      'law',
      'mother',
      'in',
      'law',
      'mother\u2011in\u2011law',
    ]);
  });

  it('retains internal apostrophes but separates enclosing quotation marks', () => {
    expect(words("'can't' ‘l’homme’ rock''roll")).toEqual(["can't", 'l’homme', 'rock', 'roll']);
  });

  it('retains embedded joiners and lone surrogates without splitting unsupported words', () => {
    expect(words('ab\u200d\u200ccd ab\ud800cd ab\udc00cd')).toEqual(['ab\u200d\u200ccd', 'ab\ud800cd', 'ab\udc00cd']);
  });

  it('leaves trailing joiners and lone surrogates outside candidates', () => {
    expect(words('\u200dab\u200d\ud800 cd\udc00')).toEqual(['ab', 'cd']);
  });

  it('retains variation selectors and supplementary letters with UTF-16 offsets', () => {
    const text = '😀 𐐀a\ufe0f!';

    expect(scanCandidates(text)).toEqual([{ start: 3, end: 7 }]);
    expect(words(text)).toEqual(['𐐀a\ufe0f']);
  });

  it('does not interpret markup, escapes, or entities', () => {
    expect(words('<word> &amp; \\hello')).toEqual(['word', 'amp', 'hello']);
  });

  it('returns no candidates for empty or punctuation-only text', () => {
    expect(scanCandidates('')).toEqual([]);
    expect(scanCandidates("😀 - ‐ ‑ ' ’")).toEqual([]);
  });

  it('handles long mark and unsupported-character runs without losing spans', () => {
    const marked = `a${'\u0301'.repeat(10000)}b`;
    const embedded = `a${'\u200d'.repeat(10000)}b`;
    const trailing = `c${'\ud800'.repeat(10000)}`;

    expect(words(`${marked} ${embedded} ${trailing} d`)).toEqual([marked, embedded, 'c', 'd']);
  });
});

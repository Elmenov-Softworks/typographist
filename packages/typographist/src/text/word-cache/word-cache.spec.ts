import { WordCache } from '@/text/word-cache/word-cache.js';

it.each([-1, NaN, Infinity, -Infinity, '64', null])('rejects invalid cache size %j', (size) => {
  expect(() => {
    Reflect.construct(WordCache, [size]);
  }).toThrow(TypeError);
});

it('refreshes hits and evicts globally across locales within a fractional budget', () => {
  const cache = new WordCache(260 / 1_048_576);
  const compute = vi.fn(() => 'abcd');
  const format = (locale: string, word: string) => cache.format(locale, word, compute);

  format('en', 'abcd');
  format('ru', 'abcd');
  format('en', 'abcd');
  expect(compute).toHaveBeenCalledTimes(2);
  format('en', 'efgh');
  format('en', 'abcd');
  expect(compute).toHaveBeenCalledTimes(3);
  format('ru', 'abcd');
  expect(compute).toHaveBeenCalledTimes(4);
});

it.each([0, 1 / 1_048_576])('does not retain entries with budget %s', (size) => {
  const cache = new WordCache(size);
  const compute = vi.fn(() => 'a\u00adbcd');

  expect(cache.format('en', 'abcd', compute)).toBe('a\u00adbcd');
  expect(cache.format('en', 'abcd', compute)).toBe('a\u00adbcd');
  expect(compute).toHaveBeenCalledTimes(2);
});

it('keeps exact source keys and locale identities distinct and clears retained results', () => {
  const cache = new WordCache(64);
  const compute = vi.fn(() => 'result');

  for (const word of ['abcd', 'ABCD', 'é', 'e\u0301']) {
    cache.format('en', word, compute);
    cache.format('en', word, compute);
  }
  cache.format('ru', 'abcd', compute);
  expect(compute).toHaveBeenCalledTimes(5);

  cache.clear();
  cache.format('en', 'abcd', compute);
  expect(compute).toHaveBeenCalledTimes(6);
});

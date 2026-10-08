type Entry = { result: string; bytes: number };

export class WordCache {
  #budget: number;
  #bytes = 0;
  #entries = new Map<string, Entry>();

  constructor(cacheSize: number) {
    if (typeof cacheSize !== 'number' || !Number.isFinite(cacheSize) || cacheSize < 0) {
      throw new TypeError('cacheSize must be a finite non-negative number of MiB');
    }

    this.#budget = cacheSize * 1_048_576;
  }

  format(locale: string, word: string, compute: () => string) {
    if (this.#budget === 0) {
      return compute();
    }

    const key = JSON.stringify([locale, word]);
    const cached = this.#entries.get(key);

    if (cached !== undefined) {
      this.#entries.delete(key);
      this.#entries.set(key, cached);
      return cached.result;
    }

    const result = compute();
    const bytes = 96 + 2 * (key.length + result.length);

    if (bytes > this.#budget) {
      return result;
    }

    while (this.#bytes + bytes > this.#budget) {
      const oldest = this.#entries.entries().next().value;

      if (oldest === undefined) {
        break;
      }

      this.#entries.delete(oldest[0]);
      this.#bytes -= oldest[1].bytes;
    }

    this.#entries.set(key, { result, bytes });
    this.#bytes += bytes;
    return result;
  }

  clear() {
    this.#entries.clear();
    this.#bytes = 0;
  }
}

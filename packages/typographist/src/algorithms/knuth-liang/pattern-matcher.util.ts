type Contribution = { offset: number; weight: number };
type TrieNode = {
  children: Map<string, TrieNode>;
  contributions: Contribution[];
};

const createNode = () => {
  const children = new Map<string, TrieNode>();
  const contributions: Contribution[] = [];

  return { children, contributions };
};

const parsePattern = (pattern: unknown) => {
  if (typeof pattern !== 'string' || pattern.length === 0) {
    throw new TypeError('Knuth–Liang patterns must be nonempty strings');
  }

  const symbols: string[] = [];
  const weights = [0];
  let previousWasWeight = false;

  for (const symbol of pattern) {
    if (/^[0-9]$/u.test(symbol)) {
      if (previousWasWeight) {
        throw new TypeError('Knuth–Liang patterns use single-digit weights');
      }

      weights[symbols.length] = Number(symbol);
      previousWasWeight = true;
      continue;
    }

    if (/[\s\p{C}\\{}]/u.test(symbol)) {
      throw new TypeError('Knuth–Liang pattern contains an unsupported encoding or symbol');
    }

    symbols.push(symbol);
    weights.push(0);
    previousWasWeight = false;
  }

  if (!symbols.some((symbol) => symbol !== '.')) {
    throw new TypeError('Knuth–Liang pattern must contain a matching symbol');
  }

  for (const [index, symbol] of symbols.entries()) {
    if (symbol === '.' && index !== 0 && index !== symbols.length - 1) {
      throw new TypeError('Knuth–Liang word anchors must be leading or trailing');
    }
  }

  return { symbols, weights };
};

export const preparePatternMatcher = (patterns: readonly string[]) => {
  if (!Array.isArray(patterns)) {
    throw new TypeError('Knuth–Liang patterns must be an array');
  }

  const root = createNode();
  let longestPattern = 0;

  for (const pattern of patterns) {
    const { symbols, weights } = parsePattern(pattern);
    longestPattern = Math.max(longestPattern, symbols.length);
    let node = root;

    for (const symbol of symbols) {
      let child = node.children.get(symbol);

      if (child === undefined) {
        child = createNode();
        node.children.set(symbol, child);
      }

      node = child;
    }

    const combined = new Map(node.contributions.map(({ offset, weight }) => [offset, weight]));

    for (const [offset, weight] of weights.entries()) {
      if (weight > (combined.get(offset) ?? 0)) {
        combined.set(offset, weight);
      }
    }

    node.contributions = Array.from(combined, ([offset, weight]) => ({ offset, weight }));
  }

  const match = (symbols: readonly string[]) => {
    const anchored = ['.', ...symbols, '.'];
    const weights = new Uint8Array(anchored.length + 1);

    for (let start = 0; start < anchored.length; start += 1) {
      let node = root;
      const end = Math.min(anchored.length, start + longestPattern);

      for (let index = start; index < end; index += 1) {
        const symbol = anchored[index];

        if (symbol === undefined) {
          break;
        }

        const child = node.children.get(symbol);

        if (child === undefined) {
          break;
        }

        node = child;

        for (const { offset, weight } of node.contributions) {
          const boundary = start + offset;
          weights[boundary] = Math.max(weights[boundary] ?? 0, weight);
        }
      }
    }

    const positions: number[] = [];

    for (let boundary = 1; boundary < symbols.length; boundary += 1) {
      if ((weights[boundary + 1] ?? 0) % 2 === 1) {
        positions.push(boundary);
      }
    }

    return positions;
  };

  return Object.freeze({ match });
};

export const validatePatterns = (patterns: readonly string[]) => {
  for (const pattern of patterns) {
    if (/[0-9]{2}/u.test(pattern)) {
      throw new TypeError('Patterns use single-digit weights');
    }

    if (/[\s\p{C}\\{}]/u.test(pattern)) {
      throw new TypeError('Pattern contains an unsupported encoding or symbol');
    }

    const symbols = pattern.replace(/[0-9]/gu, '');

    if (!/[^.]/u.test(symbols)) {
      throw new TypeError('Pattern must contain a matching symbol');
    }

    if (symbols.slice(1, -1).includes('.')) {
      throw new TypeError('Word anchors must be leading or trailing');
    }
  }
};

/** Uses the word's previously computed grapheme boundaries for validation and limits. */
export const insertWordBreaks = (
  word: string,
  result: unknown,
  graphemes: readonly number[],
  leftMin: number,
  rightMin: number,
) => {
  if (!Array.isArray(result)) {
    throw new TypeError('Algorithm word breaks must be a synchronous array');
  }

  const positions: readonly unknown[] = result;
  const parts: string[] = [];
  let previous = 0;
  let copied = 0;
  let graphemeIndex = 1;
  const length = graphemes.length - 1;

  for (const position of positions) {
    if (typeof position !== 'number') {
      throw new TypeError('Algorithm word breaks must contain numeric offsets');
    }
    if (!Number.isSafeInteger(position) || position <= previous || position >= word.length) {
      throw new RangeError('Algorithm word breaks must be increasing unique offsets inside the word');
    }

    for (; graphemeIndex < graphemes.length; graphemeIndex += 1) {
      const boundary = graphemes[graphemeIndex];
      if (boundary !== undefined && boundary >= position) {
        break;
      }
    }
    if (graphemes[graphemeIndex] !== position) {
      throw new RangeError('Algorithm word break must be at an original grapheme boundary');
    }
    previous = position;

    if (graphemeIndex >= leftMin && length - graphemeIndex >= rightMin) {
      parts.push(word.slice(copied, position), '\u00ad');
      copied = position;
    }
  }

  if (copied === 0) {
    return word;
  }
  parts.push(word.slice(copied));
  return parts.join('');
};

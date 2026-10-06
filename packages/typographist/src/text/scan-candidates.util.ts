import type { CandidateSpan } from './candidate-span.types.js';

const wordCharacter = /[\p{L}\p{M}\p{N}_\u00ad]/u;
const embeddedCharacter = /[\u200c\u200d\p{Cs}]/u;
const internalSeparator = /['\u2019\u2011]/u;

const readSymbol = (text: string, offset: number) => {
  const codePoint = text.codePointAt(offset);
  return codePoint === undefined ? '' : String.fromCodePoint(codePoint);
};

/** Visible hyphens separate components; non-breaking hyphens keep a compound together. */
export const scanCandidates = (text: string) => {
  const candidates: CandidateSpan[] = [];
  let offset = 0;

  while (offset < text.length) {
    const symbol = readSymbol(text, offset);
    if (!wordCharacter.test(symbol)) {
      offset += symbol.length;
      continue;
    }

    const start = offset;
    offset += symbol.length;
    while (offset < text.length) {
      const next = readSymbol(text, offset);
      if (wordCharacter.test(next)) {
        offset += next.length;
        continue;
      }

      if (internalSeparator.test(next) && wordCharacter.test(readSymbol(text, offset + next.length))) {
        offset += next.length;
        continue;
      }

      if (embeddedCharacter.test(next)) {
        let end = offset + next.length;
        while (end < text.length) {
          const embedded = readSymbol(text, end);
          if (!embeddedCharacter.test(embedded)) {
            break;
          }
          end += embedded.length;
        }
        if (wordCharacter.test(readSymbol(text, end))) {
          offset = end;
          continue;
        }
        break;
      }
      break;
    }

    candidates.push({ start, end: offset });
  }

  return candidates;
};

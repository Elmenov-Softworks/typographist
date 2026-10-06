import type { CandidateSpan } from './candidate-span.types.js';

const asciiLetter = /[A-Za-z]/;
const schemeCharacter = /[A-Za-z0-9+.-]/;
const localCharacter = /[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]/;
const hostnameCharacter = /[A-Za-z0-9-]/;
const addressDelimiter = /[\s"'<>]/u;

const urlEnd = (text: string, start: number) => {
  let end = start;
  while (end < text.length && !addressDelimiter.test(text.charAt(end))) {
    end += 1;
  }
  return end;
};

const hostnameEnd = (text: string, start: number) => {
  let offset = start;
  let labelStart = start;
  let dots = 0;

  while (offset < text.length) {
    const character = text.charAt(offset);
    if (hostnameCharacter.test(character)) {
      if (offset === labelStart && character === '-') {
        return null;
      }
      offset += 1;
      continue;
    }
    if (character !== '.') {
      break;
    }
    if (offset === labelStart || text.charAt(offset - 1) === '-') {
      return null;
    }
    if (!hostnameCharacter.test(text.charAt(offset + 1))) {
      break;
    }
    dots += 1;
    offset += 1;
    labelStart = offset;
  }

  if (dots === 0 || offset === labelStart || text.charAt(offset - 1) === '-') {
    return null;
  }
  return offset;
};

/** Protects scheme:// and www. spans, and ASCII dot-atom email addresses with dotted hostnames. */
export const scanAddresses = (text: string) => {
  const spans: CandidateSpan[] = [];
  let schemeStart: number | null = null;
  let localStart: number | null = null;
  let invalidLocalDots = false;
  let offset = 0;

  while (offset < text.length) {
    const character = text.charAt(offset);
    const www = text.slice(offset, offset + 4).toLowerCase() === 'www.';
    const scheme = character === ':' && schemeStart !== null && text.slice(offset + 1, offset + 3) === '//';

    if (www || scheme) {
      const start = scheme && schemeStart !== null ? schemeStart : offset;
      const end = urlEnd(text, offset);
      spans.push({ start, end });
      offset = end;
      schemeStart = null;
      localStart = null;
      invalidLocalDots = false;
      continue;
    }

    if (character === '@' && localStart !== null && !invalidLocalDots && text.charAt(offset - 1) !== '.') {
      const end = hostnameEnd(text, offset + 1);
      if (end !== null) {
        spans.push({ start: localStart, end });
        offset = end;
        schemeStart = null;
        localStart = null;
        invalidLocalDots = false;
        continue;
      }
    }

    if (!schemeCharacter.test(character)) {
      schemeStart = null;
    } else if (schemeStart === null && asciiLetter.test(character)) {
      schemeStart = offset;
    }

    if (!localCharacter.test(character)) {
      localStart = null;
      invalidLocalDots = false;
    } else if (localStart === null) {
      localStart = offset;
      invalidLocalDots = character === '.';
    } else if (character === '.' && text.charAt(offset - 1) === '.') {
      invalidLocalDots = true;
    }

    offset += 1;
  }

  return spans;
};

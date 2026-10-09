import type { CandidateSpan } from '@/text/scanning/candidate-span.types.js';

const asciiLetter = /[A-Za-z]/;
const schemeCharacter = /[A-Za-z0-9+.-]/;
const localCharacter = /[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]/;
const hostnameCharacter = /[A-Za-z0-9-]/;
const addressDelimiter = /[\s"'<>]/u;

const urlEnd = (text: string, start: number) => {
  const delimiter = text.slice(start).search(addressDelimiter);

  return delimiter === -1 ? text.length : start + delimiter;
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

export const scanAddresses = (text: string) => {
  const spans: CandidateSpan[] = [];
  const markers = /www\.|:\/\/|@/gi;
  let protectedEnd = 0;
  let marker = markers.exec(text);

  while (marker !== null) {
    const offset = marker.index;
    let start = offset;
    let end: number | null = null;

    if (marker[0] === '@') {
      while (start > protectedEnd && localCharacter.test(text.charAt(start - 1))) {
        start -= 1;
      }

      const local = text.slice(start, offset);

      if (local.length > 0 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..')) {
        end = hostnameEnd(text, offset + 1);
      }
    } else if (marker[0] === '://') {
      while (start > protectedEnd && schemeCharacter.test(text.charAt(start - 1))) {
        start -= 1;
      }

      while (start < offset && !asciiLetter.test(text.charAt(start))) {
        start += 1;
      }

      if (start < offset) {
        end = urlEnd(text, offset);
      }
    } else {
      end = urlEnd(text, offset);
    }

    if (end !== null) {
      spans.push({ start, end });
      markers.lastIndex = end;
      protectedEnd = end;
    }

    marker = markers.exec(text);
  }

  return spans;
};

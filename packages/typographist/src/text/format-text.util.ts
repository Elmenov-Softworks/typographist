import { formatWord } from '@/text/word-breaks/format-word.util.js';
import { scanAddresses } from '@/text/scanning/scan-addresses.util.js';
import { scanCandidates } from '@/text/scanning/scan-candidates.util.js';
import type { TextFormattingContext } from '@/text/text-formatting-context.types.js';

export const formatText = (text: string, context: TextFormattingContext) => {
  const { exclusions } = context;

  if (typeof text !== 'string') {
    throw new TypeError('Text must be a string');
  }

  const addresses = exclusions.addresses ? scanAddresses(text) : [];
  const parts: string[] = [];
  let addressIndex = 0;
  let copied = 0;

  for (const { start, end } of scanCandidates(text)) {
    while (addresses[addressIndex] !== undefined) {
      const span = addresses[addressIndex];

      if (span === undefined || span.end > start) {
        break;
      }

      addressIndex += 1;
    }

    const address = addresses[addressIndex];

    if (address !== undefined && address.start < end && address.end > start) {
      continue;
    }

    const word = text.slice(start, end);

    if (exclusions.preserves(word)) {
      continue;
    }

    const replacement = formatWord(word, context);

    if (replacement !== word) {
      parts.push(text.slice(copied, start), replacement);
      copied = end;
    }
  }

  if (copied === 0) {
    return text;
  }

  parts.push(text.slice(copied));

  return parts.join('');
};

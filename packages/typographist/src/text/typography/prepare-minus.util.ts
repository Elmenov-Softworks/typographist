import { segmentBoundary, type SegmentBoundaryContext } from '@/text/typography/segment-boundary.types.js';

export const prepareMinus = () => (text: string, context?: SegmentBoundaryContext) => {
  const boundary = context?.[segmentBoundary];
  const characterAt = (position: number) => {
    if (position < text.length) {
      return text.charAt(position);
    }

    if (boundary !== undefined) {
      return boundary.original.charAt(boundary.end + position - text.length);
    }

    return (context?.followingToken ?? context?.followingCharacter ?? '').charAt(position - text.length);
  };

  return text.replace(/-/g, (minus: string, offset: number) => {
    const before = offset === 0 ? (context?.precedingCharacter ?? '') : text.charAt(offset - 1);

    if (before !== '' && !/[\s([{]/.test(before)) {
      return minus;
    }

    let end = offset + 1;

    if (!/\d/.test(characterAt(end))) {
      return minus;
    }

    while (/\d/.test(characterAt(end))) {
      end += 1;
    }

    while (/[.,/]/.test(characterAt(end)) && /\d/.test(characterAt(end + 1))) {
      end += 2;

      while (/\d/.test(characterAt(end))) {
        end += 1;
      }
    }

    const after = characterAt(end);
    const endsNumber = after === '' || /[\s)\]},;!?]/.test(after);
    const endsSentence = after === '.' && (characterAt(end + 1) === '' || /\s/.test(characterAt(end + 1)));

    return endsNumber || endsSentence ? '−' : minus;
  });
};

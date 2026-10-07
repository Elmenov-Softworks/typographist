import { graphemeSegmenter } from '@/languages/analysis/grapheme-segmenter.constants.js';

export const getGraphemeBoundaries = (word: string) => {
  const boundaries = [0];

  for (const { index, segment } of graphemeSegmenter.segment(word)) {
    boundaries.push(index + segment.length);
  }

  return boundaries;
};

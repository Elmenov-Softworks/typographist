import { matchKhristovClasses } from '@/algorithms/khristov/class-matcher.util.js';

describe('Khristov class matching', () => {
  it.each([
    ['XVV', [1]],
    ['XVC', [1]],
    ['XCV', [1]],
    ['XCC', [1]],
    ['VCCCCV', [3]],
    ['VCCCV', [3]],
    ['CVCV', [2]],
    ['VCCV', [2]],
    ['CVVV', [2]],
    ['CVVC', [2]],
  ])('applies the selected split for %s before minima filtering', (classes, expected) => {
    expect(matchKhristovClasses(Array.from(classes))).toEqual(expected);
  });

  it.each([
    ['CVCVCV', [2, 4]],
    ['VCVCV', [3]],
    ['VCCVCV', [2, 4]],
    ['CVCCCV', [4]],
    ['CVCCCCVCV', [4, 7]],
    ['XCCVCV', [1, 4]],
    ['XVCVCV', [1, 4]],
    ['CVXCV', [3]],
    ['XVVXVV', [1, 4]],
  ])('observes earlier barriers and overlapping starts in %s', (classes, expected) => {
    expect(matchKhristovClasses(Array.from(classes))).toEqual(expected);
  });

  it.each(['', 'V', 'C', 'X', 'XV', 'XC', 'CVX', 'VVVV', 'CCCCC', 'VCCCCCV'])(
    'does not invent a candidate for %j',
    (classes) => {
      expect(matchKhristovClasses(Array.from(classes))).toEqual([]);
    },
  );

  it('keeps symbol indexes independent of UTF-16 lengths and unknown symbols', () => {
    expect(matchKhristovClasses(['C', 'V', '𐐨', 'C', 'V'])).toEqual([]);
  });

  it('does not mutate input or retain marks between calls', () => {
    const classes = Object.freeze(Array.from('CVCVCV'));
    const positions = matchKhristovClasses(classes);
    positions.push(1);

    expect(matchKhristovClasses(classes)).toEqual([2, 4]);
    expect(matchKhristovClasses(Array.from('VVVV'))).toEqual([]);
    expect(classes.join('')).toBe('CVCVCV');
  });
});

const rules = [
  { pattern: 'XVV', offset: 1 },
  { pattern: 'XVC', offset: 1 },
  { pattern: 'XCV', offset: 1 },
  { pattern: 'XCC', offset: 1 },
  { pattern: 'VCCCCV', offset: 3 },
  { pattern: 'VCCCV', offset: 3 },
  { pattern: 'CVCV', offset: 2 },
  { pattern: 'VCCV', offset: 2 },
  { pattern: 'CVVV', offset: 2 },
  { pattern: 'CVVC', offset: 2 },
];

export const matchKhristovClasses = (classes: readonly string[]) => {
  const marked = new Uint8Array(classes.length + 1);

  for (const { pattern, offset } of rules) {
    for (let start = 0; start <= classes.length - pattern.length; start += 1) {
      let matches = true;

      for (let index = 0; index < pattern.length; index += 1) {
        if (classes[start + index] !== pattern[index] || (index > 0 && marked[start + index] === 1)) {
          matches = false;
          break;
        }
      }

      if (matches) {
        marked[start + offset] = 1;
      }
    }
  }

  const positions: number[] = [];

  for (let boundary = 1; boundary < classes.length; boundary += 1) {
    if (marked[boundary] === 1) {
      positions.push(boundary);
    }
  }

  return positions;
};

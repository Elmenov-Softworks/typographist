import { alphabeticKhristovRules } from '#src/languages/bundled/alphabetic-khristov.constants.js';
import { patterns as esPatterns } from '#src/languages/bundled/es-data.constants.js';
import { patterns as frPatterns } from '#src/languages/bundled/fr-data.constants.js';
import { patterns as dePatterns } from '#src/languages/bundled/de-1996-data.constants.js';
import { patterns as ptPatterns } from '#src/languages/bundled/pt-data.constants.js';
import { patterns as itPatterns } from '#src/languages/bundled/it-data.constants.js';
import { TypographistRules } from '#src/rules/typographist-rules.js';

const patternSets = { es: esPatterns, fr: frPatterns, de: dePatterns, pt: ptPatterns, it: itPatterns };

export const createAlphabeticRules = () =>
  alphabeticKhristovRules.map(
    (fast) =>
      new TypographistRules({
        fast,
        standard: {
          locale: fast.locale,
          alphabet: fast.alphabet,
          leftMin: fast.leftMin,
          rightMin: fast.rightMin,
          exceptions: fast.exceptions,
          patterns: patternSets[fast.locale],
        },
      }),
  );

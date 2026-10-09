import { scanCandidates } from '@/text/scanning/scan-candidates.util.js';
import type { HyphenationBoundary } from '@/text/hyphenation-boundary.types.js';
import { segmentBoundary } from '@/text/typography/segment-boundary.types.js';
import { scanAddresses } from '@/text/scanning/scan-addresses.util.js';
import type { CandidateSpan } from '@/text/scanning/candidate-span.types.js';
import type {
  FormattingCategory,
  TextPipelineOptions,
  TextRule,
  TextRuleHandler,
} from '@/text/typography/text-rule.types.js';

const spanAt = <TSpan extends CandidateSpan>(spans: readonly TSpan[], position: number) => {
  let left = 0;
  let right = spans.length;

  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    const token = spans[middle];

    if (token === undefined) {
      break;
    }

    if (position < token.start) {
      right = middle;
    } else if (position >= token.end) {
      left = middle + 1;
    } else {
      return token;
    }
  }

  return null;
};

const categories: readonly FormattingCategory[] = [
  'quotes',
  'dashes',
  'punctuation',
  'spacing',
  'nonbreakingSpacing',
  'hyphenation',
];

export const prepareTextPipeline = (
  rules: readonly TextRule[],
  locale: string,
  options: TextPipelineOptions = {},
  finish: (text: string, boundary?: HyphenationBoundary) => string = (text) => text,
  declaredIds: ReadonlySet<string> = new Set(rules.map((rule) => rule.id)),
  preservesCandidate = (_word: string) => false,
) => {
  const selected = options.categories ?? categories.filter((category) => category !== 'spacing');
  const protectedContent = [...(options.protectedContent ?? [])];
  const ids = new Set<string>();

  if (!Array.isArray(selected) || selected.some((category) => !categories.some((allowed) => allowed === category))) {
    throw new TypeError('Invalid formatting categories');
  }

  if (protectedContent.some((content) => typeof content !== 'string' || content.length === 0)) {
    throw new TypeError('Protected content must contain nonempty strings');
  }

  const prepared: { order: number; handler: TextRuleHandler; id: string }[] = [];

  for (const rule of rules) {
    if (typeof rule.id !== 'string' || rule.id.length === 0 || ids.has(rule.id)) {
      throw new TypeError('Text rule IDs must be nonempty and unique');
    }

    ids.add(rule.id);

    if (
      !categories.some((allowed) => allowed !== 'hyphenation' && allowed === rule.category) ||
      !Number.isFinite(rule.order) ||
      typeof rule.prepare !== 'function'
    ) {
      throw new TypeError(`Invalid text rule: ${rule.id}`);
    }

    const settings = { ...rule.defaults };

    for (const [name, value] of Object.entries(options.settings?.[rule.id] ?? {})) {
      if (!Object.hasOwn(settings, name) || typeof settings[name] !== typeof value) {
        throw new TypeError(`Invalid setting ${name} for text rule ${rule.id}`);
      }

      settings[name] = value;
    }

    if (!selected.includes(rule.category) || (rule.locales !== undefined && !rule.locales.includes(locale))) {
      continue;
    }

    const handler = rule.prepare(Object.freeze(settings));

    if (typeof handler !== 'function') {
      throw new TypeError(`Text rule ${rule.id} must prepare a synchronous handler`);
    }

    prepared.push({ order: rule.order, handler, id: rule.id });
  }

  for (const id of Object.keys(options.settings ?? {})) {
    if (!declaredIds.has(id)) {
      throw new TypeError(`Unknown text rule: ${id}`);
    }
  }

  prepared.sort((left, right) => left.order - right.order);

  const transform = (
    text: string,
    start: number,
    original: string,
    tokenAt: (position: number) => CandidateSpan | null,
    candidateAt: (position: number) => (CandidateSpan & { preserved: boolean }) | null,
  ) => {
    const segmentEnd = start + text.length;
    const context = {
      [segmentBoundary]: { original, end: segmentEnd },
      precedingCharacter: original.slice(Math.max(0, start - 2), start).match(/.$/su)?.[0] ?? '',
      followingCharacter: original.slice(start + text.length, start + text.length + 2).match(/^./su)?.[0] ?? '',
      get precedingToken() {
        const token = tokenAt(start - 1);

        return token === null ? '' : original.slice(token.start, start);
      },
      get followingToken() {
        const end = segmentEnd;
        const token = tokenAt(end);

        return token === null ? '' : original.slice(end, token.end);
      },
      startsLine: start === 0 || /[\r\n\u2028\u2029]/.test(original.charAt(start - 1)),
      startsText: start === 0,
      endsText: start + text.length === original.length,
    };

    for (const rule of prepared) {
      const result: unknown = rule.handler(text, context);

      if (typeof result !== 'string') {
        throw new TypeError(`Text rule ${rule.id} must return a string synchronously`);
      }

      text = result;
    }

    const preceding = start === 0 ? null : candidateAt(start);
    const following = segmentEnd === original.length ? null : candidateAt(segmentEnd - 1);

    return finish(text, {
      preserveStart: preceding !== null && preceding.start < start && preceding.preserved,
      preserveEnd: following !== null && following.end > segmentEnd && following.preserved,
    });
  };

  return (text: string) => {
    if (typeof text !== 'string') {
      throw new TypeError('Text must be a string');
    }

    if (prepared.length === 0 && protectedContent.length === 0) {
      return finish(text);
    }

    let candidates: (CandidateSpan & { preserved: boolean })[] | null = null;
    const candidateAt = (position: number) => {
      candidates ??= scanCandidates(text).map((span) => ({
        ...span,
        preserved: preservesCandidate(text.slice(span.start, span.end)),
      }));

      return spanAt(candidates, position);
    };
    let tokens: CandidateSpan[] | null = null;
    const tokenAt = (position: number) => {
      if (tokens === null) {
        tokens = Array.from(text.matchAll(/[\p{L}\p{M}\p{N}_+.,/\u00ad-]+/gu), (match) => ({
          start: match.index,
          end: match.index + match[0].length,
        }));
      }

      return spanAt(tokens, position);
    };
    const spans: CandidateSpan[] = scanAddresses(text);

    for (const content of protectedContent) {
      let start = text.indexOf(content);

      while (start !== -1) {
        let protectedStart = start;
        let protectedEnd = start + content.length;

        if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(text.slice(start - 1, start + 1))) {
          protectedStart -= 1;
        }

        if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(text.slice(protectedEnd - 1, protectedEnd + 1))) {
          protectedEnd += 1;
        }

        spans.push({ start: protectedStart, end: protectedEnd });
        start = text.indexOf(content, start + 1);
      }
    }

    spans.sort((left, right) => left.start - right.start);
    const parts: string[] = [];
    let copied = 0;

    for (const span of spans) {
      if (span.start > copied) {
        parts.push(transform(text.slice(copied, span.start), copied, text, tokenAt, candidateAt));
      }

      if (span.end > copied) {
        parts.push(text.slice(Math.max(copied, span.start), span.end));
        copied = span.end;
      }
    }

    parts.push(transform(text.slice(copied), copied, text, tokenAt, candidateAt));

    return parts.join('');
  };
};

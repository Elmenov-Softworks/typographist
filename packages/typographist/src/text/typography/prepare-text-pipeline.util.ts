import { scanAddresses } from '@/text/scanning/scan-addresses.util.js';
import type { CandidateSpan } from '@/text/scanning/candidate-span.types.js';
import type {
  FormattingCategory,
  TextPipelineOptions,
  TextRule,
  TextRuleHandler,
} from '@/text/typography/text-rule.types.js';

const categories: readonly FormattingCategory[] = [
  'quotes',
  'dashes',
  'punctuation',
  'spacing',
  'nonbreakingSpacing',
  'hyphenation',
];

export const prepareTextPipeline = (rules: readonly TextRule[], locale: string, options: TextPipelineOptions = {}) => {
  const selected = options.categories ?? categories;
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
    if (!ids.has(id)) {
      throw new TypeError(`Unknown text rule: ${id}`);
    }
  }

  prepared.sort((left, right) => left.order - right.order);

  const transform = (text: string) => {
    for (const rule of prepared) {
      const result: unknown = rule.handler(text);

      if (typeof result !== 'string') {
        throw new TypeError(`Text rule ${rule.id} must return a string synchronously`);
      }

      text = result;
    }

    return text;
  };

  return (text: string) => {
    if (typeof text !== 'string') {
      throw new TypeError('Text must be a string');
    }

    if (prepared.length === 0) {
      return text;
    }

    const spans: CandidateSpan[] = scanAddresses(text);

    for (const content of protectedContent) {
      let start = text.indexOf(content);

      while (start !== -1) {
        spans.push({ start, end: start + content.length });
        start = text.indexOf(content, start + 1);
      }
    }

    spans.sort((left, right) => left.start - right.start);
    const parts: string[] = [];
    let copied = 0;

    for (const span of spans) {
      if (span.start > copied) {
        parts.push(transform(text.slice(copied, span.start)));
      }

      if (span.end > copied) {
        parts.push(text.slice(Math.max(copied, span.start), span.end));
        copied = span.end;
      }
    }

    parts.push(transform(text.slice(copied)));

    return parts.join('');
  };
};

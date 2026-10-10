// @vitest-environment jsdom
import { Typographist, TypographistRules } from '@elmenov-softworks/typographist';
import type { TextRule, TypographistConfig } from '@elmenov-softworks/typographist';
import { act, createElement } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { TypographistProvider, TypographistText, useTypographist } from '@/index.js';

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const HookText = ({ text }: { text: string }) => useTypographist(text);

describe('React integration', () => {
  it('preserves formatting and DOM nodes on parent updates and changes only the affected source', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const format = vi.spyOn(Typographist.prototype, 'format');
    const tree = (text: string, config: TypographistConfig) =>
      createElement(
        TypographistProvider,
        { config },
        createElement('span', null, createElement(HookText, { text })),
        createElement('span', null, createElement(TypographistText, { text: 'unchanged' })),
      );

    try {
      await act(async () => {
        root.render(tree('original', { categories: [] }));
        await Promise.resolve();
      });
      const initialCalls = format.mock.calls.length;
      const firstNode = container.firstChild?.firstChild;
      const secondNode = container.lastChild?.firstChild;
      const mutations: MutationRecord[] = [];
      const observer = new MutationObserver((records) => mutations.push(...records));
      observer.observe(container, { subtree: true, characterData: true, childList: true });

      await act(async () => {
        root.render(tree('original', { categories: [] }));
        await Promise.resolve();
      });
      await act(async () => {
        root.render(tree('original', { categories: [] }));
        await Promise.resolve();
      });

      expect(format).toHaveBeenCalledTimes(initialCalls);
      expect(mutations).toHaveLength(0);
      expect(container.firstChild?.firstChild).toBe(firstNode);
      expect(container.lastChild?.firstChild).toBe(secondNode);

      await act(async () => {
        root.render(tree('changed', { categories: [] }));
        await Promise.resolve();
      });

      expect(format).toHaveBeenCalledTimes(initialCalls + 1);
      expect(container.textContent).toBe('changedunchanged');
      expect(container.lastChild?.firstChild).toBe(secondNode);
      observer.disconnect();
    } finally {
      await act(async () => {
        root.unmount();
        await Promise.resolve();
      });
    }
  });

  it('updates configuration from source, isolates nested providers, and applies locale overrides', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const source = '"Hello" -- машина';
    const tree = (config: TypographistConfig) =>
      createElement(
        TypographistProvider,
        { config },
        createElement('span', null, createElement(TypographistText, { text: source })),
        createElement('span', null, createElement(TypographistText, { text: source, locale: 'ru' })),
        createElement(
          TypographistProvider,
          { config: { categories: [] } },
          createElement(TypographistText, { text: source }),
        ),
      );

    try {
      for (const config of [
        { categories: ['quotes'] as const },
        { locale: 'ru' as const, useFast: true, categories: ['hyphenation'] as const },
        { categories: [] },
      ]) {
        await act(async () => {
          root.render(tree(config));
          await Promise.resolve();
        });

        expect(container.firstChild?.textContent).toBe(new Typographist(config).format(source));
        expect(container.children[1]?.textContent).toBe(new Typographist(config).format(source, 'ru'));
        expect(container.lastChild?.textContent).toBe(source);
      }
    } finally {
      await act(async () => {
        root.unmount();
        await Promise.resolve();
      });
    }
  });

  it('hydrates deterministic text and renders HTML-like source literally', async () => {
    const source = '<b>Unicode Ω\u00ad</b>';
    const tree = createElement(
      TypographistProvider,
      { config: { categories: [] } },
      createElement(TypographistText, { text: source }),
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    const node = container.firstChild;
    const onRecoverableError = vi.fn();
    const root = hydrateRoot(container, tree, { onRecoverableError });

    try {
      await act(async () => {});

      expect(container.textContent).toBe(source);
      expect(container.firstChild).toBe(node);
      expect(container.querySelector('b')).toBeNull();
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await act(async () => {
        root.unmount();
        await Promise.resolve();
      });
    }
  });
});

it.each([
  { direction: 'omitted-first', locale: 'custom-a' as const, override: 'custom-b' as const },
  { direction: 'explicit-first', locale: 'custom-a' as const, override: 'custom-b' as const },
  { direction: 'omitted-first', locale: 'custom-b' as const, override: 'custom-a' as const },
  { direction: 'explicit-first', locale: 'custom-b' as const, override: 'custom-a' as const },
])('updates distinct locale defaults ($direction, default $locale)', async ({ direction, locale, override }) => {
  const createSuffixRule = (suffix: string) => {
    const rule: TextRule = {
      id: 'suffix',
      category: 'spacing',
      order: 0,
      defaults: { suffix },
      prepare: (settings) => (text) => text + String(settings.suffix),
    };

    return rule;
  };
  const omitted: TypographistConfig<'custom-a' | 'custom-b'> = {
    locale,
    categories: ['spacing'],
    textLocales: [
      { locale: 'custom-a', textRules: [createSuffixRule('!')] },
      { locale: 'custom-b', textRules: [createSuffixRule('?')] },
    ],
  };
  const explicit = { ...omitted, settings: { suffix: { suffix: '?' } } };
  const replacements = direction === 'omitted-first' ? [omitted, explicit, omitted] : [explicit, omitted, explicit];
  const container = document.createElement('div');
  const root = createRoot(container);

  try {
    for (const replacement of replacements) {
      await act(async () => {
        root.render(
          createElement(
            TypographistProvider,
            { config: replacement },
            createElement('span', null, createElement(TypographistText, { text: 'source' })),
            createElement('span', null, createElement(TypographistText, { text: 'source', locale: override })),
          ),
        );
        await Promise.resolve();
      });
      const core = new Typographist(replacement);
      expect(container.children[0]?.textContent).toBe(core.format('source'));
      expect(container.children[1]?.textContent).toBe(core.format('source', override));
    }
  } finally {
    await act(async () => {
      root.unmount();
      await Promise.resolve();
    });
  }
});

it.each([{}, { spacing: true }])(
  'preserves bundled quote defaults and preparation in both directions (%j)',
  async (settings) => {
    const prepare = vi.fn(() => (text: string) => text);
    const rule: TextRule = { id: 'preparation-probe', category: 'quotes', order: 0, defaults: {}, prepare };
    const omitted: TypographistConfig = { textRules: [rule] };
    const explicit: TypographistConfig = { ...omitted, settings: { 'common/punctuation/quote': settings } };
    const container = document.createElement('div');
    const format = vi.spyOn(Typographist.prototype, 'format');
    const root = createRoot(container);
    const update = async (config: TypographistConfig) => {
      await act(async () => {
        root.render(
          createElement(
            TypographistProvider,
            { config },
            createElement(TypographistText, { text: '"source"' }),
            createElement(TypographistText, { text: '"source"', locale: 'ru' }),
          ),
        );
        await Promise.resolve();
      });
    };
    try {
      await update(omitted);
      const preparations = prepare.mock.calls.length;
      const calls = format.mock.calls.length;
      const output = container.textContent;
      for (const config of [explicit, omitted, explicit]) {
        await update(config);
        expect(prepare).toHaveBeenCalledTimes(preparations);
        expect(format).toHaveBeenCalledTimes(calls);
        expect(container.textContent).toBe(output);
      }
    } finally {
      await act(async () => {
        root.unmount();
        await Promise.resolve();
      });
    }
  },
);

it.each(['en', 'ru'] as const)(
  'preserves explicit %s plugin quote defaults without formatting again',
  async (locale) => {
    const prepare = vi.fn(() => (text: string) => text);
    const rule: TextRule = { id: 'preparation-probe', category: 'quotes', order: 0, defaults: {}, prepare };
    const plugin = new TypographistRules({
      standard: { locale, alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'] },
      fast: { locale, alphabet: 'abcd', leftMin: 1, rightMin: 1, vowels: 'a', consonants: 'bcd', specialLetters: '' },
    });
    const compile = vi.spyOn(plugin, 'compile');
    const settings = { left: locale === 'en' ? '“‘' : '«„‚', right: locale === 'en' ? '”’' : '»“‘', spacing: true };
    const omitted: TypographistConfig = { locale, rules: [plugin], textRules: [rule] };
    const explicit: TypographistConfig = { ...omitted, settings: { 'common/punctuation/quote': settings } };
    const container = document.createElement('div');
    const format = vi.spyOn(Typographist.prototype, 'format');
    const root = createRoot(container);
    const update = async (config: TypographistConfig) => {
      await act(async () => {
        root.render(
          createElement(
            TypographistProvider,
            { config },
            createElement(TypographistText, { text: '"source"' }),
            createElement(TypographistText, { text: '"source"', locale }),
          ),
        );
        await Promise.resolve();
      });
    };
    try {
      await update(omitted);
      const compilations = compile.mock.calls.length;
      const preparations = prepare.mock.calls.length;
      const calls = format.mock.calls.length;
      const output = container.textContent;
      for (const config of [explicit, omitted, explicit]) {
        await update(config);
        expect(compile).toHaveBeenCalledTimes(compilations);
        expect(prepare).toHaveBeenCalledTimes(preparations);
        expect(format).toHaveBeenCalledTimes(calls);
        expect(container.textContent).toBe(output);
      }
    } finally {
      await act(async () => {
        root.unmount();
        await Promise.resolve();
      });
    }
  },
);

it.each(['en', 'ru'] as const)(
  'reuses the result for omitted and explicit %s overrides in both directions',
  async (locale) => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const source = '"source"';
    const expected = new Typographist({ locale }).format(source);
    const format = vi.spyOn(Typographist.prototype, 'format');
    const tree = (override?: string) =>
      createElement(
        TypographistProvider,
        { config: { locale } },
        createElement(TypographistText, { text: source, ...(override === undefined ? {} : { locale: override }) }),
      );

    try {
      await act(async () => {
        root.render(tree());
        await Promise.resolve();
      });
      const calls = format.mock.calls.length;
      const node = container.firstChild;
      const mutations: MutationRecord[] = [];
      const observer = new MutationObserver((records) => mutations.push(...records));
      observer.observe(container, { subtree: true, characterData: true, childList: true });

      try {
        await act(async () => {
          root.render(tree(locale));
          await Promise.resolve();
        });
        await act(async () => {
          root.render(tree());
          await Promise.resolve();
        });
        expect(format).toHaveBeenCalledTimes(calls);
        expect(container.textContent).toBe(expected);
        expect(container.firstChild).toBe(node);
        expect(mutations).toHaveLength(0);
        await act(async () => {
          root.render(tree(locale === 'en' ? 'ru' : 'en'));
          await Promise.resolve();
        });
        expect(format).toHaveBeenCalledTimes(calls + 1);
      } finally {
        observer.disconnect();
      }
    } finally {
      await act(async () => {
        root.unmount();
        await Promise.resolve();
      });
    }
  },
);

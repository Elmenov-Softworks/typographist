// @vitest-environment jsdom
import { Typographist } from '@elmenov-softworks/typographist';
import type { TypographistConfig } from '@elmenov-softworks/typographist';
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

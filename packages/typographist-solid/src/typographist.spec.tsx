// @vitest-environment jsdom
import { Worker } from 'node:worker_threads';

import { Typographist } from '@elmenov-softworks/typographist';
import type { TypographistConfig } from '@elmenov-softworks/typographist';
import { createSignal } from 'solid-js';
import { hydrate, render } from 'solid-js/web';

import { TypographistProvider, TypographistText, useTypographist } from '@/index.js';

afterEach(() => vi.restoreAllMocks());

it('preserves unchanged formatting and DOM through parent and equivalent configuration updates', async () => {
  const [config, setConfig] = createSignal<TypographistConfig>({ categories: [] });
  const [text, setText] = createSignal('original');
  const [parent, setParent] = createSignal(0);
  const HookText = () => {
    const formatted = useTypographist(() => {
      parent();
      return text();
    });
    return <span title={String(parent())}>{formatted()}</span>;
  };
  const container = document.createElement('div');
  const format = vi.spyOn(Typographist.prototype, 'format');
  const dispose = render(
    () => (
      <TypographistProvider config={config()}>
        <HookText />
        <TypographistText text="unchanged" />
      </TypographistProvider>
    ),
    container,
  );
  const calls = format.mock.calls.length;
  const node = container.firstChild?.firstChild;
  const mutations: MutationRecord[] = [];
  const observer = new MutationObserver((records) => mutations.push(...records));
  observer.observe(container, { subtree: true, characterData: true, childList: true });

  try {
    for (let index = 1; index <= 2; index++) {
      setParent(index);
      setConfig({ categories: [] });
    }
    await Promise.resolve();
    expect(format).toHaveBeenCalledTimes(calls);
    expect(mutations).toHaveLength(0);
    expect(container.firstChild?.firstChild).toBe(node);

    setText('changed');
    expect(format).toHaveBeenCalledTimes(calls + 1);
    expect(container.textContent).toBe('changedunchanged');
  } finally {
    observer.disconnect();
    dispose();
  }
});

it('updates from source while preserving locale overrides and nested provider isolation', () => {
  const source = '"Hello" -- машина';
  const [config, setConfig] = createSignal<TypographistConfig>({ categories: ['quotes'] });
  const container = document.createElement('div');
  const dispose = render(
    () => (
      <TypographistProvider config={config()}>
        <span>
          <TypographistText text={source} />
        </span>
        <span>
          <TypographistText text={source} locale="ru" />
        </span>
        <TypographistProvider config={{ categories: [] }}>
          <span>
            <TypographistText text={source} />
          </span>
        </TypographistProvider>
      </TypographistProvider>
    ),
    container,
  );

  try {
    for (const replacement of [
      { locale: 'ru' as const, categories: ['hyphenation'] as const, useFast: true },
      { categories: [] },
    ]) {
      setConfig(replacement);
      expect(container.children[0]?.textContent).toBe(new Typographist(replacement).format(source));
      expect(container.children[1]?.textContent).toBe(new Typographist(replacement).format(source, 'ru'));
      expect(container.children[2]?.textContent).toBe(source);
    }
  } finally {
    dispose();
  }
});

it('renders HTML-like source literally and preserves core boundary behavior', () => {
  const sources = ['', '<b>Ω\u00ad</b>', 'https://example.com', 'машина'];
  const container = document.createElement('div');
  const dispose = render(
    () => (
      <TypographistProvider>
        {sources.map((text) => (
          <span>
            <TypographistText text={text} />
          </span>
        ))}
      </TypographistProvider>
    ),
    container,
  );

  try {
    sources.forEach((source, index) => {
      expect(container.children[index]?.textContent).toBe(new Typographist().format(source));
    });
    expect(container.querySelector('b')).toBeNull();
  } finally {
    dispose();
  }
});

it('reports a missing provider', () => {
  expect(() => useTypographist(() => 'source')).toThrow('requires a TypographistProvider');
});

it('hydrates parsed output from the built public server entry as literal text', async () => {
  const source = '<b>Ω\u00ad</b> &amp; <img src=x onerror="alert(1)">';
  const worker = new Worker(
    `const { parentPort } = require('node:worker_threads');
     (async () => {
       const { createComponent } = await import('solid-js');
       const { renderToString } = await import('solid-js/web');
       const { TypographistProvider, TypographistText } = await import(${JSON.stringify(import.meta.resolve('@elmenov-softworks/typographist-solid'))});
       if (typeof window !== 'undefined') throw new Error('Browser globals on server');
       parentPort.postMessage(renderToString(() => createComponent(TypographistProvider, {
         config: { categories: [] },
         get children() { return createComponent(TypographistText, { text: ${JSON.stringify(source)} }); }
       })));
     })();`,
    { eval: true, execArgv: [] },
  );
  const serverOutput = await new Promise<string>((resolve, reject) => {
    worker.once('message', (output: unknown) => {
      if (typeof output === 'string') resolve(output);
      else reject(new Error('Expected server HTML'));
    });
    worker.once('error', reject);
  });
  await worker.terminate();
  const container = document.createElement('div');
  container.innerHTML = serverOutput;
  expect(container.textContent).toBe(source);
  expect(container.childNodes).toHaveLength(1);
  expect(container.firstChild?.nodeType).toBe(Node.TEXT_NODE);
  expect(container.children).toHaveLength(0);
  const serverNode = container.firstChild;
  Object.defineProperty(globalThis, '_$HY', {
    configurable: true,
    value: { done: false, events: [], r: {} },
  });
  const dispose = hydrate(
    () => (
      <TypographistProvider config={{ categories: [] }}>
        <TypographistText text={source} />
      </TypographistProvider>
    ),
    container,
  );

  try {
    expect(container.textContent).toBe(source);
    expect(container.firstChild).toBe(serverNode);
    expect(container.querySelector('b')).toBeNull();
    expect(container.children).toHaveLength(0);
  } finally {
    dispose();
    Reflect.deleteProperty(globalThis, '_$HY');
  }
});

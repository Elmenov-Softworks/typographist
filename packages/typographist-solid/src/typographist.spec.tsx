// @vitest-environment jsdom
import { Worker } from 'node:worker_threads';

import { Typographist, TypographistRules } from '@elmenov-softworks/typographist';
import type { TextRule, TypographistConfig } from '@elmenov-softworks/typographist';
import { catchError, createSignal } from 'solid-js';
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
         config: {},
         get children() { return createComponent(TypographistText, { disabled: true, locale: 'unknown', text: ${JSON.stringify(source)} }); }
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
  document.body.append(container);
  Object.defineProperty(globalThis, '_$HY', {
    configurable: true,
    value: { done: false, events: [], r: {} },
  });
  const dispose = hydrate(
    () => (
      <TypographistProvider>
        <TypographistText text={source} locale="unknown" disabled />
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
    container.remove();
    Reflect.deleteProperty(globalThis, '_$HY');
  }
});

it.each([
  { direction: 'omitted-first', locale: 'custom-a' as const, override: 'custom-b' as const },
  { direction: 'explicit-first', locale: 'custom-a' as const, override: 'custom-b' as const },
  { direction: 'omitted-first', locale: 'custom-b' as const, override: 'custom-a' as const },
  { direction: 'explicit-first', locale: 'custom-b' as const, override: 'custom-a' as const },
])('updates distinct locale defaults ($direction, default $locale)', ({ direction, locale, override }) => {
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
  const [config, setConfig] = createSignal(direction === 'omitted-first' ? omitted : explicit);
  const dispose = render(
    () => (
      <TypographistProvider config={config()}>
        <span>
          <TypographistText text="source" />
        </span>
        <span>
          <TypographistText text="source" locale={override} />
        </span>
      </TypographistProvider>
    ),
    container,
  );

  try {
    for (const replacement of replacements) {
      setConfig(replacement);
      const core = new Typographist(replacement);
      expect(container.children[0]?.textContent).toBe(core.format('source'));
      expect(container.children[1]?.textContent).toBe(core.format('source', override));
    }
  } finally {
    dispose();
  }
});

it.each([{}, { spacing: true }])(
  'preserves bundled quote defaults and preparation in both directions (%j)',
  (settings) => {
    const prepare = vi.fn(() => (text: string) => text);
    const rule: TextRule = { id: 'preparation-probe', category: 'quotes', order: 0, defaults: {}, prepare };
    const omitted: TypographistConfig = { textRules: [rule] };
    const explicit: TypographistConfig = { ...omitted, settings: { 'common/punctuation/quote': settings } };
    const container = document.createElement('div');
    const format = vi.spyOn(Typographist.prototype, 'format');
    const [config, setConfig] = createSignal(omitted);
    const dispose = render(
      () => (
        <TypographistProvider config={config()}>
          <TypographistText text={'"source"'} />
          <TypographistText text={'"source"'} locale="ru" />
        </TypographistProvider>
      ),
      container,
    );
    try {
      const preparations = prepare.mock.calls.length;
      const calls = format.mock.calls.length;
      const output = container.textContent;
      for (const replacement of [explicit, omitted, explicit]) {
        setConfig(replacement);
        expect(prepare).toHaveBeenCalledTimes(preparations);
        expect(format).toHaveBeenCalledTimes(calls);
        expect(container.textContent).toBe(output);
      }
    } finally {
      dispose();
    }
  },
);

it.each(['en', 'ru'] as const)('preserves explicit %s plugin quote defaults without formatting again', (locale) => {
  const prepare = vi.fn(() => (text: string) => text);
  const rule: TextRule = { id: 'preparation-probe', category: 'quotes', order: 0, defaults: {}, prepare };
  const plugin = new TypographistRules({
    standard: { locale, alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'] },
    fast: { locale, alphabet: 'abcd', leftMin: 1, rightMin: 1, vowels: 'a', consonants: 'bcd', specialLetters: '' },
  });
  const compile = vi.spyOn(plugin, 'compile');
  const settings = { left: locale === 'en' ? '“‘' : '«„‚', right: locale === 'en' ? '”’' : '»“‘', spacing: true };
  const omitted: TypographistConfig = { locale, rules: [plugin], textRules: [rule] };
  const explicit: TypographistConfig = {
    ...omitted,
    settings: {
      'common/punctuation/quote': settings,
      ...(locale === 'en' ? { 'ru/dash/years': { dash: '–' } } : {}),
    },
  };
  const container = document.createElement('div');
  const format = vi.spyOn(Typographist.prototype, 'format');
  const [config, setConfig] = createSignal(omitted);
  const dispose = render(
    () => (
      <TypographistProvider config={config()}>
        <TypographistText text={'"source"'} />
        <TypographistText text={'"source"'} locale={locale} />
      </TypographistProvider>
    ),
    container,
  );
  try {
    const compilations = compile.mock.calls.length;
    const preparations = prepare.mock.calls.length;
    const calls = format.mock.calls.length;
    const output = container.textContent;
    for (const replacement of [explicit, omitted, explicit]) {
      setConfig(replacement);
      expect(compile).toHaveBeenCalledTimes(compilations);
      expect(prepare).toHaveBeenCalledTimes(preparations);
      expect(format).toHaveBeenCalledTimes(calls);
      expect(container.textContent).toBe(output);
    }
  } finally {
    dispose();
  }
});

it.each(['en', 'ru'] as const)(
  'reuses the result for omitted and explicit %s overrides in both directions',
  async (locale) => {
    const [override, setOverride] = createSignal<string>();
    const source = '"source"';
    const expected = new Typographist({ locale }).format(source);
    const format = vi.spyOn(Typographist.prototype, 'format');
    const container = document.createElement('div');
    const dispose = render(
      () => (
        <TypographistProvider config={{ locale }}>
          <TypographistText text={source} locale={override()} />
        </TypographistProvider>
      ),
      container,
    );
    const calls = format.mock.calls.length;
    const node = container.firstChild;
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver((records) => mutations.push(...records));
    observer.observe(container, { subtree: true, characterData: true, childList: true });

    try {
      setOverride(locale);
      setOverride(undefined);
      await Promise.resolve();
      expect(format).toHaveBeenCalledTimes(calls);
      expect(container.textContent).toBe(expected);
      expect(container.firstChild).toBe(node);
      expect(mutations).toHaveLength(0);
      setOverride(locale === 'en' ? 'ru' : 'en');
      expect(format).toHaveBeenCalledTimes(calls + 1);
    } finally {
      observer.disconnect();
      dispose();
    }
  },
);

it('rejects initial null configuration through the public provider', () => {
  const error = new TypeError('Typographist config must be an object');
  expect(() => {
    Reflect.construct(Typographist, [null]);
  }).toThrow(error);
  const props = { config: {} };
  Reflect.set(props, 'config', null);
  expect(() => render(() => <TypographistProvider {...props} />, document.createElement('div'))).toThrow(error);
});

it('preserves valid provider state after a null configuration update', () => {
  const initial: TypographistConfig = { categories: [], locale: 'ru' };
  const [config, setConfig] = createSignal(initial);
  const [text, setText] = createSignal('"source"');
  const errors: unknown[] = [];
  const container = document.createElement('div');
  const format = vi.spyOn(Typographist.prototype, 'format');
  const dispose = render(
    () =>
      catchError(
        () => (
          <TypographistProvider config={config()}>
            <TypographistText text={text()} />
          </TypographistProvider>
        ),
        (error) => errors.push(error),
      ),
    container,
  );

  const formatter = format.mock.contexts[0];

  try {
    Reflect.apply(setConfig, null, [null]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(TypeError);
    expect(errors[0]).toHaveProperty('message', 'Typographist config must be an object');
    expect(container.textContent).toBe('"source"');
    setConfig(initial);
    setText('"changed"');
    expect(format.mock.contexts.at(-1)).toBe(formatter);
    expect(container.textContent).toBe(new Typographist(initial).format(text()));
  } finally {
    dispose();
  }
});

it('bypasses formatting and locale lookup while disabled and resumes from current inputs', () => {
  const [text, setText] = createSignal('"source"');
  const [locale, setLocale] = createSignal('en');
  const [disabled, setDisabled] = createSignal(true);
  const [config, setConfig] = createSignal<TypographistConfig<string>>({ categories: ['quotes'] });
  const lookup = vi.fn(locale);
  const format = vi.spyOn(Typographist.prototype, 'format');
  const HookText = () => {
    const output = useTypographist(text, lookup, disabled);
    return <span>{output()}</span>;
  };
  const container = document.createElement('div');
  const dispose = render(
    () => (
      <TypographistProvider config={config()}>
        <HookText />
        <span>
          <TypographistText text={text()} locale={locale()} disabled={disabled()} />
        </span>
      </TypographistProvider>
    ),
    container,
  );
  const expectText = (expected: string) => {
    expect(container.children[0]?.textContent).toBe(expected);
    expect(container.children[1]?.textContent).toBe(expected);
  };

  try {
    expectText(text());
    setText('<b>changed\u00ad</b>');
    setLocale('unknown');
    setConfig({ locale: 'ru', categories: ['quotes'] });
    expectText(text());
    expect(lookup).not.toHaveBeenCalled();
    expect(format).not.toHaveBeenCalled();

    setLocale('ru');
    setText('"changed"');
    setDisabled(false);
    expectText(new Typographist({ categories: ['quotes'] }).format(text(), 'ru'));
    setDisabled(true);
    expectText(text());
    const calls = format.mock.calls.length;
    setLocale('unknown');
    setConfig({ locale: 'unknown', unsupportedLocale: 'preserve' });
    setText('"latest"');
    expectText(text());
    expect(format).toHaveBeenCalledTimes(calls);
    setDisabled(false);
    expectText(text());
    setLocale('en');
    expectText(new Typographist().format(text(), 'en'));
    setConfig({ categories: [] });
    expectText(text());
  } finally {
    dispose();
  }
});

it('still requires a provider when disabled', () => {
  expect(() =>
    useTypographist(
      () => 'source',
      () => 'unknown',
      () => true,
    ),
  ).toThrow('TypographistProvider');
});

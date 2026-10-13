// @vitest-environment jsdom
import { Typographist, TypographistRules } from '@elmenov-softworks/typographist';
import type { TextRule, TypographistConfig } from '@elmenov-softworks/typographist';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import { renderToString } from 'vue/server-renderer';

import { TypographistProvider, TypographistText, useTypographist } from '@/index.js';

afterEach(() => vi.restoreAllMocks());

it('keeps unchanged derivations and DOM stable across equivalent config and parent updates', async () => {
  const config = shallowRef<TypographistConfig>({ categories: [] });
  const text = ref('original');
  const parent = ref(0);
  const HookText = defineComponent({
    setup() {
      const formatted = useTypographist(text);
      return () => h('span', { title: String(parent.value) }, formatted.value);
    },
  });
  const app = createApp(() =>
    h(
      TypographistProvider,
      { config: config.value },
      {
        default: () => [h(HookText), h('span', h(TypographistText, { text: 'unchanged' }))],
      },
    ),
  );
  const container = document.createElement('div');
  const format = vi.spyOn(Typographist.prototype, 'format');
  app.mount(container);
  const calls = format.mock.calls.length;
  const node = container.children[0]?.firstChild;
  const mutations: MutationRecord[] = [];
  const observer = new MutationObserver((records) => mutations.push(...records));
  observer.observe(container, { subtree: true, characterData: true, childList: true });

  try {
    for (let index = 1; index <= 2; index++) {
      parent.value = index;
      config.value = { categories: [] };
      await nextTick();
    }
    expect(format).toHaveBeenCalledTimes(calls);
    expect(mutations).toHaveLength(0);
    expect(container.children[0]?.firstChild).toBe(node);

    text.value = 'changed';
    await nextTick();
    expect(format).toHaveBeenCalledTimes(calls + 1);
    expect(container.textContent).toBe('changedunchanged');
  } finally {
    observer.disconnect();
    app.unmount();
  }
});

it('skips formatting for getter containers with unchanged text and locale', async () => {
  const record = ref<{ text: string; locale: 'en' | 'ru'; metadata: number }>({
    text: '"Hello"',
    locale: 'en',
    metadata: 0,
  });
  const HookText = defineComponent({
    setup() {
      const formatted = useTypographist(
        () => record.value.text,
        () => record.value.locale,
      );
      return () => h('span', { title: String(record.value.metadata) }, formatted.value);
    },
  });
  const config = { categories: ['quotes'] as const };
  const core = new Typographist(config);
  const initialOutput = core.format(record.value.text, record.value.locale);
  const app = createApp(() => h(TypographistProvider, { config }, { default: () => h(HookText) }));
  const container = document.createElement('div');
  const format = vi.spyOn(Typographist.prototype, 'format');
  app.mount(container);
  const calls = format.mock.calls.length;
  const node = container.firstChild?.firstChild;
  const mutations: MutationRecord[] = [];
  const observer = new MutationObserver((records) => mutations.push(...records));
  observer.observe(container, { subtree: true, characterData: true, childList: true });

  try {
    for (let metadata = 1; metadata <= 2; metadata++) {
      record.value = { ...record.value, metadata };
      await nextTick();
      expect(container.textContent).toBe(initialOutput);
      expect(format).toHaveBeenCalledTimes(calls);
    }
    expect(mutations).toHaveLength(0);
    expect(container.firstChild?.firstChild).toBe(node);

    record.value = { ...record.value, text: '"Changed"' };
    await nextTick();
    expect(format).toHaveBeenCalledTimes(calls + 1);
    expect(container.textContent).toBe(core.format(record.value.text, record.value.locale));

    const callsBeforeLocaleChange = format.mock.calls.length;
    record.value = { ...record.value, locale: 'ru' };
    await nextTick();
    expect(format).toHaveBeenCalledTimes(callsBeforeLocaleChange + 1);
    expect(container.textContent).toBe(core.format(record.value.text, record.value.locale));
  } finally {
    observer.disconnect();
    app.unmount();
  }
});

it('recomputes from source with locale overrides and isolated nested configuration', async () => {
  const source = '"Hello" -- машина';
  const config = shallowRef<TypographistConfig>({ categories: ['quotes'] });
  const app = createApp(() =>
    h(
      TypographistProvider,
      { config: config.value },
      {
        default: () => [
          h('span', h(TypographistText, { text: source })),
          h('span', h(TypographistText, { text: source, locale: 'ru' })),
          h(
            TypographistProvider,
            { config: { categories: [] } },
            {
              default: () => h('span', h(TypographistText, { text: source })),
            },
          ),
        ],
      },
    ),
  );
  const container = document.createElement('div');
  app.mount(container);

  try {
    for (const replacement of [
      { locale: 'ru' as const, categories: ['hyphenation'] as const, useFast: true },
      { categories: [] },
    ]) {
      config.value = replacement;
      await nextTick();
      expect(container.children[0]?.textContent).toBe(new Typographist(replacement).format(source));
      expect(container.children[1]?.textContent).toBe(new Typographist(replacement).format(source, 'ru'));
      expect(container.children[2]?.textContent).toBe(source);
    }
  } finally {
    app.unmount();
  }
});

it('hydrates text literally without replacing the server text node', async () => {
  const source = '<b>Unicode Ω\u00ad</b>';
  const Root = () =>
    h(
      TypographistProvider,
      { config: { categories: [] } },
      {
        default: () => h(TypographistText, { text: source }),
      },
    );
  const container = document.createElement('div');
  container.innerHTML = await renderToString(createSSRApp(Root));
  const textNode = Array.from(container.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  const app = createSSRApp(Root);
  app.mount(container);

  try {
    expect(container.textContent).toBe(source);
    expect(Array.from(container.childNodes)).toContain(textNode);
    expect(container.querySelector('b')).toBeNull();
  } finally {
    app.unmount();
  }
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
  const config = shallowRef(direction === 'omitted-first' ? omitted : explicit);
  const app = createApp(() =>
    h(
      TypographistProvider,
      { config: config.value },
      {
        default: () => [
          h('span', h(TypographistText, { text: 'source' })),
          h('span', h(TypographistText, { text: 'source', locale: override })),
        ],
      },
    ),
  );
  app.mount(container);

  try {
    for (const replacement of replacements) {
      config.value = replacement;
      await nextTick();
      const core = new Typographist(replacement);
      expect(container.children[0]?.textContent).toBe(core.format('source'));
      expect(container.children[1]?.textContent).toBe(core.format('source', override));
    }
  } finally {
    app.unmount();
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
    const config = shallowRef(omitted);
    const app = createApp(() =>
      h(
        TypographistProvider,
        { config: config.value },
        {
          default: () => [
            h(TypographistText, { text: '"source"' }),
            h(TypographistText, { text: '"source"', locale: 'ru' }),
          ],
        },
      ),
    );
    app.mount(container);
    try {
      const preparations = prepare.mock.calls.length;
      const calls = format.mock.calls.length;
      const output = container.textContent;
      for (const replacement of [explicit, omitted, explicit]) {
        config.value = replacement;
        await nextTick();
        expect(prepare).toHaveBeenCalledTimes(preparations);
        expect(format).toHaveBeenCalledTimes(calls);
        expect(container.textContent).toBe(output);
      }
    } finally {
      app.unmount();
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
    const explicit: TypographistConfig = {
      ...omitted,
      settings: {
        'common/punctuation/quote': settings,
        ...(locale === 'en' ? { 'ru/dash/years': { dash: '–' } } : {}),
      },
    };
    const container = document.createElement('div');
    const format = vi.spyOn(Typographist.prototype, 'format');
    const config = shallowRef(omitted);
    const app = createApp(() =>
      h(
        TypographistProvider,
        { config: config.value },
        {
          default: () => [h(TypographistText, { text: '"source"' }), h(TypographistText, { text: '"source"', locale })],
        },
      ),
    );
    app.mount(container);
    try {
      const compilations = compile.mock.calls.length;
      const preparations = prepare.mock.calls.length;
      const calls = format.mock.calls.length;
      const output = container.textContent;
      for (const replacement of [explicit, omitted, explicit]) {
        config.value = replacement;
        await nextTick();
        expect(compile).toHaveBeenCalledTimes(compilations);
        expect(prepare).toHaveBeenCalledTimes(preparations);
        expect(format).toHaveBeenCalledTimes(calls);
        expect(container.textContent).toBe(output);
      }
    } finally {
      app.unmount();
    }
  },
);

it.each(['en', 'ru'] as const)(
  'reuses the result for omitted and explicit %s overrides in both directions',
  async (locale) => {
    const override = ref<string>();
    const source = '"source"';
    const expected = new Typographist({ locale }).format(source);
    const format = vi.spyOn(Typographist.prototype, 'format');
    const app = createApp(() =>
      h(
        TypographistProvider,
        { config: { locale } },
        {
          default: () =>
            h(TypographistText, { text: source, ...(override.value === undefined ? {} : { locale: override.value }) }),
        },
      ),
    );
    const container = document.createElement('div');
    app.mount(container);
    const calls = format.mock.calls.length;
    const node = container.firstChild;
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver((records) => mutations.push(...records));
    observer.observe(container, { subtree: true, characterData: true, childList: true });

    try {
      override.value = locale;
      await nextTick();
      override.value = undefined;
      await nextTick();
      expect(format).toHaveBeenCalledTimes(calls);
      expect(container.textContent).toBe(expected);
      expect(container.firstChild).toBe(node);
      expect(mutations).toHaveLength(0);
      override.value = locale === 'en' ? 'ru' : 'en';
      await nextTick();
      expect(format).toHaveBeenCalledTimes(calls + 1);
    } finally {
      observer.disconnect();
      app.unmount();
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
  const app = createApp(() => h(TypographistProvider, props));
  app.config.warnHandler = () => {};
  app.config.errorHandler = (caught) => {
    throw caught;
  };

  expect(() => app.mount(document.createElement('div'))).toThrow(error);
});

it('preserves valid provider state after a null configuration update', async () => {
  const initial: TypographistConfig = { categories: [], locale: 'ru' };
  const config = shallowRef(initial);
  const text = ref('"source"');
  const errors: unknown[] = [];
  const app = createApp(() =>
    h(
      TypographistProvider,
      { config: config.value },
      {
        default: () => h(TypographistText, { text: text.value }),
      },
    ),
  );
  app.config.errorHandler = (error) => errors.push(error);
  const container = document.createElement('div');
  const format = vi.spyOn(Typographist.prototype, 'format');
  app.mount(container);
  const formatter = format.mock.contexts[0];

  try {
    Reflect.set(config, 'value', null);
    await nextTick();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(TypeError);
    expect(errors[0]).toHaveProperty('message', 'Typographist config must be an object');
    config.value = initial;
    text.value = '"changed"';
    await nextTick();
    expect(format.mock.contexts.at(-1)).toBe(formatter);
    expect(container.textContent).toBe(new Typographist(initial).format(text.value));
  } finally {
    app.unmount();
  }
});

it('bypasses locale lookup while disabled and resumes with current reactive inputs', async () => {
  const text = ref('"source"');
  const locale = ref('en');
  const disabled = ref(false);
  const config = shallowRef<TypographistConfig<string>>({ categories: ['quotes'] });
  const readLocale = vi.fn(() => locale.value);
  const HookText = defineComponent({
    setup() {
      const formatted = useTypographist(text, readLocale, disabled);
      return () => h('span', formatted.value);
    },
  });
  const app = createApp(() =>
    h(
      TypographistProvider,
      { config: config.value },
      {
        default: () => [
          h(HookText),
          h('span', h(TypographistText, { text: text.value, locale: locale.value, disabled: disabled.value })),
        ],
      },
    ),
  );
  const container = document.createElement('div');
  const format = vi.spyOn(Typographist.prototype, 'format');
  app.mount(container);

  try {
    expect(container.textContent).toBe('“\u202fsource\u202f”“\u202fsource\u202f”');
    disabled.value = true;
    await nextTick();
    expect(container.textContent).toBe('"source""source"');
    const calls = format.mock.calls.length;
    readLocale.mockClear();
    locale.value = 'malformed_locale';
    text.value = '<b>changed\u00ad</b>';
    config.value = { categories: [], locale: 'ru' };
    await nextTick();
    expect(container.textContent).toBe(text.value.repeat(2));
    expect(format).toHaveBeenCalledTimes(calls);
    expect(readLocale).not.toHaveBeenCalled();

    locale.value = 'nl';
    config.value = { categories: ['quotes'], locale: 'nl', unsupportedLocale: 'preserve' };
    await nextTick();
    disabled.value = false;
    await nextTick();
    expect(container.textContent).toBe(text.value.repeat(2));
    expect(format).toHaveBeenCalledTimes(calls + 2);

    locale.value = 'ru';
    text.value = '"current"';
    await nextTick();
    expect(container.textContent).toBe(new Typographist({ categories: ['quotes'] }).format(text.value, 'ru').repeat(2));
    config.value = { categories: [] };
    await nextTick();
    expect(container.textContent).toBe('"current""current"');
  } finally {
    app.unmount();
  }
});

it('hydrates disabled text literally with an unsupported locale', async () => {
  const source = '<b>"Unicode Ω\u00ad"</b>';
  const Root = () =>
    h(
      TypographistProvider,
      {},
      {
        default: () => h(TypographistText, { text: source, locale: 'nl', disabled: true }),
      },
    );
  const format = vi.spyOn(Typographist.prototype, 'format');
  const container = document.createElement('div');
  container.innerHTML = await renderToString(createSSRApp(Root));
  const textNode = Array.from(container.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  const app = createSSRApp(Root);
  app.mount(container);

  try {
    expect(container.textContent).toBe(source);
    expect(Array.from(container.childNodes)).toContain(textNode);
    expect(container.querySelector('b')).toBeNull();
    expect(format).not.toHaveBeenCalled();
  } finally {
    app.unmount();
  }
});

// @vitest-environment jsdom
import { Typographist } from '@elmenov-softworks/typographist';
import type { TypographistConfig } from '@elmenov-softworks/typographist';
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

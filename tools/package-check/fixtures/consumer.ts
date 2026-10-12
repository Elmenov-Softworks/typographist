import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

import { Typographist, TypographistRules } from '@elmenov-softworks/typographist';
import {
  TypographistProvider as ReactProvider,
  TypographistText as ReactText,
  useTypographist as useReactText,
} from '@elmenov-softworks/typographist-react';
import {
  TypographistProvider as VueProvider,
  TypographistText as VueText,
  useTypographist as useVueText,
} from '@elmenov-softworks/typographist-vue';
import {
  TypographistProvider as SolidProvider,
  TypographistText as SolidText,
  useTypographist as useSolidText,
} from '@elmenov-softworks/typographist-solid';
import { transformRulesFile } from '@elmenov-softworks/rules-transformer';
import { createElement } from 'react';
import { renderToString as renderReact } from 'react-dom/server';
import { createSSRApp, h } from 'vue';
import { renderToString as renderVue } from '@vue/server-renderer';
import { createComponent } from 'solid-js';
import { renderToString as renderSolid } from 'solid-js/web';

const formatter = new Typographist<string>({ locale: 'ja', unsupportedLocale: 'preserve' });
assert.equal(formatter.hasLocale('ja'), false);
assert.equal(formatter.format('"こんにちは"...'), '"こんにちは"...');
assert.equal(new Typographist({ categories: ['punctuation'] }).format('wait...'), 'wait…');
assert.ok(new Typographist({ locale: 'ru', categories: ['hyphenation'] }).format('машина').includes('\u00ad'));
formatter.addRules(
  new TypographistRules({
    standard: { locale: 'custom', alphabet: 'abc', leftMin: 1, rightMin: 1, patterns: ['a1b'] },
    fast: {
      locale: 'custom',
      alphabet: 'abc',
      leftMin: 1,
      rightMin: 1,
      vowels: 'ac',
      consonants: 'b',
      specialLetters: '',
    },
  }),
);
assert.equal(formatter.hasLocale('custom'), true);
assert.equal(formatter.format('abc', 'custom'), 'a\u00adbc');
const source = '<b>literal</b> &';
const config = { categories: [] } as const;

const ReactHook = () => useReactText(source, 'fr', true);
const react = renderReact(
  createElement(
    ReactProvider,
    { config },
    createElement(ReactText, { text: source, disabled: true }),
    createElement(ReactHook),
  ),
);
const VueHook = {
  setup: () => {
    const text = useVueText(source, 'fr', true);
    return () => text.value;
  },
};
const vue = await renderVue(
  createSSRApp({
    render: () =>
      h(VueProvider, { config }, { default: () => [h(VueText, { text: source, disabled: true }), h(VueHook)] }),
  }),
);
const solid = renderSolid(() =>
  createComponent(SolidProvider, {
    config,
    get children() {
      return [
        createComponent(SolidText, { text: source, disabled: true }),
        createComponent(
          () =>
            useSolidText(
              () => source,
              () => 'fr',
              () => true,
            )(),
          {},
        ),
      ];
    },
  }),
);

for (const [framework, output] of [
  ['React', react],
  ['Vue', vue],
  ['Solid', solid],
] as const) {
  assert.ok(output.includes('&lt;b'), `${framework} must escape source text`);
  assert.ok(!output.includes('<b>'), `${framework} must not interpret source as markup`);
}

await writeFile('rules.tex', '\\patterns{a1b}');
assert.deepEqual(await transformRulesFile('rules.tex', 'rules.ts'), { patterns: 1, exceptions: 0 });
assert.ok((await readFile('rules.ts', 'utf8')).includes('a1b'));
console.log('Consumer APIs, disabled SSR and transformer passed.');

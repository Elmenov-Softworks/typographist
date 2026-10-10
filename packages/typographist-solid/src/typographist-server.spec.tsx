import { Typographist } from '@elmenov-softworks/typographist';
import { renderToString } from 'solid-js/web';

import { TypographistProvider, TypographistText } from '@/index.js';

it('renders without browser globals and isolates server requests', () => {
  expect(typeof window).toBe('undefined');
  const source = 'машина';
  const render = (locale: 'en' | 'ru') =>
    renderToString(() => (
      <TypographistProvider config={{ locale, categories: ['hyphenation'] }}>
        <TypographistText text={source} />
      </TypographistProvider>
    ));

  for (const locale of ['ru', 'en', 'ru'] as const) {
    expect(render(locale)).toBe(new Typographist({ locale, categories: ['hyphenation'] }).format(source));
  }
});

it.each(['', 'Unicode Ω', 'soft\u00adhyphen', 'https://example.com'])('preserves server text for %j', (source) => {
  const output = renderToString(() => (
    <TypographistProvider>
      <TypographistText text={source} />
    </TypographistProvider>
  ));
  const formatted = new Typographist().format(source);
  expect(output).toBe(formatted);
});

it('escapes markup and entity-like source through server text serialization', () => {
  const output = renderToString(() => (
    <TypographistProvider config={{ categories: [] }}>
      <TypographistText text={'<b>literal</b> &amp; <img src=x onerror="alert(1)">'} />
    </TypographistProvider>
  ));

  expect(output).toBe('&lt;b>literal&lt;/b> &amp;amp; &lt;img src=x onerror="alert(1)">');
});

it('preserves provider and locale errors', () => {
  expect(() => renderToString(() => <TypographistText text="" />)).toThrow('TypographistProvider');
  expect(() => renderToString(() => <TypographistProvider config={{ cacheSize: -1 }} />)).toThrow();
  expect(() =>
    renderToString(() => (
      <TypographistProvider>
        <TypographistText text="" locale="unknown" />
      </TypographistProvider>
    )),
  ).toThrow();
});

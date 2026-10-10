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

it.each(['', 'Unicode Ω', 'soft\u00adhyphen', 'https://example.com', '<b>literal</b>'])(
  'preserves server text for %j',
  (source) => {
    const output = renderToString(() => (
      <TypographistProvider>
        <TypographistText text={source} />
      </TypographistProvider>
    ));
    const formatted = new Typographist().format(source);
    expect(output).toBe(renderToString(() => formatted));
  },
);

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

import { Typographist } from '@elmenov-softworks/typographist';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

import { TypographistProvider, TypographistText } from '@/index.js';

it('renders without browser globals and isolates server roots', async () => {
  const render = (categories: readonly 'quotes'[]) =>
    renderToString(
      createSSRApp(() =>
        h(
          TypographistProvider,
          { config: { categories } },
          {
            default: () => h(TypographistText, { text: '"Hello"' }),
          },
        ),
      ),
    );

  expect(await render([])).toContain('&quot;Hello&quot;');
  expect(await render(['quotes'])).toContain(new Typographist({ categories: ['quotes'] }).format('"Hello"'));
  expect(await render([])).toContain('&quot;Hello&quot;');
});

it.each([false, true])('reports a missing provider with disabled=%s', async (disabled) => {
  const app = createSSRApp(() => h(TypographistText, { text: '', disabled }));
  app.config.warnHandler = () => {};
  await expect(renderToString(app)).rejects.toThrow('requires a TypographistProvider');
});

it('renders disabled source with no locale lookup on the server', async () => {
  const app = createSSRApp(() =>
    h(
      TypographistProvider,
      {},
      {
        default: () =>
          h(TypographistText, { text: '<b>"source"\u00ad</b>', locale: 'malformed_locale', disabled: true }),
      },
    ),
  );

  expect(await renderToString(app)).toContain('&lt;b&gt;&quot;source&quot;\u00ad&lt;/b&gt;');
});

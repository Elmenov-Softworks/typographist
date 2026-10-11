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

it('reports a missing provider', async () => {
  const app = createSSRApp(() => h(TypographistText, { text: '' }));
  app.config.warnHandler = () => {};
  await expect(renderToString(app)).rejects.toThrow('requires a TypographistProvider');
});

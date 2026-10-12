import { Typographist } from '@elmenov-softworks/typographist';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TypographistProvider, TypographistText, useTypographist } from '@/index.js';

describe('React server rendering', () => {
  it.each(['', '  ', '"source"', '<b>soft\u00adhyphen</b>'])(
    'preserves disabled component and hook source for %j',
    (text) => {
      const HookText = () => useTypographist(text, '', true);
      const format = vi.spyOn(Typographist.prototype, 'format');

      try {
        const output = renderToStaticMarkup(
          createElement(
            TypographistProvider,
            null,
            createElement('span', null, createElement(TypographistText, { text, locale: 'unknown', disabled: true })),
            createElement('span', null, createElement(HookText)),
          ),
        );

        expect(output).toBe(
          renderToStaticMarkup(createElement('span', null, text)) +
            renderToStaticMarkup(createElement('span', null, text)),
        );
        expect(format).not.toHaveBeenCalled();
        expect(() => renderToStaticMarkup(createElement(TypographistText, { text, disabled: true }))).toThrow(
          'TypographistProvider',
        );
      } finally {
        format.mockRestore();
      }
    },
  );

  it('renders without browser globals and isolates request configuration', () => {
    expect(typeof window).toBe('undefined');
    const render = (locale: 'en' | 'ru') =>
      renderToStaticMarkup(
        createElement(
          TypographistProvider,
          { config: { locale, categories: ['hyphenation'] } },
          createElement(TypographistText, { text: 'машина' }),
        ),
      );

    expect(render('ru')).toBe(new Typographist({ locale: 'ru', categories: ['hyphenation'] }).format('машина'));
    expect(render('en')).toBe(new Typographist({ locale: 'en', categories: ['hyphenation'] }).format('машина'));
    expect(render('ru')).toBe(new Typographist({ locale: 'ru', categories: ['hyphenation'] }).format('машина'));
  });

  it.each(['', 'Unicode Ω машина', 'soft\u00adhyphen', 'https://example.com/a', '<b>literal</b>'])(
    'preserves core output for %j',
    (text) => {
      const config = { protectedContent: ['literal'] };
      const output = renderToStaticMarkup(
        createElement(
          TypographistProvider,
          { config },
          createElement('span', null, createElement(TypographistText, { text })),
        ),
      );

      expect(output).toBe(renderToStaticMarkup(createElement('span', null, new Typographist(config).format(text))));
    },
  );

  it('preserves core errors for unknown locale overrides', () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(TypographistProvider, null, createElement(TypographistText, { text: '', locale: 'unknown' })),
      ),
    ).toThrow();
  });

  it('reports missing providers and invalid configuration', () => {
    expect(() => renderToStaticMarkup(createElement(TypographistText, { text: '' }))).toThrow('TypographistProvider');
    expect(() => renderToStaticMarkup(createElement(TypographistProvider, { config: { cacheSize: -1 } }))).toThrow();
  });
});

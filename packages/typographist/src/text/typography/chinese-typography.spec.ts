import { Typographist } from '#src/typographist/typographist.js';

describe('Simplified Chinese symbolic rules', () => {
  it.each([false, true])('uses no hyphenation data (useFast=%s)', (useFast) => {
    const service = new Typographist({
      locale: 'zh',
      useFast,
      textLocales: [{ locale: 'zh', textRules: [] }],
      protectedContent: ['"保留" 1-3'],
    });
    const source = '"他说 "你好" 再见" 1-3 (-12) typography 中文，标点。';
    const expected = '“他说 ‘你好’ 再见” 1—3 (−12) typography 中文，标点。';

    expect(service.format(source)).toBe(expected);
    expect(service.format(expected)).toBe(expected);
    expect(service.format(source)).not.toContain('\u00ad');
    expect(service.format('"保留" 1-3 https://example.com/1-3 a-b@example.com')).toBe(
      '"保留" 1-3 https://example.com/1-3 a-b@example.com',
    );
  });

  it('preserves native punctuation, whitespace and ambiguous numeric notation', () => {
    const service = new Typographist({ locale: 'zh', textLocales: [{ locale: 'zh', textRules: [] }] });
    const text = '“中文‘引语’。” 「已有」 中文  字\t词\r\n你好！ 2026-10-08 1.2-3.4 +7-999-123 a1-3 1-3b';

    expect(service.format(text)).toBe(text);
    expect(service.format('中 "词" 文')).toBe('中 “词” 文');
  });

  it('honors disabled categories and rule settings', () => {
    const definition = { locale: 'zh', textRules: [] };
    const disabled = new Typographist({ locale: 'zh', textLocales: [definition], categories: [] });
    const quotes = new Typographist({ locale: 'zh', textLocales: [definition], categories: ['quotes'] });

    expect(disabled.format('"中文" 1-3 -12')).toBe('"中文" 1-3 -12');
    expect(quotes.format('"中文" 1-3 -12')).toBe('“中文” 1-3 -12');
  });
});

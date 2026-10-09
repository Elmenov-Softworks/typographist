import { Typographist } from '@/index.js';

const preservedContent = (text: string) => text.replace(/[\s\u00ad]/gu, '');

const excludedConversions = [
  ['TP-R001', 'inside\ufeffword'],
  ['TP-R002', '№№ 12'],
  ['TP-R003', '(c) (tm) (r)'],
  ['TP-R004', '10 C 20 F'],
  ['TP-R005', 'a->b c<-d'],
  ['TP-R006', '25-ый 3-ая 2-ое'],
  ['TP-R007', '1.25 12.50'],
  ['TP-R008', '10 x 5 10х5'],
  ['TP-R009', 'a!=b a<=b a>=b a~=b a+-b'],
  ['TP-R010', '1/2 1/4 3/4'],
  ['TP-R038', 'как то'],
  ['TP-R039', 'кто то кто либо кто нибудь'],
  ['TP-R041', 'верно таки'],
  ['TP-R042', 'П.-А.'],
  ['TP-R044', 'кое кто кой кто'],
  ['TP-R045', 'скажи ка скажи кась'],
  ['TP-R046', 'из за'],
  ['TP-R047', 'из под'],
  ['TP-R050', 'он де'],
  ['TP-R055', 'слово а слово но слово'],
  ['TP-R062', '12345 1234567890'],
  ['TP-R089', '100 руб. 25 коп.'],
  ['TP-R090', '$100 €100 ¥100 Ұ100 £100 ₤100'],
  ['TP-R091', '2 Мая, Понедельник'],
  ['TP-R092', '2026-10-08'],
  ['TP-R093', '+7-999-123-45-67 8 (999) 123-45-67'],
  ['TP-R094', 'зАмок'],
  ['TP-R095', 'word word слово слово'],
  ['TP-R099', 'мiкс cлово MiXeD'],
] as const;

describe.each(['ru', 'en'] as const)('default content preservation for %s', (locale) => {
  describe.each([false, true])('with useFast=%s', (useFast) => {
    describe.each([0, 64])('with cacheSize=%s', (cacheSize) => {
      const service = new Typographist({ locale, useFast, cacheSize });

      it.each(excludedConversions)('keeps %s conversion inactive for %j', (_id, input) => {
        const output = service.format(input);

        expect(preservedContent(output)).toBe(preservedContent(input));
        expect(preservedContent(service.format(output))).toBe(preservedContent(input));
        expect(service.format(input)).toBe(output);
      });

      it('preserves the composition of combined acceptance inputs', () => {
        const input = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word слово слово мiкс MiXeD 😀 é';

        expect(preservedContent(service.format(input))).toBe(preservedContent(input));
      });

      it('does not generate HTML for links, paragraphs, line breaks or optical alignment', () => {
        const input = 'https://example.com user@example.com\n\nслово, (слово)';
        const output = service.format(input);

        expect(output).not.toMatch(/[<>]/u);
        expect(preservedContent(output)).toBe(preservedContent(input));
      });

      it('does not decode entities, strip tags, escape markup or process unquoted attributes', () => {
        const input = '<p class=example>&quot;text&quot; &amp; text</p><nobr>text text</nobr>';

        expect(preservedContent(service.format(input))).toBe(preservedContent(input));
      });

      it('keeps quotation marks around links without inserting optical markup', () => {
        const output = service.format('"https://example.com"');

        expect(output).toContain('https://example.com');
        expect(output.match(/["«»„“”]/gu)).toHaveLength(2);
        expect(output).not.toMatch(/[<>]/u);
      });
    });
  });
});

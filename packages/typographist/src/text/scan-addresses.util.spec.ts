import { scanAddresses } from './scan-addresses.util.js';

const addresses = (text: string) => scanAddresses(text).map(({ start, end }) => text.slice(start, end));

describe('scanAddresses', () => {
  it('protects schemes and case-insensitive www addresses through trailing punctuation', () => {
    expect(addresses('See HTTPS://example.com/a?q=word, WWW.example.org/path! ftp+data://host/file.')).toEqual([
      'HTTPS://example.com/a?q=word,',
      'WWW.example.org/path!',
      'ftp+data://host/file.',
    ]);
  });

  it('ends URL protection at whitespace, quotes, and angle brackets', () => {
    expect(addresses('https://a/b"word www.a/b\'word <https://a/b>word https://a/b\nword')).toEqual([
      'https://a/b',
      'www.a/b',
      'https://a/b',
      'https://a/b',
    ]);
  });

  it('protects dot-atom local parts and hyphenated hostname labels before tokenization', () => {
    expect(addresses('first.last+tag@example-domain.com, a_b@example.co.uk!')).toEqual([
      'first.last+tag@example-domain.com',
      'a_b@example.co.uk',
    ]);
  });

  it('requires complete dot-atom local parts and valid dotted hostname labels', () => {
    expect(addresses('a..b@example.com .a@example.com a.@example.com a@localhost a@-host.com a@host-.com')).toEqual([]);
    expect(addresses('a@host..com a@host.com- a@host.-com')).toEqual([]);
    expect(addresses('a@host.com.')).toEqual(['a@host.com']);
  });

  it('returns ordered original UTF-16 spans without interpreting markup', () => {
    const text = '😀 <a@host.com> https://host/😀';
    expect(scanAddresses(text)).toEqual([
      { start: 4, end: 14 },
      { start: 16, end: text.length },
    ]);
  });

  it('keeps addresses embedded in a URL in one protected span', () => {
    expect(addresses('https://host/a@domain.com/www.example.com')).toEqual([
      'https://host/a@domain.com/www.example.com',
    ]);
  });

  it('handles long near-matches and retains a following valid address', () => {
    const local = 'a.'.repeat(10000);
    const host = 'a'.repeat(10000);
    const text = `${local} ${host}@${host} ${host}:/word a@host.com`;
    expect(addresses(text)).toEqual(['a@host.com']);
  });

  it('returns no spans for empty input and ordinary text', () => {
    expect(scanAddresses('')).toEqual([]);
    expect(scanAddresses('ordinary words: example.com 123://host')).toEqual([]);
  });
});

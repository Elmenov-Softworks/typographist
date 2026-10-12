# Bundled hyphenation data

The unchanged source files and `provenance.json` pin tex-hyphen revision
`5684c0f51c0b81133db2efbe60a408b4155a3ff5`. The manifest records upstream URLs,
byte lengths, and SHA-256 hashes. These inputs and their notices are shipped in
the npm package alongside the generated JavaScript tables.

Russian data is copyright 1999–2003 Alexander I. Lebedev and licensed under
LPPL 1.2 or later, as stated in `hyph-ru.tex`: <https://latex-project.org/lppl/>.
American English data is copyright 1990, 2004, 2005 Gerard D.C. Kuiken.
Its source permits copying and distribution, with or without modification,
without royalty when the copyright and permission notices are preserved.
Read the full retained notices in the source files. The package's MIT license
does not replace either data license.

Spanish, French, German and Italian tables use the MIT licenses retained in
`hyph-es.tex`, `hyph-fr.tex`, `hyph-de-1996.tex` and `hyph-it.tex` respectively.
Italian offers a choice of licenses; these tables use its MIT option.
Portuguese tables use the BSD 3-Clause license retained in `hyph-pt.tex`,
including its copyright, redistribution conditions and disclaimer. The
unchanged source files contain the complete notices and are included in the
distributed package; generated tables also retain the source comment notices.

The selected pattern baselines are conventional Spanish and French, German
reformed orthography (2006, upstream identifier `de-1996`), Brazilian Portuguese,
and conventional Italian. The Portuguese source is shared with European
Portuguese, rather than being exclusive to Brazil: upstream's
[`hyph-utf8.tex`](https://github.com/hyphenation/tex-hyphen/blob/5684c0f51c0b81133db2efbe60a408b4155a3ff5/hyph-utf8/doc/generic/hyph-utf8/hyph-utf8.tex)
lists `brazilian` and `brazil` as synonyms of `portuguese`. These upstream
synonyms do not introduce aliases or fallback in Typographist.

From the repository root, regenerate with:

```sh
npm run build --workspace=@elmenov-softworks/rules-transformer
node tools/rules-transformer/regenerate-bundled.ts
```

The converter uses the existing development dependency Prettier. It checks the
pinned byte lengths and hashes, decodes UTF-8 strictly, removes TeX comments,
and extracts the single plain pattern and exception blocks in each known file.
It is not a general TeX interpreter. It preserves pattern order and every
pattern, including literal compound characters. Exception hyphens become UTF-16
offsets; entries without hyphens become explicit no-break exceptions.

| Source             | Patterns | Exceptions | No-break exceptions | Default minima |
| ------------------ | -------: | ---------: | ------------------: | -------------- |
| `hyph-ru.tex`      |     7021 |        184 |                  25 | 2/2            |
| `hyph-en-us.tex`   |     4938 |         14 |                   4 | 2/3            |
| `hyph-es.tex`      |     4694 |          0 |                   0 | 2/2            |
| `hyph-fr.tex`      |     1145 |          0 |                   0 | 2/2            |
| `hyph-de-1996.tex` |    36709 |          0 |                   0 | 2/2            |
| `hyph-pt.tex`      |      427 |          2 |                   0 | 2/3            |
| `hyph-it.tex`      |      355 |          0 |                   0 | 2/2            |

The additional five tables are pinned source data; default registration and
locale-owned typography are separate from conversion. Italian's upstream
patterns are ASCII and do not supply accented-letter patterns. Preserving an
accented letter in the alphabet allows surrounding patterns to match, but does
not imply complete accented-word coverage. French internal apostrophe patterns
remain in the source tables; the existing whole-token policy still preserves
words containing internal apostrophes. No pattern set guarantees every word's
linguistic syllabification.

The generated tables are frozen. `Typographist` registers English (`en`) and
Russian (`ru`) rules by default; supplying a custom `rules` list replaces them.
The tables and preparation functions remain internal to the library. Normalization requires `Intl.Segmenter` grapheme support and uses
NFC plus locale-independent lowercasing. Russian retains `ё`; English supports
ASCII letters. Unsupported marks, foreign letters, and internal apostrophes
preserve the whole token.

These tables are source-version spot checks rather than a guarantee of perfect
linguistic coverage. The English source documents the `democrat` limitation.
Splitting visible-hyphen compounds into components is the library's text
policy, not complete TeX paragraph behavior. The retained source exceptions
are part of the language behavior, including deliberate no-break entries.

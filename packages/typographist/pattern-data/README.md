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

From the repository root, regenerate with:

```sh
node tools/pattern-data/convert-patterns.ts
```

The converter uses the existing development dependency Prettier. It checks the
pinned byte lengths and hashes, decodes UTF-8 strictly, removes TeX comments,
and extracts the single plain pattern and exception blocks in each known file.
It is not a general TeX interpreter. It preserves pattern order and every
pattern, including literal compound characters. Exception hyphens become UTF-16
offsets; entries without hyphens become explicit no-break exceptions.

| Source           | Patterns | Exceptions | No-break exceptions | Default minima |
| ---------------- | -------: | ---------: | ------------------: | -------------- |
| `hyph-ru.tex`    |     7021 |        184 |                  25 | 2/2            |
| `hyph-en-us.tex` |     4938 |         14 |                   4 | 2/3            |

The generated tables are frozen. Exported `ru` and `enUS` plugins must be
explicitly supplied to `prepareKnuthLiang`; importing them does not register
languages. Normalization requires `Intl.Segmenter` grapheme support and uses
NFC plus locale-independent lowercasing. Russian retains `ё`; English supports
ASCII letters. Unsupported marks, foreign letters, and internal apostrophes
preserve the whole token.

These tables are source-version spot checks rather than a guarantee of perfect
linguistic coverage. The English source documents the `democrat` limitation.
Splitting visible-hyphen compounds into components is the library's text
policy, not complete TeX paragraph behavior. The retained source exceptions
are part of the language behavior, including deliberate no-break entries.

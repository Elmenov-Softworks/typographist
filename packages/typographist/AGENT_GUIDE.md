# Using Typographist in an application

Use Typographist when a JavaScript or TypeScript application needs locale-aware
quotation marks, dashes, apostrophes, nonbreaking spaces or soft hyphenation for
display text. It preserves the author's text rather than correcting spelling,
extra whitespace or repeated punctuation. It does not format numbers or currencies.

## Choose a package

| Application                   | Package                                 |
| ----------------------------- | --------------------------------------- |
| Node.js or browser JavaScript | `@elmenov-softworks/typographist`       |
| React                         | `@elmenov-softworks/typographist-react` |
| Vue Composition API           | `@elmenov-softworks/typographist-vue`   |
| Solid                         | `@elmenov-softworks/typographist-solid` |
| Convert TeX hyphenation data  | `@elmenov-softworks/rules-transformer`  |

Install only the package needed by the application. Framework integrations
depend on the core; their framework peer dependency must also be installed.
The standalone core is ESM and has no runtime dependencies.

## Format plain text

```sh
npm install @elmenov-softworks/typographist
```

```ts
import { Typographist } from '@elmenov-softworks/typographist';

const formatter = new Typographist({
  locale: 'en',
  unsupportedLocale: 'preserve',
});

const source = 'The "reader" said...';
const formatted = formatter.format(source);
```

Reuse the formatter across calls. In a browser, assign output to `textContent`
or render it as framework text. Never use formatting as HTML sanitization.

Defaults enable quotation, dash, punctuation, nonbreaking-spacing and hyphenation
rules. An explicit `categories` array replaces that selection; `[]` disables it.
For symbols without soft hyphens:

```ts
const symbols = new Typographist({
  locale: 'en',
  categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing'],
});
```

`useFast` defaults to `false`, selecting pattern-based Knuth–Liang hyphenation.
Set it to `true` only when heuristic Khristov breaks are acceptable. The bounded
word cache defaults to an estimated 64 MiB per instance, shared across locales;
`cacheSize: 0` disables it. This is not an exact process-memory limit.

## Select a locale

Built-in IDs are `en`, `ru`, `es`, `fr`, `de`, `pt`, `it` and `zh`.
`en` uses US English, `pt` uses a Brazilian baseline, and `zh` uses Simplified
Chinese conventions. Chinese performs symbolic formatting without soft hyphens.
See [locale baselines and limits](locale-rules/README.md).

There is no language detection or regional fallback. Map application locale IDs
such as `en-US`, `pt-BR` or `zh-CN` explicitly to the intended supported profile.
Do not map every regional variant to a base profile without considering its conventions.
The default unsupported-locale policy throws. Use `unsupportedLocale: 'preserve'`
for multilingual display that must retain unsupported languages unchanged.
`formatter.hasLocale(locale)` checks actual registrations.

Supplying `rules` replaces the bundled hyphenation registrations. Built-in Chinese
is registered implicitly only when both `rules` and `textLocales` are omitted.
When supplying registration lists, include `{ locale: 'zh', textRules: [] }` in
`textLocales` if Chinese formatting is needed. Ordinary application integration
does not require custom registration lists.

## Use a framework integration

Put one `TypographistProvider` around the relevant application subtree and pass
its `config`. Inside it, use `<TypographistText text={source} />` for a leaf text
node or `useTypographist` for a formatted value. The component adds no wrapper
and does not traverse child components. Wrap it in a `span` or other element
when the application needs an element.

- React: the hook accepts a string and returns a string.
- Vue: call inside descendant setup; pass a ref/getter for changing text and read
  the returned computed ref. Prefer a `shallowRef` for provider configuration.
- Solid: pass text and locale as accessors; call the returned accessor to read it.

The component's `disabled` prop or the hook's third argument preserves source
text and skips formatting. Vue accepts a ref/getter, Solid an accessor, and
React a boolean. Disabled consumers still require a provider.
Replace configuration immutably. Equivalent configurations retain the prepared
formatter and cache; changed configurations prepare a replacement. Custom
rule objects and callbacks are compared by identity, so do not mutate them in place.
Nested providers own complete independent configurations.

Use the same source, locale and configuration for SSR and hydration. Create
providers per server request; do not share a mutable formatter across requests.

## Keep source text separate

Output contains real soft hyphens (`U+00AD`), nonbreaking spaces (`U+00A0`) and
narrow nonbreaking spaces (`U+202F`). Keep original text for editing, form values,
search indexing and storage. Clipboard behavior depends on the destination.
Disable hyphenation where soft hyphens are unsuitable.

Recognized URLs and emails are protected. `protectedContent` protects nonempty
literal substrings from all formatting; `excludedWords` excludes exact,
case-sensitive words from hyphenation only. Input is plain text, not an HTML document.

See the [core guide](README.md), [complete examples](EXAMPLES.md), and the
[React](https://elmenov-softworks.github.io/typographist/packages/typographist-react/README.md),
[Vue](https://elmenov-softworks.github.io/typographist/packages/typographist-vue/README.md),
[Solid](https://elmenov-softworks.github.io/typographist/packages/typographist-solid/README.md) or
[converter](https://elmenov-softworks.github.io/typographist/packages/rules-transformer/README.md)
guide for the chosen integration.

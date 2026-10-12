# Typographist for React

```tsx
import { TypographistProvider, TypographistText, useTypographist } from '@elmenov-softworks/typographist-react';

function Label({ text }: { text: string }) {
  const formatted = useTypographist(text, 'en');
  return <span>{formatted}</span>;
}

function App() {
  return (
    <TypographistProvider config={{ locale: 'en', categories: ['quotes', 'hyphenation'], cacheSize: 64 }}>
      <TypographistText text={'"Hello world"'} />
      <Label text="Another string" />
    </TypographistProvider>
  );
}
```

`TypographistProvider<TCustomLocale extends string = never>` accepts optional
`config: TypographistConfig<TCustomLocale>` from the core package and optional
`children: ReactNode`. Omitted settings use core defaults.

`TypographistText` accepts required `text: string`, optional `locale: string`, and
optional `disabled: boolean` (default `false`). It renders text without a wrapper.
`useTypographist(text: string, locale?: string, disabled?: boolean)`
returns a string. Both require a provider and use the nearest one. A locale
override affects only that consumer. Custom locale names and definitions can be
passed through the provider's core configuration type.

Disabled consumers return the current source exactly and skip formatting and
locale lookup. They still require a provider. Toggling disabled off formats the
current source with the current configuration.

```tsx
<TypographistText text={source} locale="fr" disabled />;
const original = useTypographist(source, 'fr', true);
```

For unsupported site languages, use `config={{ locale: 'fr', unsupportedLocale: 'preserve' }}`
on the provider. Unknown locales then preserve source text; the default policy
`'throw'` raises a `RangeError`. Known locales still format normally. The core
formatter's `hasLocale(locale)` reports whether rules are registered.

Each provider owns one prepared formatter and its bounded word cache. Nested
providers use complete independent configuration; they do not merge with their
parent. Separate application roots and server requests share no formatter state.
The integration supports native React server rendering and hydration without
browser globals. Use equal configuration and source text on server and client.
Output is text, including soft hyphens and nonbreaking characters; HTML-like
source is never interpreted as markup.

Replace configuration immutably to update it. Scalar values, primitive array
contents, and primitive rule settings are compared by value. Fresh equivalent
objects and arrays preserve the formatter and cache. Custom rules, locale
definitions, callbacks, and handler-bearing objects are compared by identity.
Replace those objects to request an update; mutations inside them are not tracked.
Omitted and explicit core defaults are equivalent where the core contract allows.
A meaningful change prepares a replacement formatter and resets its word cache.
Preparation errors propagate before the replacement is published.

Consumers memoize their current source, effective locale, and formatter derivation.
Unrelated parent updates do not repeat formatting for an unchanged committed
consumer derivation or schedule an extra render to derive text. A source change
updates its consumer; a provider configuration change may update every consumer.
Recomputation always uses the original source string. React may still execute
consumer functions because of application updates or development Strict Mode.

See the [core documentation](../typographist/README.md) for formatting categories,
configuration defaults and text-processing limits.

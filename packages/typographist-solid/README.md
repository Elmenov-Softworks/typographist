# Typographist for Solid

For package selection and display-text integration, see the
[agent guide](../typographist/AGENT_GUIDE.md).

Each provider shares one prepared core formatter and its bounded word cache
among its consumers. Nested providers and separate application roots own isolated
instances. Nested configuration is complete and does not merge with an outer
provider.

```tsx
import { createSignal } from 'solid-js';
import type { TypographistConfig } from '@elmenov-softworks/typographist';
import { TypographistProvider, TypographistText, useTypographist } from '@elmenov-softworks/typographist-solid';

const Text = () => {
  const [source, setSource] = createSignal('"Hello"');
  const formatted = useTypographist(source);
  return <span>{formatted()}</span>;
};

const App = () => {
  const [config, setConfig] = createSignal<TypographistConfig>({
    locale: 'en',
    categories: ['quotes', 'nonbreakingSpacing'],
    cacheSize: 64,
  });

  return (
    <TypographistProvider config={config()}>
      <Text />
      <TypographistText text='"Hello"' locale="ru" />
    </TypographistProvider>
  );
};
```

The provider accepts optional `config: TypographistConfig<string>` and Solid
`children`. The core configuration preserves custom locale definitions and names.
Omitted fields use core defaults. The component accepts required `text: string`
and optional `locale: string`, rendering a text node without a wrapper. HTML-like
strings remain literal text.

Call the hook inside a descendant component or its reactive owner:

```ts
useTypographist(
  text: Accessor<string>,
  locale?: Accessor<string | undefined>,
  disabled?: Accessor<boolean>,
): Accessor<string>
```

The result is a read-only accessor. Pass signals or getters, including
`() => props.text` and `() => props.locale`, to preserve reactivity.
Use `() => 'fixed source'` for a constant. Keep the original source string for
recomputation. Locale overrides affect only that consumer. A missing provider,
unsupported locale under the default policy or invalid configuration throws. Empty strings, Unicode,
soft hyphens and protected content retain core behavior.

Replace configuration immutably. Scalars, primitive array contents and declared
primitive rule settings compare by value. Fresh equivalent configuration and
array containers preserve the formatter. Custom plugins, locale definitions and
callbacks compare by identity; replace their identity to request an update. Changes inside mutable plugin objects are not
tracked. Supported explicit defaults compare equally to omitted defaults.

A meaningful configuration change prepares a replacement before publishing it
and resets that provider's cache. Failed preparation leaves the previous valid
service available if Solid retains or restores the consumer tree. Ordinary parent
updates preserve prepared state and cache. Each consumer memoizes its current
derivation synchronously. Unchanged inputs do not repeat formatting or schedule
extra library updates; changing one consumer's text does not invalidate another.

Use native Solid server rendering and hydration, compiling server JSX with
Solid's SSR transform. Imports and server rendering need no browser globals.
Equal source and configuration produce equal initial text. No formatter is
shared globally across roots or server requests.

See the [core documentation](../typographist/README.md) for formatting categories,
configuration defaults and text-processing limits.

Set `disabled` on a leaf component or pass a boolean accessor as the hook's third
argument to return the current source and skip formatting and locale lookup.
It defaults to false and still requires a provider.

```tsx
const [disabled, setDisabled] = createSignal(false);
const formatted = useTypographist(source, () => 'en', disabled);
<TypographistText text={source()} locale="unknown" disabled={disabled()} />;
```

Use `config={{ locale: 'unknown', unsupportedLocale: 'preserve' }}` when the site's
active language has no registered rules. Unsupported languages retain their
source text; registered languages still format normally. The default policy is
`'throw'`. Core `hasLocale(locale)` reports registered rules without a regional
fallback; see the [core API](../typographist/README.md).

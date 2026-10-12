# Usage examples

Install the core, or a framework integration and its framework peer dependency.
The integrations install the core as a dependency.

## Plain text

```ts
import { Typographist } from '@elmenov-softworks/typographist';

const formatter = new Typographist({ locale: 'ru' });
const source = 'Он сказал: "Привет"...';
const formatted = formatter.format(source);

// In a browser:
document.querySelector('span')?.append(document.createTextNode(formatted));
```

Reuse the instance. Assign output as text, not `innerHTML`. Input is plain text;
HTML-looking input is displayed literally and is not parsed or sanitized.
Always retain the original source for editing and configuration changes.

For symbolic typography without soft hyphens:

```ts
const symbols = new Typographist({
  locale: 'ru',
  categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing'],
  settings: { 'common/punctuation/quote': { spacing: false } },
});
const formatted = symbols.format('Он сказал: "Привет"...');
```

## A site with partially supported languages

```ts
import { Typographist } from '@elmenov-softworks/typographist';

const formatter = new Typographist<string>({
  locale: 'fr',
  unsupportedLocale: 'preserve',
});

formatter.format('"Bonjour"...'); // Exactly the original text.
formatter.format('"Hello"...', 'en'); // Uses registered English rules.
formatter.hasLocale('fr'); // false
formatter.hasLocale('ru'); // true
```

Locales are explicit identifiers. `en-US` does not fall back to `en`, and an
HTML `lang` attribute does not select formatter rules. Map your site's locale
identifiers explicitly if needed. The default unsupported-locale policy is
`throw`; `preserve` does not suppress malformed inputs or errors in custom rules.

## React

```tsx
import { useState } from 'react';
import { TypographistProvider, useTypographist } from '@elmenov-softworks/typographist-react';

function Label() {
  const [disabled, setDisabled] = useState(false);
  const text = useTypographist('The "reader" said...', 'en', disabled);

  return (
    <>
      <button onClick={() => setDisabled((value) => !value)}>Toggle formatting</button>
      <span>{text}</span>
    </>
  );
}

export function App() {
  return (
    <TypographistProvider config={{ unsupportedLocale: 'preserve' }}>
      <Label />
    </TypographistProvider>
  );
}
```

For a leaf component, use `<TypographistText text={source} disabled={disabled} />`
inside the provider. It adds no HTML wrapper; put it inside a `span` when needed.
Hooks must be called unconditionally. A disabled consumer still needs a provider.

## Vue

This component must be rendered inside a `TypographistProvider`.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useTypographist } from '@elmenov-softworks/typographist-vue';

const disabled = ref(false);
const source = ref('The "reader" said...');
const text = useTypographist(source, 'en', disabled);
</script>

<template>
  <button @click="disabled = !disabled">Toggle formatting</button>
  <span>{{ text }}</span>
</template>
```

The parent can wrap it with
`<TypographistProvider :config="{ unsupportedLocale: 'preserve' }">`.
`TypographistText` also accepts `:disabled="disabled"`.

## Solid

```tsx
import { createSignal } from 'solid-js';
import { TypographistProvider, useTypographist } from '@elmenov-softworks/typographist-solid';

function Label() {
  const [disabled, setDisabled] = createSignal(false);
  const text = useTypographist(
    () => 'The "reader" said...',
    () => 'en',
    disabled,
  );

  return (
    <>
      <button onClick={() => setDisabled((value) => !value)}>Toggle formatting</button>
      <span>{text()}</span>
    </>
  );
}

export function App() {
  return (
    <TypographistProvider config={{ unsupportedLocale: 'preserve' }}>
      <Label />
    </TypographistProvider>
  );
}
```

Pass reactive values through accessors. `TypographistText` accepts
`disabled={disabled()}` inside a provider.

## Server rendering

Use the same source, locale, configuration and disabled state on server and client.
Create providers per request; do not share a mutable formatter between requests.
For example, the React `App` above can be rendered with its native server API:

```tsx
import { renderToString } from 'react-dom/server';
import { App } from './app.js';

const html = renderToString(<App />);
```

Use the framework's native hydration API with the same `App`. Vue uses
`createSSRApp` and `@vue/server-renderer`; Solid uses `solid-js/web` server exports.
Their integration guides describe the corresponding provider and hook contracts.

## Copying and editing

Soft hyphens (`U+00AD`), nonbreaking spaces (`U+00A0`) and narrow nonbreaking spaces
(`U+202F`) are real characters in the result. Clipboard and search behavior depend
on the browser and destination application. Keep original text for search indexing,
form values and editing; format the display separately. Disable `hyphenation` when
soft hyphens are unsuitable for the destination.

Registered built-in profiles are tested for stable repeated formatting. Custom
rules must establish their own stability; a rule that appends text on every call
cannot be idempotent. Stability does not mean formatted text can restore the source.

See the core guide for exclusions, protected content, custom locales and cache limits.

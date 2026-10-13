# Typographist for Vue

For package selection and display-text integration, see the
[agent guide](../typographist/AGENT_GUIDE.md).

Components use Vue SFCs with `<script setup lang="ts">` and type-based props.

Use the nearest provider to share a prepared core formatter and its bounded word
cache. Each provider owns its own instance, including nested providers and
separate server requests. Nested configuration is complete; it does not merge
with an outer provider.

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import type { TypographistConfig } from '@elmenov-softworks/typographist';
import { TypographistProvider, TypographistText } from '@elmenov-softworks/typographist-vue';

const config = shallowRef<TypographistConfig>({
  locale: 'en',
  categories: ['quotes', 'nonbreakingSpacing'],
  cacheSize: 64,
});
const source = ref('"Hello"');
</script>

<template>
  <TypographistProvider :config="config">
    <TypographistText :text="source" />
    <TypographistText :text="source" locale="ru" />
  </TypographistProvider>
</template>
```

`TypographistProvider` accepts optional `config: TypographistConfig<string>` and
a default slot. The public core configuration accepts custom locale definitions
and their locale names. Omitted configuration uses core defaults.
`TypographistText` accepts required `text: string` and optional `locale: string` and `disabled: boolean` (default `false`).
It renders text without a wrapper and never interprets HTML-like strings.

Inside a descendant's `setup`, the hook has this signature:

```ts
useTypographist(
  text: MaybeRefOrGetter<string>,
  locale?: MaybeRefOrGetter<string | undefined>,
  disabled?: MaybeRefOrGetter<boolean>,
): ComputedRef<string>
```

The returned computed ref is read-only. Pass a ref or getter for changing inputs;
a plain string is a fixed input. Keep the original source text:

```ts
const formatted = useTypographist(
  () => props.text,
  () => props.locale,
);
// Read formatted.value in script, or formatted in a template.
```

A missing provider throws. Locale overrides apply only to that consumer. Unknown
locales throw by default. Set provider configuration `unsupportedLocale: 'preserve'`
to keep text unchanged for unregistered explicit or default locales.
The core `hasLocale(locale)` method reports whether rules are registered.
Invalid configuration and malformed locales retain core errors. Soft hyphens, Unicode,
protected content and empty strings retain core behavior.

Replace configuration immutably. Use `shallowRef` for configuration to preserve
plugin identity and class instances rather than deeply proxying them. Scalars,
primitive array contents and primitive rule settings compare by value. New equivalent array containers do not require
stable identity. Custom plugins, locale definitions and callbacks compare by
identity; replace their identity to request an update.
Mutating plugin internals is not tracked. Supported explicit defaults compare
equally to omitted defaults.

A meaningful configuration change prepares a replacement instance before
publishing it and resets that provider's word cache. Failed preparation does not
replace the previous valid instance. Ordinary parent updates retain the instance
and cache. Each consumer memoizes its current derivation synchronously; unchanged
inputs do not repeat formatting. A text change does not invalidate other
consumers. Vue can still execute application renders for unrelated reasons.

Native Vue server rendering and hydration need no browser globals during import
or server rendering. Use equal source text and configuration on server and client
for equal initial text. No mutable service is shared between roots.

See the [core documentation](../typographist/README.md) for formatting categories,
configuration defaults and text-processing limits.

Set `disabled` to render the current source unchanged and skip locale lookup.
The provider is still required. Refs and getters support enable/disable transitions:

```vue
<TypographistText :text="source" :disabled="disabled" />
```

```ts
const disabled = ref(false);
const formatted = useTypographist(source, () => props.locale, disabled);
const config = shallowRef({ locale: 'ja', unsupportedLocale: 'preserve' as const });
```

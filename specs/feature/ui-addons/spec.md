# UI integrations with shared configuration

Status: Approved by the owner.

## Goal and current behavior

Provide framework integrations for displaying text formatted by Typographist.
The owner requires application-level configuration through a global provider
and no unnecessary rerenders.

The React, Vue and Solid workspace packages currently contain empty public entry
points. Each already depends on the core and declares its framework as a peer
dependency. The core formats a string synchronously, prepares configuration at
construction, and maintains a bounded in-memory word cache per instance.
Its public API has no general configuration update method.

## Scope and exclusions

Implement React, Vue and Solid integrations using the existing packages and
public core API. React uses functional components; Vue uses the Composition API.
Solid uses its native component and fine-grained reactivity model, with context,
signals and memoized derivations where needed. Keep consumer contracts consistent
across frameworks without imposing React render semantics on Vue or Solid.
Preserve the core's formatting behavior, locale contracts, algorithms and cache limits.

Do not add typography rules, text cleanup, DOM scanning, automatic translation,
HTML processing, persistence, background workers or release automation.
Do not promise that a framework can prevent every render caused by application
code. The requirement concerns redundant work and updates caused by this library.

## Confirmed requirements

The owner selected all three frameworks, a provider/component/hook API and
dynamic provider configuration.

- Configure typography through an application-level provider. Separate
  application roots must not share mutable configuration or caches implicitly.
- Reuse prepared formatting state and its cache across ordinary parent updates.
  Do not construct a formatter for each component, word or formatting call.
- Do not schedule an additional effect-driven render just to derive a
  synchronously available formatted string.
- When text, effective locale and formatting configuration remain unchanged,
  unrelated parent updates must not cause redundant formatting or library-driven
  consumer updates. DOM text must remain unchanged.
- When an effective input changes, the visible string must match the public
  core formatter under the effective configuration. Unrelated consumers must
  not receive invalidation from a text change in another consumer.
- Forward selected categories, algorithm, cache budget and other supported
  core configuration without inventing competing defaults.
- Preserve exact source input for recomputation. Never feed previously formatted
  output back into the formatter as a substitute for the source string.
- Render formatted output as text, preserving the core's soft hyphens and
  nonbreaking characters without interpreting the string as HTML.
- Keep configuration errors observable rather than silently dropping settings
  or falling back to another locale or algorithm.

## Public API and update contract

The owner approved the following public API and update contract.

All three packages export `TypographistProvider`, `TypographistText` and
`useTypographist`. The provider accepts `config`, using the public core
configuration type and defaults. The component accepts a required `text` string
and an optional `locale`. It renders a text node without a mandatory wrapper,
DOM traversal, arbitrary child processing or element customization.

The hook accepts text and an optional locale and returns derived formatted text:
a string in React, a read-only computed ref in Vue, and a read-only accessor in
Solid. Vue and Solid accept reactive sources through their native ref/getter
and accessor conventions; reading current values once must not lose reactivity.
Document exact public signatures and usage for each framework.

Consumers use the nearest provider. A missing provider is an error. Nested
providers own isolated instances and use their own complete configuration,
with core defaults for omitted fields; configuration does not merge with an
outer provider. Locale overrides affect only the calling consumer.

Configuration updates are immutable. Compare scalar values, primitive array
contents and declared primitive rule settings by value; compare custom rule
plugins, locale definitions and handler-bearing objects by identity. A fresh
outer config object containing equivalent supported values must not invalidate
consumers. Changes inside mutable plugin objects are not tracked: consumers
replace their identity to request an update. Do not stringify or recursively
compare arbitrary plugin internals. Treat omitted core defaults and equivalent
explicit defaults consistently where the public core contract permits it.

On a meaningful configuration change, prepare a replacement core instance and
publish it to consumers only after successful preparation. Reuse that instance
until another meaningful change. This resets its word cache; ordinary parent
updates preserve the instance and cache. A provider-wide effective change can
invalidate all consumers of that provider; updates to a consumer's text cannot.
Do not add field-level subscriptions or a second shared full-text cache merely
to avoid this legitimate invalidation. Memoize the current consumer derivation.

Use synchronous derivation rather than a render/effect/state-update chain.
React functional components use stable context values and appropriate
memoization; Vue uses Composition API derivations; Solid uses fine-grained
reactivity. Do not guarantee that arbitrary consumer components never execute
because their parents render, or that development Strict Mode executes once.
Guarantee no additional library-scheduled render and no repeated formatting for
an unchanged committed consumer derivation under ordinary parent updates.

Support server rendering and hydration using the framework's native facilities.
Imports and rendering must not require browser globals. Equal source text and
configuration produce equal server and initial client text. Provider state must
not leak between application roots or server requests. No new SSR framework or
server application is part of this task.

## Acceptance criteria

- A provider serves multiple consumers using shared prepared state. Updating
  unrelated parent state does not reconstruct that state or clear its cache.
- Repeated parent updates with unchanged effective input do not call formatting
  again for unchanged consumers. Measure formatter invocations and visible DOM
  updates separately from framework render-function invocations.
- A source-text change updates only the corresponding output. A locale override
  produces the same string as the core for that locale.
- Changing an effective category,
  algorithm or locale updates affected output; equivalent scalar configuration
  does not trigger redundant updates. Document identity requirements for arrays,
  plugins and custom callbacks.
- Changes under one provider do not modify
  another provider's configuration or cache ownership.
- Import and render work without a DOM, with
  deterministic initial output and no cross-request global state.
- Empty strings, Unicode, soft hyphens, protected content and unknown locales
  retain core behavior. Text resembling HTML is rendered literally.
- Public types preserve the core's custom-locale typing where supported.
- README examples show provider setup, string rendering, category selection,
  cache ownership and the configuration update contract for each selected package.
- An invalid replacement configuration throws without publishing a partially
  prepared service. The previous valid configuration remains available if the
  framework keeps or restores the consumer tree after the error.
- Fresh equivalent configuration containers do not cause reconstruction; replacing
  a custom plugin identity does. Existing configuration inputs are never mutated.

## Verification

Future implementation checks, from the repository root:

```sh
npm run build
npm run typecheck
npm run lint
npm run format:check
npm test
```

Use a small set of behavior tests for provider ownership, output updates and
redundant-work regressions. A test should demonstrate an observable requirement,
not reproduce private implementation details. Exercise real framework update
mechanisms for the selected integrations; core string tests alone cannot verify
rerender behavior. Account for development-only repeated render execution when
assessing production update guarantees. Do not introduce timing thresholds.

Research for this draft inspected manifests, empty integration entry points and
the public core configuration/lifecycle. No integration implementation or new
benchmark was run or changed.

## Constraints and decisions

Use each selected framework's existing version and native context/reactivity
facilities. Access the core through its public package entry point. Additional
dependencies need a concrete reason and must follow repository rules. Keep the
API and abstractions proportional to this feature.

This document belongs to the current `feature/ui-addons` branch. Implementation
and orchestrator execution are outside this specification task.

## Approval

The owner approved this complete version, including the public API, configuration
comparison contract, nested-provider behavior and SSR support. No blocking
questions remain.

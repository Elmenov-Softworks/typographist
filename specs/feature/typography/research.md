# Sources and research

## Repository baseline

Branch `feature/typography`, commit `bb71204`. The current public service implements hyphenation, locale registration, algorithm selection, and a shared LRU word cache. React, Vue, and Solid adapter entry points do not currently provide typography implementations; expanding those packages is outside this task.

## Typograf baseline

- Project: https://github.com/typograf/typograf
- Pinned package: `typograf@7.8.0`, downloaded with lifecycle scripts disabled.
- Archive SHA-256: `f5ea4be792c64b502d7bea2d709afb7a2c0f00630193a77012284078703f45ab`.
- Package source: https://registry.npmjs.org/typograf/-/typograf-7.8.0.tgz
- Full build: `dist/typograf.all.js`.
- Catalogue: 107 public rules, six internal handlers, 29 locale datasets.
- Initial text-only survey: 94 text rules and 13 HTML or optical-alignment exclusions.
- Revised owner scope: symbolic formatting only. See the inventory for included, adapted and excluded rules; the initial 94-rule scope no longer applies.

The upstream development manifest advertised 7.9.0 during research, but npm did not provide that version. The specification uses the downloaded 7.8.0 package rather than mixing development behavior with the released baseline.

The upstream API also provides static registration, HTML processing, entity modes, rule masks, execution callbacks, and input coercion. These are reference capabilities, not approved requirements for this text-rule task. Existing string-only input and synchronous execution remain the service contract.

Upstream rules are not all enabled by default. Date conversion from ISO is enabled; duplicate-word deletion, accent conversion, and several other transformations are opt-in. The inventory records actual metadata, but the owner excluded content-changing conversions entirely. Bundled coverage is Russian and English only.

The 29 locale datasets do not provide 29 distinct full rule collections: the public catalogue has 52 common, 53 Russian, and two English-variant rules. New universal contracts must separate linguistic data and optional hyphenation capabilities.

## GitHub Spec Kit

- Project: https://github.com/github/spec-kit
- Pinned revision: `1e933c49fd6d5d5390b28f18faefa5728c95b2e3`.
- Specification source: https://github.com/github/spec-kit/blob/1e933c49fd6d5d5390b28f18faefa5728c95b2e3/templates/spec-template.md
- Source specification SHA-256: `3945437fc35cd30a5b2bf7beea680337c3516826d3efa5a6b92c4a7eca1ba28e`.

Reviewed specification, plan, task, and checklist templates. The local template adapts prioritized user scenarios, acceptance cases, functional requirements, key entities, and measurable success criteria. It adds current behavior, reference traceability, verification, and the task-specification approval gate. Existing repository instructions remain the engineering authority. No Spec Kit installation or competing `.specify` configuration is introduced.

## Research limits

Rule metadata and handlers were inspected; no new implementation or runtime acceptance suite exists yet. Numerical speed targets have not been approved. Performance claims must come from future equivalent-work benchmarks, including configuration, algorithm, cache state, setup cost, and input characteristics.

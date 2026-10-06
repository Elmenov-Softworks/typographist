# Prettier

Use prettier.config.ts and a separate .prettierignore.

Set:

- singleQuote: true
- semi: true
- tabWidth: 2
- useTabs: false
- trailingComma: 'all'
- arrowParens: 'always'
- printWidth: 120
- endOfLine: 'lf'

Leave other settings at defaults. Add plugins only for a concrete requirement and with dependency approval.

Select runtime and Prettier versions that support loading TypeScript configuration.

Ignore generated and vendored output. Let Prettier own mechanical formatting; retain meaningful blank lines.

## Detailed engineering guidance

## Formatting

Let the project's formatter own mechanical formatting.

Do not manually fight the existing formatter. New projects use Prettier according to the agreed configuration.

Do not introduce formatting changes unrelated to the task.

Use the existing lint and formatting configuration as the source of truth for syntax-level style.

These rules should focus on engineering decisions, not duplicate automated formatter rules.

Formatter output is not the only readability requirement.

If the formatter permits logically unrelated statements or member groups to remain adjacent, preserve meaningful blank lines between them.

Do not intentionally remove semantic whitespace simply because a formatter does not require it.

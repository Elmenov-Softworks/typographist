import type { locales } from '#src/rules/locale.constants.js';

/** Bundled locale identifiers; zh supports typography only. Declare custom locales through Typographist's generic type. */
export type Locale = (typeof locales)[number];

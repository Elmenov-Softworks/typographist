import type { locales } from '#src/rules/locale.constants.js';

/** Bundled locale identifiers: 'en', 'ru' and typography-only 'zh'. Declare custom locales through Typographist's generic type. */
export type Locale = (typeof locales)[number];

import type { locales } from '@/rules/locale.constants.js';

/** Bundled locale identifiers: 'en' and 'ru'. Declare custom locales through Typographist's generic type. */
export type Locale = (typeof locales)[number];

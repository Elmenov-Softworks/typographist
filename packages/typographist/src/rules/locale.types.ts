import type { locales } from '@/rules/locale.constants.js';

/** Locales supported by the bundled rules. */
export type Locale = (typeof locales)[number];

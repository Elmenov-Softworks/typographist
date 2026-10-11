import { createContext } from 'react';

import type { prepareProvider } from '@elmenov-softworks/typographist/internal/provider';

export const FormatterContext = createContext<ReturnType<typeof prepareProvider<string>> | null>(null);

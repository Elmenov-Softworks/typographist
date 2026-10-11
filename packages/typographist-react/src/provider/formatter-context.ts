import { createContext } from 'react';

import type { prepareProvider } from '@/provider/prepare-provider.factory.js';

export const FormatterContext = createContext<ReturnType<typeof prepareProvider<string>> | null>(null);

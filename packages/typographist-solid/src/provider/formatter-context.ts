import { createContext } from 'solid-js';
import type { Accessor } from 'solid-js';

import type { prepareProvider } from '@/provider/prepare-provider.factory.js';

export const FormatterContext = createContext<Accessor<ReturnType<typeof prepareProvider<string>>>>();

import { createContext } from 'solid-js';
import type { Accessor } from 'solid-js';

import type { prepareProvider } from '@elmenov-softworks/typographist/internal/provider';

export const FormatterContext = createContext<Accessor<ReturnType<typeof prepareProvider<string>>>>();

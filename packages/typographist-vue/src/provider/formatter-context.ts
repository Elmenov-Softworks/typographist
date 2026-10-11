import type { InjectionKey } from 'vue';

import type { prepareProvider } from '@/provider/prepare-provider.factory.js';

export const formatterKey: InjectionKey<Readonly<{ value: ReturnType<typeof prepareProvider<string>> }>> =
  Symbol('Typographist');

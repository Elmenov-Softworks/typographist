import type { InjectionKey } from 'vue';

import type { prepareProvider } from '@elmenov-softworks/typographist/internal/provider';

export const formatterKey: InjectionKey<Readonly<{ value: ReturnType<typeof prepareProvider<string>> }>> =
  Symbol('Typographist');

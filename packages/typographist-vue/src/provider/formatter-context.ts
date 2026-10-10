import type { Typographist } from '@elmenov-softworks/typographist';
import type { InjectionKey } from 'vue';

export const formatterKey: InjectionKey<Readonly<{ value: Typographist<string> }>> = Symbol('Typographist');

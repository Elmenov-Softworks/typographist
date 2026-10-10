import type { Typographist } from '@elmenov-softworks/typographist';
import { createContext } from 'solid-js';
import type { Accessor } from 'solid-js';

export const FormatterContext = createContext<Accessor<Typographist<string>>>();

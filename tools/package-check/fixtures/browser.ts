import { Typographist } from '@elmenov-softworks/typographist';
import * as react from '@elmenov-softworks/typographist-react';
import * as vue from '@elmenov-softworks/typographist-vue';
import * as solid from '@elmenov-softworks/typographist-solid';

export const formatted = new Typographist({ locale: 'ru' }).format('Он сказал: "Привет"...');
export const integrations = { react, vue, solid };

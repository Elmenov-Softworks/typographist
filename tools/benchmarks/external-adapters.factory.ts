import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { ExternalImplementation } from './benchmark.types.ts';

const loadDefault = async (path: string) => {
  const module: unknown = await import(pathToFileURL(path).href);

  if (typeof module !== 'object' || module === null || !('default' in module)) {
    throw new TypeError(`Missing default export: ${path}`);
  }

  return module.default;
};

const requireFunction = (value: unknown) => {
  if (typeof value !== 'function') {
    throw new TypeError('Expected an external library function');
  }

  return value;
};

const formatter = (value: unknown, owner: unknown = null, options: readonly unknown[] = []) => {
  const format = requireFunction(value);

  return (text: string) => {
    const output: unknown = Reflect.apply(format, owner, [text, ...options]);

    if (typeof output !== 'string') {
      throw new TypeError('External formatter must return a string synchronously');
    }

    return output;
  };
};

const version = async (directory: string) => {
  const manifest: unknown = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'));

  if (
    typeof manifest !== 'object' ||
    manifest === null ||
    !('version' in manifest) ||
    typeof manifest.version !== 'string'
  ) {
    throw new TypeError('External package manifest must contain a version');
  }

  return manifest.version;
};

export const loadExternalImplementations = async (modules: string) => {
  const hyphenRoot = resolve(modules, 'hyphen');
  const hypherRoot = resolve(modules, 'hypher');
  const wasmRoot = resolve(modules, 'hyphenopoly');
  const [hyphen, hyphenEnglish, hyphenRussian, Hypher, hypherEnglish, hypherRussian, enWasm, ruWasm] =
    await Promise.all([
      loadDefault(resolve(hyphenRoot, 'hyphen.js')),
      loadDefault(resolve(hyphenRoot, 'patterns/en-us.js')),
      loadDefault(resolve(hyphenRoot, 'patterns/ru.js')),
      loadDefault(resolve(hypherRoot, 'lib/hypher.js')),
      loadDefault(resolve(modules, 'hyphenation.en-us/lib/en-us.js')),
      loadDefault(resolve(modules, 'hyphenation.ru/lib/ru.js')),
      readFile(resolve(wasmRoot, 'patterns/en-us.wasm')),
      readFile(resolve(wasmRoot, 'patterns/ru.wasm')),
    ]);
  const createHyphen = requireFunction(hyphen);
  const createHypher = requireFunction(Hypher);
  const versions = await Promise.all([version(hyphenRoot), version(hypherRoot), version(wasmRoot)]);
  const [hyphenVersion, hypherVersion, wasmVersion] = versions;

  let wasmInstance = 0;
  const implementations: readonly ExternalImplementation[] = [
    {
      id: 'hyphen',
      version: hyphenVersion,
      algorithm: 'knuth-liang',
      notes:
        'Native synchronous whole-text API; en-us and ru patterns; minWordLength 5/4; built-in word cache retained after warm-up. Pattern loading excluded; preparation creates two new formatters.',
      prepare: () => () => {
        const english = formatter(
          Reflect.apply(createHyphen, null, [hyphenEnglish, { async: false, minWordLength: 5 }]),
        );
        const russian = formatter(
          Reflect.apply(createHyphen, null, [hyphenRussian, { async: false, minWordLength: 4 }]),
        );

        return (text, locale) => (locale === 'en' ? english(text) : russian(text));
      },
    },
    {
      id: 'hypher',
      version: hypherVersion,
      algorithm: 'knuth-liang',
      notes:
        'Native hyphenateText API; hyphenation.en-us and hyphenation.ru datasets; native left/right minima; minLength argument 4/3 (API uses a strict greater-than check). No persistent word cache. Native slash handling may insert zero-width spaces.',
      prepare: () => () => {
        const create = (patterns: unknown, minLength: number) => {
          const instance: unknown = Reflect.construct(createHypher, [patterns]);

          if (typeof instance !== 'object' || instance === null || !('hyphenateText' in instance)) {
            throw new TypeError('Hypher instance must expose hyphenateText');
          }

          return formatter(instance.hyphenateText, instance, [minLength]);
        };
        const english = create(hypherEnglish, 4);
        const russian = create(hypherRussian, 3);

        return (text, locale) => (locale === 'en' ? english(text) : russian(text));
      },
    },
    {
      id: 'hyphenopoly',
      version: wasmVersion,
      algorithm: 'knuth-liang-wasm',
      notes:
        'Native synchronous WASM whole-text API; en-us and ru; minWordLength 4; native pattern minima; normalize false; built-in word cache retained after warm-up. Words longer than 61 characters are unsupported. Preparation uses fresh module state and includes WASM compilation/instantiation; module and pattern-byte loading excluded.',
      prepare: async () => {
        wasmInstance += 1;
        const module: unknown = await import(
          `${pathToFileURL(resolve(wasmRoot, 'hyphenopoly.module.js')).href}?instance=${String(wasmInstance)}`
        );

        if (typeof module !== 'object' || module === null || !('default' in module)) {
          throw new TypeError('Missing Hyphenopoly default export');
        }

        const engine: unknown = module.default;

        if (typeof engine !== 'object' || engine === null || !('config' in engine)) {
          throw new TypeError('Hyphenopoly must expose config');
        }

        const configure = requireFunction(engine.config);

        return () => {
          const services: unknown = Reflect.apply(configure, engine, [
            {
              require: ['en-us', 'ru'],
              sync: true,
              minWordLength: 4,
              loaderSync: (file: string) => {
                if (file === 'en-us.wasm') return enWasm;
                if (file === 'ru.wasm') return ruWasm;
                throw new Error(`Unexpected WASM request: ${file}`);
              },
              handleEvent: {
                error: (event: { msg: string; preventDefault: () => void }) => {
                  event.preventDefault();
                  throw new Error(event.msg);
                },
              },
            },
          ]);

          if (!(services instanceof Map)) {
            throw new TypeError('Hyphenopoly config must return language formatters');
          }

          const english = formatter(services.get('en-us'));
          const russian = formatter(services.get('ru'));

          return (text, locale) => (locale === 'en' ? english(text) : russian(text));
        };
      },
    },
  ];

  return implementations;
};

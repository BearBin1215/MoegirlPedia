declare const moment: typeof import('moment');

/** 在页面右下方插入按钮 */
declare function insertToBottomRightCorner(text: string): JQuery<HTMLDivElement>;

declare function wgUXS(
  wg: string,
  hans: string,
  hant?: string,
  cn?: string,
  tw?: string,
  hk?: string,
  sg?: string,
  zh?: string,
  mo?: string,
  my?: string,
): string;

declare const wgULS: typeof wgUXS extends (wg: string, ...rest: infer Rest) => infer ReturnType ? (...args: Rest) => ReturnType : never;

declare const wgUVS: typeof wgULS;

declare namespace libCachedCode {
  export function getCachedCode(url: string): Promise<string>;

  export function getCachedCodeUrl(url: string): Promise<string>;

  export function injectCachedCode(url: string, _type: string): Promise<void>;

  export function batchInjectCachedCode(urls: string[], type: string): Promise<void>[];
}

interface Transformation {
  type: string;

  match: (arg: any) => boolean;

  encode: (value: any) => string;

  decode: (value: string) => any;
}

declare class LocalObjectStorage {
  static plugins: {
    transformations: {
      get list(): Transformation[];

      add: (transformation: Transformation) => boolean;
    }
  };

  #keyPrefix: string;

  constructor(prefix?: string);

  get _keyPrefix(): string;

  #getAllKeys(): string[];

  getAllKeys(): string[];

  get length(): number;

  getItem<T = any>(key: string): T | string | null;

  getItem<T = any>(key: string, fallback: T): T;

  setItem<T = any>(key: string, value: T): void;

  removeItem(key: string): void;

  clear(): void;

  key(index: number): string | undefined;
}

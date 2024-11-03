import type { StateTree } from 'pinia';

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type KeyFn = (id: string) => string;

export interface KeyValueStorage {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
}

export type SerializeFn<T extends StateTree> = (
  state: T | DeepPartial<T>,
) => string;
export type DeserializeFn<T extends StateTree> = (
  state: string,
) => T | DeepPartial<T>;

export interface PersistentStateOptions<T extends StateTree> {
  key?: KeyFn;
  storage?: KeyValueStorage;
  serialize?: SerializeFn<T>;
  deserialize?: DeserializeFn<T>;
}

export interface GlobalPersistentStateOptions<T extends StateTree>
  extends PersistentStateOptions<T> {
  auto?: boolean;
}

export interface LocalPersistentStateOptions<T extends StateTree>
  extends PersistentStateOptions<T> {
  pickPaths?: string[];
  omitPaths?: string[];
}

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persistentState?:
      | boolean
      | LocalPersistentStateOptions<S>
      | LocalPersistentStateOptions<S>[];
  }
}

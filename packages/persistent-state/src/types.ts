export interface KeyValueStorage {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string | null;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface GlobalPersistentStateOptions<T> {
  key?: (id: string) => string;
  storage?: KeyValueStorage;
  sanitize?: (state: DeepPartial<T>) => DeepPartial<T>;
  serialize?: (state: DeepPartial<T>) => string;
  deserialize?: (state: string) => DeepPartial<T>;
}

export interface PersistentStateOptions<T>
  extends GlobalPersistentStateOptions<T> {
  pickPaths?: string[];
  omitPaths?: string[];
}

export type PersistentStateOption<T> =
  | boolean
  | PersistentStateOptions<T>
  | PersistentStateOptions<T>[];

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persistentState?: PersistentStateOption<S>;
  }
}

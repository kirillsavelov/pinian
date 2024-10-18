export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface GlobalPersistentStateOptions<T> {
  storage?: Storage;
  serialize?: (data: DeepPartial<T>) => string;
  deserialize?: (data: string) => DeepPartial<T>;
}

export interface PersistentStateOptions<T>
  extends GlobalPersistentStateOptions<T> {
  key?: string;
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

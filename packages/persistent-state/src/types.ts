export interface GlobalPersistentStateOptions<T> {
  storage?: Storage;
  serialize?: (data: T) => string;
  deserialize?: (data: string) => T;
}

export interface PersistentStateOptions<T>
  extends GlobalPersistentStateOptions<T> {
  key?: string;
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

import type { StateTree } from 'pinia';

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type ChannelFn = (id: string) => string;

export type MergeStrategyType = 'overwrite' | 'shallow' | 'deep';
export type MergeStrategyFn<T extends StateTree> = <
  S extends T | DeepPartial<T>,
>(
  oldState: S,
  newState: S,
) => S;
export type MergeStrategy<T extends StateTree> =
  | MergeStrategyType
  | MergeStrategyFn<T>;

export interface SharedStateOptions<T extends StateTree> {
  channel?: ChannelFn;
  instant?: boolean;
  mergeStrategy?: MergeStrategy<T>;
}

export interface GlobalSharedStateOptions<T extends StateTree>
  extends SharedStateOptions<T> {
  auto?: boolean;
}

export interface LocalSharedStateOptions<T extends StateTree>
  extends SharedStateOptions<T> {
  pickPaths?: string[];
  omitPaths?: string[];
}

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    sharedState?: boolean | LocalSharedStateOptions<S>;
  }
}

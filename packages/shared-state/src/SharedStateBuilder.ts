import type { Store as PiniaStore, StateTree } from 'pinia';
import { SharedState } from 'src/SharedState';
import { type Channel, TabChannel } from 'src/channel';
import { type Filter, PathFilter } from 'src/filter';
import {
  DeepMerger,
  type Merger,
  OverwriteMerger,
  ShallowMerger,
} from 'src/merger';
import { PiniaAdapter, type Store } from 'src/store';
import type {
  ChannelFn,
  LocalSharedStateOptions,
  MergeStrategy,
  MergeStrategyType,
} from 'src/types';

export class SharedStateBuilder<T extends StateTree> {
  private static readonly DEFAULT_OPTIONS = {
    channel: (id: string): string => id,
    instant: true,
    mergeStrategy: 'overwrite' as MergeStrategyType,
    pickPaths: [] as string[],
    omitPaths: [] as string[],
  };

  private store?: Store<T>;
  private channel?: Channel<T>;
  private filter?: Filter<T>;
  private merger?: Merger<T>;

  public setStore(store: Store<T>): SharedStateBuilder<T> {
    this.store = store;

    return this;
  }

  public setChannel(
    storeId: string,
    channelFn: ChannelFn = SharedStateBuilder.DEFAULT_OPTIONS.channel,
    instant: boolean = SharedStateBuilder.DEFAULT_OPTIONS.instant,
  ): SharedStateBuilder<T> {
    this.channel = new TabChannel(channelFn(storeId), instant);

    return this;
  }

  public setMerger(
    strategy: MergeStrategy<T> = SharedStateBuilder.DEFAULT_OPTIONS
      .mergeStrategy,
  ): SharedStateBuilder<T> {
    if (typeof strategy === 'function') {
      this.merger = { merge: strategy };

      return this;
    }

    switch (strategy) {
      case 'overwrite':
        this.merger = new OverwriteMerger();
        break;
      case 'shallow':
        this.merger = new ShallowMerger();
        break;
      case 'deep':
        this.merger = new DeepMerger();
        break;
      default:
    }

    return this;
  }

  public setFilter(
    pickPaths: string[] = SharedStateBuilder.DEFAULT_OPTIONS.pickPaths,
    omitPaths: string[] = SharedStateBuilder.DEFAULT_OPTIONS.omitPaths,
  ): SharedStateBuilder<T> {
    this.filter = new PathFilter(pickPaths, omitPaths);

    return this;
  }

  public build(): SharedState<T> {
    if (!this.store || !this.channel || !this.merger || !this.filter) {
      throw new Error('SharedState is not configured properly');
    }

    return new SharedState(this.store, this.channel, this.merger, this.filter);
  }

  public static fromOptions<T extends StateTree>(
    store: PiniaStore,
    options: LocalSharedStateOptions<T>,
  ): SharedState<T> {
    return new SharedStateBuilder()
      .setStore(new PiniaAdapter(store))
      .setChannel(store.$id, options.channel, options.instant)
      .setMerger(options.mergeStrategy)
      .setFilter(options.pickPaths, options.omitPaths)
      .build();
  }
}

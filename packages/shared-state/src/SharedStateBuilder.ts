import type { Store as PiniaStore, StateTree } from 'pinia';
import { type Store, PiniaAdapter } from 'src/store';
import { type Channel, TabChannel } from 'src/channel';
import { type Filter, PathFilter } from 'src/filter';
import {
  type Merger,
  DeepMerger,
  OverwriteMerger,
  ShallowMerger,
} from 'src/merger';
import { SharedState } from 'src/SharedState';
import type {
  ChannelFn,
  MergeStrategy,
  LocalSharedStateOptions,
} from 'src/types';

export class SharedStateBuilder<T extends StateTree> {
  private store?: Store<T>;
  private channel?: Channel<T>;
  private filter?: Filter<T>;
  private merger?: Merger<T>;

  public setStore(store: PiniaStore<string, T>): SharedStateBuilder<T> {
    this.store = new PiniaAdapter(store);

    return this;
  }

  public setChannel(
    storeId: string,
    channelFn?: ChannelFn,
    instant?: boolean,
  ): SharedStateBuilder<T> {
    const name: string = channelFn ? channelFn(storeId) : storeId;
    this.channel = new TabChannel(name, instant);

    return this;
  }

  public setFilter(
    pickPaths?: string[],
    omitPaths?: string[],
  ): SharedStateBuilder<T> {
    this.filter = new PathFilter(pickPaths, omitPaths);

    return this;
  }

  public setMerger(strategy?: MergeStrategy<T>): SharedStateBuilder<T> {
    if (typeof strategy === 'function') {
      this.merger = { merge: strategy };

      return this;
    }

    switch (strategy) {
      case 'shallow':
        this.merger = new ShallowMerger();
        break;
      case 'deep':
        this.merger = new DeepMerger();
        break;
      default:
        this.merger = new OverwriteMerger();
    }

    return this;
  }

  public build(): SharedState<T> {
    if (!this.store || !this.channel || !this.filter || !this.merger) {
      throw new Error('SharedState is not configured properly');
    }

    return new SharedState(this.store, this.channel, this.filter, this.merger);
  }

  public static fromOptions<T extends StateTree>(
    store: PiniaStore,
    options: LocalSharedStateOptions<T>,
  ): SharedState<T> {
    return new SharedStateBuilder()
      .setStore(store)
      .setChannel(store.$id, options.channel, options.instant)
      .setFilter(options.pickPaths, options.omitPaths)
      .setMerger(options.mergeStrategy)
      .build();
  }
}

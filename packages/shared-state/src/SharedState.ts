import type { StateTree } from 'pinia';
import type { Channel, Message } from 'src/channel';
import type { Filter } from 'src/filter';
import type { Merger } from 'src/merger';
import type { Store } from 'src/store';
import type { DeepPartial } from 'src/types';

export class SharedState<T extends StateTree> {
  private unsubscribe: (() => void) | null = null;
  private isConnected = false;
  private isRemoteUpdate = false;
  private lastUpdateTime = 0;

  constructor(
    private readonly store: Store<T>,
    private readonly channel: Channel<T>,
    private readonly merger: Merger<T>,
    private readonly filter: Filter<T>,
  ) {}

  public connect(): void {
    if (this.isConnected) {
      return;
    }

    this.isConnected = true;
    this.channel.connect();
    this.subscribe();
  }

  public disconnect(): void {
    if (!this.isConnected) {
      return;
    }

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.channel.disconnect();
    this.isConnected = false;
  }

  private subscribe(): void {
    this.channel.subscribe((message: Message<T> | null): void => {
      if (!message) {
        this.broadcastCurrentState();
        return;
      }

      if (message.time <= this.lastUpdateTime) {
        return;
      }

      this.handleRemoteUpdate(message);
    });

    this.unsubscribe = this.store.subscribe(() => {
      if (!this.isRemoteUpdate) {
        this.broadcastCurrentState();
      }

      this.isRemoteUpdate = false;
    });
  }

  private broadcastCurrentState(): void {
    const currentState: T | DeepPartial<T> = this.filter.filter(
      this.store.getState(),
    );

    this.channel.broadcast(currentState);
  }

  private handleRemoteUpdate(message: Message<T>): void {
    this.isRemoteUpdate = true;
    this.lastUpdateTime = message.time;
    const currentState: T | DeepPartial<T> = this.filter.filter(
      this.store.getState(),
    );
    const mergedState: T | DeepPartial<T> = this.merger.merge(
      currentState,
      message.state,
    );

    this.store.patchState(mergedState);
  }
}

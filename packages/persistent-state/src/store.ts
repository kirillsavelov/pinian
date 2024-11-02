import type { Store as PiniaStore, StateTree } from 'pinia';
import type { DeepPartial } from 'src/types';

export interface Store<T> {
  getState(): T;
  patchState(partialState: T | DeepPartial<T>): void;
  subscribe(callback: () => void): () => void;
}

export class PiniaAdapter<T extends StateTree> implements Store<T> {
  constructor(private readonly store: PiniaStore) {}

  public getState(): T {
    return this.store.$state as T;
  }

  public patchState(partialState: DeepPartial<T>): void {
    this.store.$patch(partialState);
  }

  public subscribe(callback: () => void): () => void {
    return this.store.$subscribe(() => callback());
  }
}

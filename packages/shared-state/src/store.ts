import type { Store as PiniaStore, StateTree } from 'pinia';
import type { DeepPartial } from 'src/types';

export interface Store<T extends StateTree> {
  state: T;
  patch<S extends T | DeepPartial<T>>(state: S): void;
  subscribe(handler: () => void): () => void;
}

export class PiniaAdapter<T extends StateTree> implements Store<T> {
  constructor(private readonly store: PiniaStore<string, T>) {}

  public get state(): T {
    return this.toRaw(this.store.$state as T);
  }

  public patch<S extends T | DeepPartial<T>>(state: S): void {
    this.store.$patch(state);
  }

  public subscribe(handler: () => void): () => void {
    return this.store.$subscribe(() => handler());
  }

  private toRaw(state: T): T {
    return JSON.parse(JSON.stringify(state));
  }
}

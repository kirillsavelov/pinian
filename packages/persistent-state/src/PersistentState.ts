import type { StateTree } from 'pinia';
import type { PersistentStateOptions } from 'src/types';

export class PersistentState<T extends StateTree> {
  private readonly key: string;
  private readonly storage: Storage;
  private readonly serialize: (state: T) => string;
  private readonly deserialize: (data: string) => T;

  constructor(options: PersistentStateOptions<T>) {
    this.key = options.key || 'default-key';
    this.storage = options.storage || localStorage;
    this.serialize = options.serialize || JSON.stringify;
    this.deserialize = options.deserialize || JSON.parse;
  }

  public save(state: T): void {
    const serializedState: string = this.serialize(state);

    this.storage.setItem(this.key, serializedState);
  }

  public load(): T | null {
    const serializedState: string | null = this.storage.getItem(this.key);

    return serializedState ? this.deserialize(serializedState) : null;
  }
}

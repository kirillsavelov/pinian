import type { StateTree, Store } from 'pinia';
import { PersistentState } from 'src/PersistentState';
import type { PersistentStateOptions } from 'src/types';

export class PersistentStateManager<T extends StateTree> {
  private readonly store: Store<string, T>;
  private readonly persistentState: PersistentState<T>;

  constructor(store: Store<string, T>, options: PersistentStateOptions<T>) {
    this.store = store;
    this.persistentState = new PersistentState({
      ...options,
      key: options.key || store.$id,
    });
  }

  public initialize(): void {
    this.hydrate();
    this.subscribeToChanges();
  }

  private hydrate(): void {
    const savedState: T | null = this.persistentState.load();

    if (savedState) {
      this.store.$patch(savedState);
    }
  }

  private subscribeToChanges(): void {
    this.store.$subscribe((): void => {
      this.persistentState.save(this.store.$state as T);
    });
  }
}

import type { StateTree, Store } from 'pinia';
import { PersistentState } from 'src/core/PersistentState';
import type { DeepPartial, PersistentStateOptions } from 'src/types';

export class PersistentStateManager<T extends StateTree> {
  private readonly persistentState: PersistentState<T>;

  constructor(
    private readonly store: Store<string, T>,
    options: PersistentStateOptions<T>,
  ) {
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
    const savedState: DeepPartial<T> | null = this.persistentState.load();

    if (savedState) {
      this.store.$patch(savedState);
    }
  }

  private subscribeToChanges(): void {
    this.store.$subscribe((): void => {
      this.persistentState.save(this.store.$state as DeepPartial<T>);
    });
  }
}

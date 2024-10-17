import type { StateTree, Store } from 'pinia';
import { PersistentStateManager } from 'src/PersistentStateManager';
import type {
  GlobalPersistentStateOptions,
  PersistentStateOption,
  PersistentStateOptions,
} from 'src/types';

export class PersistentStateManagerFactory<T extends StateTree> {
  constructor(
    private readonly store: Store<string, T>,
    private readonly globalOptions: GlobalPersistentStateOptions<T>,
  ) {}

  create(
    persistentStateOption?: PersistentStateOption<T>,
  ): PersistentStateManager<T>[] {
    if (persistentStateOption === true) {
      return [
        new PersistentStateManager(this.store, {
          ...this.globalOptions,
        }),
      ];
    }

    if (Array.isArray(persistentStateOption)) {
      return persistentStateOption.map(
        (options: PersistentStateOptions<T>): PersistentStateManager<T> =>
          new PersistentStateManager(this.store, {
            ...this.globalOptions,
            ...options,
          }),
      );
    }

    if (typeof persistentStateOption === 'object') {
      return [
        new PersistentStateManager(this.store, {
          ...this.globalOptions,
          ...persistentStateOption,
        }),
      ];
    }

    return [];
  }
}

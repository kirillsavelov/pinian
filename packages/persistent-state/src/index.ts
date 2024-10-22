import type { PiniaPlugin, PiniaPluginContext, StateTree } from 'pinia';
import { PersistentStateManager } from 'src/core/PersistentStateManager';
import type {
  GlobalPersistentStateOptions,
  PersistentStateOptions,
} from 'src/types';

export * from 'src/types';

export function createPersistentState<T extends StateTree>(
  globalOptions: GlobalPersistentStateOptions<T> = {},
): PiniaPlugin {
  return ({ store, options }: PiniaPluginContext): void => {
    let managers: PersistentStateManager<T>[] = [];

    if (Array.isArray(options?.persistentState)) {
      managers = options?.persistentState.map(
        (options: PersistentStateOptions<T>): PersistentStateManager<T> =>
          new PersistentStateManager(store, {
            ...globalOptions,
            ...options,
          }),
      );
    } else if (typeof options?.persistentState === 'object') {
      managers = [
        new PersistentStateManager(store, {
          ...globalOptions,
          ...options?.persistentState,
        }),
      ];
    } else if (options?.persistentState === true) {
      managers = [new PersistentStateManager(store, globalOptions)];
    }

    for (const manager of managers) {
      manager.initialize();
    }
  };
}

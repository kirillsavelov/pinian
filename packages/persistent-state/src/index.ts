import type { PiniaPlugin, PiniaPluginContext, StateTree } from 'pinia';
import type { PersistentStateManager } from 'src/PersistentStateManager';
import { PersistentStateManagerFactory } from 'src/PersistentStateManagerFactory';
import type { GlobalPersistentStateOptions } from 'src/types';

export type { GlobalPersistentStateOptions };

export function createPersistentState<T extends StateTree>(
  globalOptions: GlobalPersistentStateOptions<T>,
): PiniaPlugin {
  return (context: PiniaPluginContext): void => {
    const managerFactory: PersistentStateManagerFactory<T> =
      new PersistentStateManagerFactory(context.store, globalOptions);
    const managers: PersistentStateManager<T>[] = managerFactory.create(
      context.options?.persistentState,
    );

    for (const manager of managers) {
      manager.initialize();
    }
  };
}

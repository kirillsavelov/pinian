import type { PiniaPlugin, PiniaPluginContext, StateTree } from 'pinia';
import type { PersistentState } from 'src/PersistentState';
import { PersistentStateBuilder } from 'src/PersistentStateBuilder';
import type {
  GlobalPersistentStateOptions,
  LocalPersistentStateOptions,
} from 'src/types';

export * from 'src/types';

export function createPersistentState<T extends StateTree>(
  globalOptions: GlobalPersistentStateOptions<T> = {},
): PiniaPlugin {
  const { auto, ...commonOptions }: GlobalPersistentStateOptions<T> =
    globalOptions;

  return ({ store, options }: PiniaPluginContext): void => {
    if (!options.persistentState && auto !== true) {
      return;
    }

    let persistentStates: PersistentState<T>[] = [];

    if (Array.isArray(options.persistentState)) {
      persistentStates = options.persistentState.map(
        (localOptions: LocalPersistentStateOptions<T>): PersistentState<T> =>
          PersistentStateBuilder.fromOptions(store, {
            ...commonOptions,
            ...localOptions,
          }),
      );
    } else if (typeof options.persistentState === 'object') {
      persistentStates = [
        PersistentStateBuilder.fromOptions(store, {
          ...commonOptions,
          ...options.persistentState,
        }),
      ];
    } else {
      persistentStates = [
        PersistentStateBuilder.fromOptions(store, commonOptions),
      ];
    }

    for (const persistentState of persistentStates) {
      persistentState.persist();
    }

    const $dispose: () => void = store.$dispose;
    store.$dispose = (): void => {
      for (const persistentState of persistentStates) {
        persistentState.unpersist();
      }

      $dispose();
    };
  };
}

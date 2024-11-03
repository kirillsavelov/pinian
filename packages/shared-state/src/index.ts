import type { PiniaPlugin, PiniaPluginContext, StateTree } from 'pinia';
import type { SharedState } from 'src/SharedState';
import { SharedStateBuilder } from 'src/SharedStateBuilder';
import type {
  GlobalSharedStateOptions,
  LocalSharedStateOptions,
} from 'src/types';

export * from 'src/types';

export function createSharedState<T extends StateTree>(
  globalOptions: GlobalSharedStateOptions<T> = {},
): PiniaPlugin {
  const { auto, ...commonOptions }: GlobalSharedStateOptions<T> = globalOptions;

  return ({ store, options }: PiniaPluginContext): void => {
    if (!options.sharedState && auto !== true) {
      return;
    }

    let sharedState: SharedState<T>;

    if (typeof options.sharedState === 'object') {
      sharedState = SharedStateBuilder.fromOptions(store, {
        ...commonOptions,
        ...options.sharedState,
      });
    } else {
      sharedState = SharedStateBuilder.fromOptions(store, commonOptions);
    }

    sharedState.connect();

    const $dispose: () => void = store.$dispose;
    store.$dispose = (): void => {
      sharedState.disconnect();
      $dispose();
    };
  };
}

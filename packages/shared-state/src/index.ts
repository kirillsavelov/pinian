import type { PiniaPlugin, PiniaPluginContext, StateTree } from 'pinia';
import type { SharedState } from 'src/SharedState';
import { SharedStateBuilder } from 'src/SharedStateBuilder';
import { GlobalSharedStateOptions, LocalSharedStateOptions } from 'src/types';

export * from 'src/types';

export function createSharedState<T extends StateTree>(
  globalOptions: GlobalSharedStateOptions<T> = {},
): PiniaPlugin {
  const { auto, ...commonOptions }: GlobalSharedStateOptions<T> = globalOptions;

  return ({ store, options }: PiniaPluginContext): void => {
    if (
      typeof options.sharedState !== 'object' &&
      options.sharedState !== true &&
      auto !== true
    ) {
      return;
    }

    const localOptions: LocalSharedStateOptions<T> = {
      ...commonOptions,
      ...(typeof options.sharedState === 'object' ? options.sharedState : {}),
    };
    const sharedState: SharedState<T> = SharedStateBuilder.fromOptions(
      store,
      localOptions,
    );

    sharedState.connect();

    const $dispose: () => void = store.$dispose;
    store.$dispose = (): void => {
      sharedState.disconnect();
      $dispose();
    };
  };
}

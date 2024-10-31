import type {
  PiniaPlugin,
  PiniaPluginContext,
  Store as PiniaStore,
  StateTree,
} from 'pinia';
import type { SharedState } from 'src/SharedState';
import { SharedStateBuilder } from 'src/SharedStateBuilder';
import { createSharedState } from 'src/index';
import type {
  ChannelFn,
  GlobalSharedStateOptions,
  LocalSharedStateOptions,
  MergeStrategy,
} from 'src/types';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/SharedStateBuilder');

describe('createSharedState', () => {
  describe('plugin()', () => {
    const storeId: string = 'test-store';
    let store: PiniaStore;
    let context: PiniaPluginContext;
    let sharedState: SharedState<StateTree>;
    let originalDispose: Mock;

    beforeEach(() => {
      vi.clearAllMocks();

      originalDispose = vi.fn();
      store = {
        $id: storeId,
        $state: {},
        $patch: vi.fn(),
        $dispose: originalDispose,
        $subscribe: vi.fn((callback) => vi.fn()),
      } as unknown as PiniaStore;
      context = {
        store,
        options: {},
        app: null,
        pinia: null,
      } as unknown as PiniaPluginContext;
      sharedState = {
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as SharedState<StateTree>;

      vi.mocked(SharedStateBuilder.fromOptions).mockReturnValue(sharedState);
    });

    describe('with global options', () => {
      describe('with auto enabled', () => {
        it('should create SharedState for all stores', () => {
          const globalOptions: GlobalSharedStateOptions<StateTree> = {
            auto: true,
          };

          const plugin: PiniaPlugin = createSharedState(globalOptions);
          plugin(context);

          expect(SharedStateBuilder.fromOptions).toHaveBeenCalledWith(
            store,
            expect.objectContaining({}),
          );
          expect(sharedState.connect).toHaveBeenCalled();
        });
      });

      describe('with channel function', () => {
        it('should pass channel function to builder', () => {
          const channelFn: ChannelFn = (id: string) => `custom-${id}`;
          const globalOptions: GlobalSharedStateOptions<StateTree> = {
            channel: channelFn,
          };
          const plugin: PiniaPlugin = createSharedState(globalOptions);
          context.options.sharedState = true;
          plugin(context);
          expect(SharedStateBuilder.fromOptions).toHaveBeenCalledWith(
            store,
            expect.objectContaining({ channel: channelFn }),
          );
        });
      });

      describe('with instant flag', () => {
        it('should pass instant flag to builder', () => {
          const globalOptions: GlobalSharedStateOptions<StateTree> = {
            instant: true,
          };
          const plugin: PiniaPlugin = createSharedState(globalOptions);
          context.options.sharedState = true;
          plugin(context);
          expect(SharedStateBuilder.fromOptions).toHaveBeenCalledWith(
            store,
            expect.objectContaining({ instant: true }),
          );
        });
      });

      describe('with merge strategy', () => {
        it('should pass merge strategy to builder', () => {
          const mergeStrategy: MergeStrategy<StateTree> = 'deep';
          const globalOptions: GlobalSharedStateOptions<StateTree> = {
            mergeStrategy,
          };
          const plugin: PiniaPlugin = createSharedState(globalOptions);
          context.options.sharedState = true;
          plugin(context);
          expect(SharedStateBuilder.fromOptions).toHaveBeenCalledWith(
            store,
            expect.objectContaining({ mergeStrategy }),
          );
        });
      });
    });

    describe('with local options', () => {
      describe('with pick paths', () => {
        it('should pass pick paths to builder', () => {
          const localOptions: LocalSharedStateOptions<StateTree> = {
            pickPaths: ['foo', 'bar'],
          };
          context.options.sharedState = localOptions;
          const plugin: PiniaPlugin = createSharedState();
          plugin(context);
          expect(SharedStateBuilder.fromOptions).toHaveBeenCalledWith(
            store,
            expect.objectContaining({ pickPaths: ['foo', 'bar'] }),
          );
        });
      });

      describe('with omit paths', () => {
        it('should pass omit paths to builder', () => {
          const localOptions: LocalSharedStateOptions<StateTree> = {
            omitPaths: ['baz', 'qux'],
          };
          context.options.sharedState = localOptions;
          const plugin: PiniaPlugin = createSharedState();
          plugin(context);
          expect(SharedStateBuilder.fromOptions).toHaveBeenCalledWith(
            store,
            expect.objectContaining({ omitPaths: ['baz', 'qux'] }),
          );
        });
      });

      describe('with combined options', () => {
        it('should override global options with local options', () => {
          const channelFn: ChannelFn = (id: string) => `global-${id}`;
          const localChannelFn: ChannelFn = (id: string) => `local-${id}`;
          const globalOptions: GlobalSharedStateOptions<StateTree> = {
            channel: channelFn,
            mergeStrategy: 'deep',
            instant: false,
          };
          const localOptions: LocalSharedStateOptions<StateTree> = {
            channel: localChannelFn,
            instant: true,
            pickPaths: ['foo'],
          };
          context.options.sharedState = localOptions;
          const plugin: PiniaPlugin = createSharedState(globalOptions);
          plugin(context);
          expect(SharedStateBuilder.fromOptions).toHaveBeenCalledWith(
            store,
            expect.objectContaining({
              channel: localChannelFn,
              mergeStrategy: 'deep',
              instant: true,
              pickPaths: ['foo'],
            }),
          );
        });
      });
    });

    describe('with no options', () => {
      it('should not create SharedState', () => {
        const plugin: PiniaPlugin = createSharedState();
        plugin(context);
        expect(SharedStateBuilder.fromOptions).not.toHaveBeenCalled();
      });
    });

    describe('when store disposing', () => {
      it('should disconnect shared state before calling original dispose', () => {
        const disconnectOrder: number[] = [];
        const disconnectSpy = vi.fn(() => {
          disconnectOrder.push(1);
        });
        const originalDisposeSpy = vi.fn(() => {
          disconnectOrder.push(2);
        });
        sharedState.disconnect = disconnectSpy;
        store.$dispose = originalDisposeSpy;
        const plugin: PiniaPlugin = createSharedState();
        context.options.sharedState = true;
        plugin(context);
        context.store.$dispose();
        expect(disconnectSpy).toHaveBeenCalled();
        expect(originalDisposeSpy).toHaveBeenCalled();
        expect(disconnectOrder).toEqual([1, 2]);
      });
    });
  });
});

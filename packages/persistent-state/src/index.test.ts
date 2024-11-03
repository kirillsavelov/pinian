import type {
  PiniaPlugin,
  PiniaPluginContext,
  Store as PiniaStore,
  StateTree,
} from 'pinia';
import type { PersistentState } from 'src/PersistentState';
import { PersistentStateBuilder } from 'src/PersistentStateBuilder';
import { createPersistentState } from 'src/index';
import type {
  GlobalPersistentStateOptions,
  KeyFn,
  LocalPersistentStateOptions,
} from 'src/types';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/PersistentStateBuilder');

describe('createPersistentState', () => {
  describe('plugin()', () => {
    const storeId: string = 'test-store';
    let store: PiniaStore;
    let context: PiniaPluginContext;
    let persistentState: PersistentState<StateTree>;
    let originalDispose: Mock;

    beforeEach(() => {
      vi.clearAllMocks();

      originalDispose = vi.fn();
      store = {
        $id: storeId,
        $state: {},
        $patch: vi.fn(),
        $dispose: originalDispose,
      } as unknown as PiniaStore;
      context = {
        store,
        options: {},
        app: null,
        pinia: null,
      } as unknown as PiniaPluginContext;
      persistentState = {
        persist: vi.fn(),
        unpersist: vi.fn(),
      } as unknown as PersistentState<StateTree>;

      vi.mocked(PersistentStateBuilder.fromOptions).mockReturnValue(
        persistentState,
      );
    });

    describe('when called with global options', () => {
      it('should pass key function to builder', () => {
        const keyFn: KeyFn = (id: string): string => `custom-${id}`;
        const globalOptions: GlobalPersistentStateOptions<StateTree> = {
          key: keyFn,
        };
        const plugin: PiniaPlugin = createPersistentState(globalOptions);
        context.options.persistentState = true;
        plugin(context);
        expect(PersistentStateBuilder.fromOptions).toHaveBeenCalledWith(
          store,
          expect.objectContaining({ key: keyFn }),
        );
      });

      it('should pass storage to builder', () => {
        const storage: Storage = sessionStorage;
        const globalOptions: GlobalPersistentStateOptions<StateTree> = {
          storage,
        };
        const plugin: PiniaPlugin = createPersistentState(globalOptions);
        context.options.persistentState = true;
        plugin(context);
        expect(PersistentStateBuilder.fromOptions).toHaveBeenCalledWith(
          store,
          expect.objectContaining({ storage }),
        );
      });

      it('should pass serialization functions to builder', () => {
        const globalOptions: GlobalPersistentStateOptions<StateTree> = {
          serialize: JSON.stringify,
          deserialize: JSON.parse,
        };
        const plugin: PiniaPlugin = createPersistentState(globalOptions);
        context.options.persistentState = true;
        plugin(context);
        expect(PersistentStateBuilder.fromOptions).toHaveBeenCalledWith(
          store,
          expect.objectContaining({
            serialize: JSON.stringify,
            deserialize: JSON.parse,
          }),
        );
      });
    });

    describe('when called with local options', () => {
      it('should pass pick paths to builder', () => {
        const localOptions: LocalPersistentStateOptions<StateTree> = {
          pickPaths: ['foo', 'bar'],
        };
        context.options.persistentState = localOptions;
        const plugin: PiniaPlugin = createPersistentState();
        plugin(context);
        expect(PersistentStateBuilder.fromOptions).toHaveBeenCalledWith(
          store,
          expect.objectContaining({ pickPaths: ['foo', 'bar'] }),
        );
      });

      it('should pass omit paths to builder', () => {
        const localOptions: LocalPersistentStateOptions<StateTree> = {
          omitPaths: ['baz', 'qux'],
        };
        context.options.persistentState = localOptions;
        const plugin: PiniaPlugin = createPersistentState();
        plugin(context);
        expect(PersistentStateBuilder.fromOptions).toHaveBeenCalledWith(
          store,
          expect.objectContaining({ omitPaths: ['baz', 'qux'] }),
        );
      });
    });

    describe('when called with combined options', () => {
      it('should override global options with local options', () => {
        const keyFn: KeyFn = (id: string): string => `global-${id}`;
        const localKeyFn: KeyFn = (id: string): string => `local-${id}`;
        const globalOptions: GlobalPersistentStateOptions<StateTree> = {
          key: keyFn,
          storage: sessionStorage,
        };
        const localOptions: LocalPersistentStateOptions<StateTree> = {
          key: localKeyFn,
          pickPaths: ['foo'],
        };
        context.options.persistentState = localOptions;
        const plugin: PiniaPlugin = createPersistentState(globalOptions);
        plugin(context);
        expect(PersistentStateBuilder.fromOptions).toHaveBeenCalledWith(
          store,
          expect.objectContaining({
            key: localKeyFn,
            storage: sessionStorage,
            pickPaths: ['foo'],
          }),
        );
      });
    });

    describe('when called with no options', () => {
      it('should not create PersistentState', () => {
        const plugin: PiniaPlugin = createPersistentState();
        plugin(context);
        expect(PersistentStateBuilder.fromOptions).not.toHaveBeenCalled();
      });
    });

    describe('when store is disposing', () => {
      it('should unpersist state before calling original dispose', () => {
        const unpersistOrder: number[] = [];
        const unpersistSpy = vi.fn(() => {
          unpersistOrder.push(1);
        });
        const originalDisposeSpy = vi.fn(() => {
          unpersistOrder.push(2);
        });
        persistentState.unpersist = unpersistSpy;
        store.$dispose = originalDisposeSpy;
        const plugin: PiniaPlugin = createPersistentState();
        context.options.persistentState = true;
        plugin(context);
        context.store.$dispose();
        expect(unpersistSpy).toHaveBeenCalled();
        expect(originalDisposeSpy).toHaveBeenCalled();
        expect(unpersistOrder).toEqual([1, 2]);
      });
    });
  });
});

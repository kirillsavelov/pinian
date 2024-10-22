import type { PiniaPlugin, PiniaPluginContext, StateTree, Store } from 'pinia';
import { PersistentStateManager } from 'src/core/PersistentStateManager';
import { createPersistentState } from 'src/index';
import type {
  GlobalPersistentStateOptions,
  PersistentStateOptions,
} from 'src/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/core/PersistentStateManager');

describe('createPersistentState', () => {
  const globalOptions: GlobalPersistentStateOptions<StateTree> = {
    key: (id: string): string => id,
    storage: localStorage,
  };
  const storeStub: Partial<Store> = {};
  let plugin: PiniaPlugin;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = createPersistentState(globalOptions);
  });

  describe('plugin', () => {
    describe('with options.persistentState as an array', () => {
      const options: PersistentStateOptions<StateTree>[] = [
        { pickPaths: ['a'] },
        { omitPaths: ['b'] },
      ];

      beforeEach(() => {
        plugin({
          store: storeStub,
          options: {
            persistentState: options,
          },
        } as PiniaPluginContext);
      });

      it('should create a PersistentStateManager for each option and initialize them', () => {
        expect(PersistentStateManager).toHaveBeenCalledTimes(2);
        expect(PersistentStateManager).toHaveBeenNthCalledWith(1, storeStub, {
          ...globalOptions,
          ...options[0],
        });
        expect(PersistentStateManager).toHaveBeenNthCalledWith(2, storeStub, {
          ...globalOptions,
          ...options[1],
        });

        const instances: PersistentStateManager<StateTree>[] = vi.mocked(
          PersistentStateManager,
        ).mock.instances;

        expect(instances[0].initialize).toHaveBeenCalledTimes(1);
        expect(instances[1].initialize).toHaveBeenCalledTimes(1);
      });
    });

    describe('with options.persistentState as an object', () => {
      const options: PersistentStateOptions<StateTree> = {
        pickPaths: ['a'],
      };

      beforeEach(() => {
        plugin({
          store: storeStub,
          options: {
            persistentState: options,
          },
        } as PiniaPluginContext);
      });

      it('should create a PersistentStateManager and initialize it', () => {
        expect(PersistentStateManager).toHaveBeenCalledTimes(1);
        expect(PersistentStateManager).toHaveBeenCalledWith(storeStub, {
          ...globalOptions,
          ...options,
        });

        const instance: PersistentStateManager<StateTree> = vi.mocked(
          PersistentStateManager,
        ).mock.instances[0];

        expect(instance.initialize).toHaveBeenCalledTimes(1);
      });
    });

    describe('with options.persistentState as true', () => {
      beforeEach(() => {
        plugin({
          store: storeStub,
          options: {
            persistentState: true,
          },
        } as PiniaPluginContext);
      });

      it('should create a PersistentStateManager and initialize it', () => {
        expect(PersistentStateManager).toHaveBeenCalledTimes(1);
        expect(PersistentStateManager).toHaveBeenCalledWith(
          storeStub,
          globalOptions,
        );

        const instance: PersistentStateManager<StateTree> = vi.mocked(
          PersistentStateManager,
        ).mock.instances[0];

        expect(instance.initialize).toHaveBeenCalledTimes(1);
      });
    });

    describe('with options.persistentState as falsy or absent', () => {
      beforeEach(() => {
        plugin({
          store: storeStub,
          options: {},
        } as PiniaPluginContext);
      });

      it('should not create any PersistentStateManager instances', () => {
        expect(PersistentStateManager).not.toHaveBeenCalled();
      });
    });
  });
});

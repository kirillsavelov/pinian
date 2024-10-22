import type { StateTree, Store } from 'pinia';
import { PersistentStateManager } from 'src/core/PersistentStateManager';
import type { DeepPartial } from 'src/types';
import { StorageStub } from 'test/stubs/StorageStub';
import { beforeEach, describe, expect, it, vi } from 'vitest';

class StoreMock implements Store {
  _customProperties = new Set<string>();
  $id: string;
  $state: StateTree = {};
  $dispose = vi.fn();
  $onAction = vi.fn();
  $patch = vi.fn();
  $reset = vi.fn();
  $subscribe = vi.fn();

  constructor(id: string) {
    this.$id = id;
  }
}

describe('PersistentStateManager', () => {
  const id: string = 'id';
  let storeMock: StoreMock;
  let persistentStateManager: PersistentStateManager<StateTree>;

  beforeEach(() => {
    storeMock = new StoreMock(id);
    vi.stubGlobal('localStorage', new StorageStub());
  });

  describe('initialize()', () => {
    describe('with default options', () => {
      beforeEach(() => {
        persistentStateManager = new PersistentStateManager(storeMock);
      });

      describe('when there is saved state in storage', () => {
        const savedState: DeepPartial<StateTree> = { a: 2, b: { c: 3 } };

        beforeEach(() => {
          localStorage.setItem(id, JSON.stringify(savedState));
        });

        it('should hydrate the store with the saved state', () => {
          persistentStateManager.initialize();
          expect(storeMock.$patch).toHaveBeenCalledWith(savedState);
        });
      });

      describe('when there is no saved state in storage', () => {
        it('should not modify the store state', () => {
          persistentStateManager.initialize();
          expect(storeMock.$patch).not.toHaveBeenCalled();
        });
      });

      it('should subscribe to store changes', () => {
        persistentStateManager.initialize();
        expect(storeMock.$subscribe).toHaveBeenCalled();
      });

      describe('when store state changes after initialization', () => {
        beforeEach(() => {
          persistentStateManager.initialize();
        });

        it('should save the new state to storage', () => {
          const newState: DeepPartial<StateTree> = { a: 3, b: { c: 4 } };
          storeMock.$state = newState;
          storeMock.$subscribe.mock.calls[0][0]();
          const savedState: DeepPartial<StateTree> = JSON.parse(
            localStorage.getItem(id) as string,
          );
          expect(savedState).toEqual(newState);
        });
      });
    });

    describe('with custom options', () => {
      const customKey: string = `custom-${id}`;

      beforeEach(() => {
        persistentStateManager = new PersistentStateManager(storeMock, {
          key: (id: string): string => `custom-${id}`,
          pickPaths: ['a'],
        });
      });

      describe('when there is saved state under custom key', () => {
        const savedState: DeepPartial<StateTree> = { a: 2 };

        beforeEach(() => {
          localStorage.setItem(customKey, JSON.stringify(savedState));
        });

        it('should hydrate the store with the saved state using custom options', () => {
          persistentStateManager.initialize();
          expect(storeMock.$patch).toHaveBeenCalledWith(savedState);
        });
      });

      it('should save and load state using the custom key and options', () => {
        persistentStateManager.initialize();
        const newState: DeepPartial<StateTree> = { a: 5, b: { c: 6 } };
        storeMock.$state = newState;
        storeMock.$subscribe.mock.calls[0][0]();
        const savedState: DeepPartial<StateTree> = JSON.parse(
          localStorage.getItem(customKey) || '',
        );
        expect(savedState).toEqual({ a: 5 });
      });
    });
  });
});

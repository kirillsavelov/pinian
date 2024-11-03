import type { StateTree } from 'pinia';
import { PersistentState } from 'src/PersistentState';
import type { Filter } from 'src/filter';
import type { Sanitizer } from 'src/sanitizer';
import type { Serializer } from 'src/serializer';
import type { Store } from 'src/store';
import type { KeyValueStorage } from 'src/types';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

describe('PersistentState', () => {
  const initialState: StateTree = { foo: 'bar' };
  const serializedState: string = 'serialized-state';
  const key: string = 'test-store';
  let unsubscribe: Mock;
  let store: Store<StateTree>;
  let storage: KeyValueStorage;
  let serializer: Serializer<StateTree>;
  let filter: Filter<StateTree>;
  let sanitizer: Sanitizer<StateTree>;
  let persistentState: PersistentState<StateTree>;

  beforeEach(() => {
    unsubscribe = vi.fn();
    store = {
      getState: vi.fn().mockReturnValue(initialState),
      patchState: vi.fn(),
      subscribe: vi.fn().mockReturnValue(unsubscribe),
    } as unknown as Store<StateTree>;
    storage = {
      getItem: vi.fn().mockReturnValue(serializedState),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    } as unknown as KeyValueStorage;
    serializer = {
      serialize: vi.fn().mockReturnValue(serializedState),
      deserialize: vi.fn().mockReturnValue(initialState),
    } as unknown as Serializer<StateTree>;
    filter = {
      filter: vi.fn().mockImplementation((state) => state),
    } as unknown as Filter<StateTree>;
    sanitizer = {
      sanitize: vi.fn().mockImplementation((state) => state),
    } as unknown as Sanitizer<StateTree>;
    persistentState = new PersistentState(
      store,
      key,
      storage,
      serializer,
      filter,
      sanitizer,
    );
  });

  describe('persist()', () => {
    it('should load state from storage when called', () => {
      persistentState.persist();
      expect(store.patchState).toHaveBeenCalledWith(initialState);
    });

    it('should subscribe to store when no subscription exists', () => {
      persistentState.persist();
      expect(store.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to store only once when called multiple times', () => {
      persistentState.persist();
      persistentState.persist();
      expect(store.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should keep state unchanged when storage is empty', () => {
      storage.getItem = vi.fn().mockReturnValue(null);
      persistentState.persist();
      expect(store.patchState).not.toHaveBeenCalled();
    });
  });

  describe('unpersist()', () => {
    it('should unsubscribe from store when subscription exists', () => {
      const unsubscribe: Mock = vi.fn();
      store.subscribe = vi.fn().mockReturnValue(unsubscribe);
      persistentState.persist();
      persistentState.unpersist();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should not unsubscribe from store when no subscription exists', () => {
      persistentState.unpersist();
      expect(store.subscribe).not.toHaveBeenCalled();
    });

    it('should unsubscribe from store only once when called multiple times', () => {
      const unsubscribe: Mock = vi.fn();
      store.subscribe = vi.fn().mockReturnValue(unsubscribe);
      persistentState.persist();
      persistentState.unpersist();
      persistentState.unpersist();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});

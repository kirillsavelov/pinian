import type { Store as PiniaStore, StateTree } from 'pinia';
import { PiniaAdapter } from 'src/store';
import type { DeepPartial } from 'src/types';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

describe('PiniaAdapter', () => {
  const initialState: StateTree = { foo: 'bar' };
  let piniaStore: PiniaStore;
  let piniaAdapter: PiniaAdapter<StateTree>;

  beforeEach(() => {
    piniaStore = {
      $id: 'test',
      $state: initialState,
      $patch: vi.fn(),
      $subscribe: vi.fn(),
    } as unknown as PiniaStore;
    piniaAdapter = new PiniaAdapter(piniaStore);
  });

  describe('getState()', () => {
    it('should return store state when called', () => {
      expect(piniaAdapter.getState()).toBe(initialState);
    });
  });

  describe('patchState()', () => {
    it('should patch store state when called with partial state', () => {
      const partialState: DeepPartial<StateTree> = { foo: 'baz' };
      piniaAdapter.patchState(partialState);
      expect(piniaStore.$patch).toHaveBeenCalledWith(partialState);
    });
  });

  describe('subscribe()', () => {
    it('should subscribe to store changes when called', () => {
      const callback: Mock = vi.fn();
      piniaAdapter.subscribe(callback);
      expect(piniaStore.$subscribe).toHaveBeenCalled();
    });

    it('should call callback when store changes when called', () => {
      const callback: Mock = vi.fn();
      piniaStore.$subscribe = vi
        .fn()
        .mockImplementation((fn: Mock): Mock => fn());
      piniaAdapter.subscribe(callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});

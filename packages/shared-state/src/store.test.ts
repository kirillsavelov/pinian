import type { Store as PiniaStore, StateTree } from 'pinia';
import { PiniaAdapter } from 'src/store';
import type { DeepPartial } from 'src/types';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

describe('PiniaAdapter', () => {
  const initialState: StateTree = {
    foo: 'bar',
    nested: {
      value: 123,
    },
  };
  let piniaStore: PiniaStore;
  let piniaAdapter: PiniaAdapter<StateTree>;

  beforeEach(() => {
    piniaStore = {
      $state: initialState,
      $patch: vi.fn(),
      $subscribe: vi.fn(),
    } as unknown as PiniaStore;
    piniaAdapter = new PiniaAdapter(piniaStore);
  });

  describe('state', () => {
    describe('when accessed', () => {
      it('should return raw state', () => {
        expect(piniaAdapter.state).toEqual(initialState);
        expect(piniaAdapter.state).not.toBe(initialState);
      });
    });
  });

  describe('patch()', () => {
    describe('with full state', () => {
      it('should call store patch with full state', () => {
        const newState: StateTree = { foo: 'baz' };
        piniaAdapter.patch(newState);
        expect(piniaStore.$patch).toHaveBeenCalledWith(newState);
      });
    });

    describe('with partial state', () => {
      it('should call store patch with partial update', () => {
        const partialState: DeepPartial<StateTree> = {
          nested: { value: 456 },
        };
        piniaAdapter.patch(partialState);
        expect(piniaStore.$patch).toHaveBeenCalledWith(partialState);
      });
    });
  });

  describe('subscribe()', () => {
    describe('when subscribing', () => {
      it('should register handler with store', () => {
        const handler: () => void = () => {};
        piniaAdapter.subscribe(handler);
        expect(piniaStore.$subscribe).toHaveBeenCalled();
      });

      it('should return unsubscribe function', () => {
        const unsubscribe: Mock = vi.fn();
        (piniaStore.$subscribe as any).mockReturnValue(unsubscribe);
        const handler: () => void = () => {};
        const result: () => void = piniaAdapter.subscribe(handler);
        expect(result).toBe(unsubscribe);
      });
    });
  });
});

import type { StateTree } from 'pinia';
import { SharedState } from 'src/SharedState';
import type { Channel } from 'src/channel';
import type { Filter } from 'src/filter';
import type { Merger } from 'src/merger';
import type { Store } from 'src/store';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

describe('SharedState', () => {
  const initialState: StateTree = { foo: 'bar' };
  const filteredState: StateTree = { foo: 'filtered' };
  const mergedState: StateTree = { foo: 'merged' };
  let store: Store<StateTree>;
  let channel: Channel<StateTree>;
  let merger: Merger<StateTree>;
  let filter: Filter<StateTree>;
  let sharedState: SharedState<StateTree>;

  beforeEach(() => {
    store = {
      state: initialState,
      patch: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as Store<StateTree>;
    channel = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      broadcast: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as Channel<StateTree>;
    merger = {
      merge: vi.fn().mockReturnValue(mergedState),
    } as unknown as Merger<StateTree>;
    filter = {
      filter: vi.fn().mockReturnValue(filteredState),
    } as unknown as Filter<StateTree>;
    sharedState = new SharedState(store, channel, merger, filter);
  });

  describe('connect()', () => {
    it('should establish connection when called with no active connection', () => {
      sharedState.connect();
      expect(channel.connect).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to store when called with no active connection', () => {
      sharedState.connect();
      expect(channel.subscribe).toHaveBeenCalledTimes(1);
      expect(store.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should not establish another connection when called with active connection', () => {
      sharedState.connect();
      sharedState.connect();
      expect(channel.connect).toHaveBeenCalledTimes(1);
    });

    it('should not subscribe again when called with active connection', () => {
      sharedState.connect();
      sharedState.connect();
      expect(channel.subscribe).toHaveBeenCalledTimes(1);
      expect(store.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect()', () => {
    it('should close connection when called with active connection', () => {
      sharedState.connect();
      sharedState.disconnect();
      expect(channel.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from store when called with active connection', () => {
      const unsubscribe: Mock = vi.fn();
      (store.subscribe as Mock).mockReturnValue(unsubscribe);
      sharedState.connect();
      sharedState.disconnect();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when called with no active connection', () => {
      sharedState.disconnect();
      expect(channel.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect only once when called with multiple calls', () => {
      sharedState.connect();
      sharedState.disconnect();
      sharedState.disconnect();
      expect(channel.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});

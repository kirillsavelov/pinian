import type { Store as PiniaStore, StateTree } from 'pinia';
import type { SharedState } from 'src/SharedState';
import { SharedStateBuilder } from 'src/SharedStateBuilder';
import { TabChannel } from 'src/channel';
import { PathFilter } from 'src/filter';
import { DeepMerger, OverwriteMerger, ShallowMerger } from 'src/merger';
import type { Store } from 'src/store';
import type { LocalSharedStateOptions, MergeStrategy } from 'src/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/store');
vi.mock('src/channel');
vi.mock('src/merger');
vi.mock('src/filter');

describe('SharedStateBuilder', () => {
  const storeId: string = 'test-store';
  let piniaStore: PiniaStore;
  let store: Store<StateTree>;
  let sharedStateBuilder: SharedStateBuilder<StateTree>;

  beforeEach(() => {
    piniaStore = {
      $id: storeId,
    } as unknown as PiniaStore;
    store = {
      getState: vi.fn(),
      patchState: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as Store<StateTree>;
    sharedStateBuilder = new SharedStateBuilder();
  });

  describe('setStore()', () => {
    it('should save store when called with valid store', () => {
      sharedStateBuilder.setStore(store);
      expect(sharedStateBuilder['store']).toBe(store);
    });
  });

  describe('setChannel()', () => {
    it('should create TabChannel with default options when called with only storeId', () => {
      sharedStateBuilder.setChannel(storeId);
      expect(TabChannel).toHaveBeenCalledWith(storeId, true);
    });

    it('should use custom channel name when called with custom channel function', () => {
      const channelFn: (id: string) => string = (id: string) => `custom-${id}`;
      sharedStateBuilder.setChannel(storeId, channelFn);
      expect(TabChannel).toHaveBeenCalledWith(`custom-${storeId}`, true);
    });

    it('should pass instant flag to TabChannel when called with instant flag', () => {
      sharedStateBuilder.setChannel(storeId, undefined, true);
      expect(TabChannel).toHaveBeenCalledWith(storeId, true);
    });
  });

  describe('setMerger()', () => {
    it('should create OverwriteMerger when called without merge strategy', () => {
      sharedStateBuilder.setMerger();
      expect(OverwriteMerger).toHaveBeenCalled();
    });

    it('should create OverwriteMerger when called with overwrite strategy', () => {
      sharedStateBuilder.setMerger('overwrite');
      expect(OverwriteMerger).toHaveBeenCalled();
    });

    it('should create ShallowMerger when called with shallow strategy', () => {
      sharedStateBuilder.setMerger('shallow');
      expect(ShallowMerger).toHaveBeenCalled();
    });

    it('should create DeepMerger when called with deep strategy', () => {
      sharedStateBuilder.setMerger('deep');
      expect(DeepMerger).toHaveBeenCalled();
    });

    it('should create custom merger when called with custom merge function', () => {
      const customMerge: MergeStrategy<StateTree> = (
        oldState: StateTree,
        newState: StateTree,
      ) => ({ ...oldState, ...newState }) as StateTree;
      sharedStateBuilder.setMerger(customMerge);
      expect(sharedStateBuilder['merger']?.merge).toBe(customMerge);
    });
  });

  describe('setFilter()', () => {
    it('should create PathFilter with empty paths when called with no arguments', () => {
      sharedStateBuilder.setFilter();
      expect(PathFilter).toHaveBeenCalledWith([], []);
    });

    it('should create PathFilter with provided paths when called with paths', () => {
      const pickPaths: string[] = ['foo'];
      const omitPaths: string[] = ['bar'];
      sharedStateBuilder.setFilter(pickPaths, omitPaths);
      expect(PathFilter).toHaveBeenCalledWith(pickPaths, omitPaths);
    });
  });

  describe('build()', () => {
    it('should create SharedState when called with complete configuration', () => {
      sharedStateBuilder
        .setStore(store)
        .setChannel(storeId)
        .setMerger()
        .setFilter();
      const sharedState: SharedState<StateTree> = sharedStateBuilder.build();
      expect(sharedState).toBeDefined();
    });

    it('should throw error when called with incomplete configuration', () => {
      expect(() => sharedStateBuilder.build()).toThrow(
        'SharedState is not configured properly',
      );
    });
  });

  describe('fromOptions()', () => {
    it('should create SharedState with custom configuration when all options are provided', () => {
      const options: LocalSharedStateOptions<StateTree> = {
        channel: (id: string) => `custom-${id}`,
        instant: true,
        mergeStrategy: 'deep',
        pickPaths: ['foo'],
        omitPaths: ['bar'],
      };
      const sharedState: SharedState<StateTree> =
        SharedStateBuilder.fromOptions(piniaStore, options);
      expect(sharedState).toBeDefined();
    });

    it('should create SharedState with default configuration when no options are provided', () => {
      const options: LocalSharedStateOptions<StateTree> = {};
      const sharedState: SharedState<StateTree> =
        SharedStateBuilder.fromOptions(piniaStore, options);
      expect(sharedState).toBeDefined();
      expect(PathFilter).toHaveBeenCalledWith([], []);
    });
  });
});

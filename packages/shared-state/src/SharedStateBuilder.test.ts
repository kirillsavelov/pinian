import type { Store as PiniaStore, StateTree } from 'pinia';
import type { SharedState } from 'src/SharedState';
import { SharedStateBuilder } from 'src/SharedStateBuilder';
import { TabChannel } from 'src/channel';
import { PathFilter } from 'src/filter';
import { DeepMerger, OverwriteMerger, ShallowMerger } from 'src/merger';
import { PiniaAdapter } from 'src/store';
import type { LocalSharedStateOptions, MergeStrategy } from 'src/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/store');
vi.mock('src/channel');
vi.mock('src/filter');
vi.mock('src/merger');

describe('SharedStateBuilder', () => {
  const storeId: string = 'test-store';
  let piniaStore: PiniaStore;
  let sharedStateBuilder: SharedStateBuilder<StateTree>;

  beforeEach(() => {
    piniaStore = {
      $id: storeId,
    } as unknown as PiniaStore;
    sharedStateBuilder = new SharedStateBuilder();
  });

  describe('setStore()', () => {
    describe('when called', () => {
      describe('with valid store', () => {
        it('should create PiniaAdapter', () => {
          sharedStateBuilder.setStore(piniaStore);
          expect(PiniaAdapter).toHaveBeenCalledWith(piniaStore);
        });
      });
    });
  });

  describe('setChannel()', () => {
    describe('when called', () => {
      describe('with only storeId', () => {
        it('should create TabChannel with default options', () => {
          sharedStateBuilder.setChannel(storeId);
          expect(TabChannel).toHaveBeenCalledWith(storeId, undefined);
        });
      });

      describe('with custom channel function', () => {
        it('should use custom channel name', () => {
          const channelFn: (id: string) => string = (id: string) =>
            `custom-${id}`;
          sharedStateBuilder.setChannel(storeId, channelFn);
          expect(TabChannel).toHaveBeenCalledWith(
            `custom-${storeId}`,
            undefined,
          );
        });
      });

      describe('with instant flag', () => {
        it('should pass instant flag to TabChannel', () => {
          sharedStateBuilder.setChannel(storeId, undefined, true);
          expect(TabChannel).toHaveBeenCalledWith(storeId, true);
        });
      });
    });
  });

  describe('setFilter()', () => {
    describe('when called', () => {
      describe('with pick and omit paths', () => {
        it('should create PathFilter with paths', () => {
          const pickPaths: string[] = ['foo'];
          const omitPaths: string[] = ['bar'];
          sharedStateBuilder.setFilter(pickPaths, omitPaths);
          expect(PathFilter).toHaveBeenCalledWith(pickPaths, omitPaths);
        });
      });

      describe('without paths', () => {
        it('should create default PathFilter', () => {
          sharedStateBuilder.setFilter();
          expect(PathFilter).toHaveBeenCalledWith(undefined, undefined);
        });
      });
    });
  });

  describe('setMerger()', () => {
    describe('when called', () => {
      describe('with overwrite strategy', () => {
        it('should create OverwriteMerger', () => {
          sharedStateBuilder.setMerger('overwrite');
          expect(OverwriteMerger).toHaveBeenCalled();
        });
      });

      describe('with shallow strategy', () => {
        it('should create ShallowMerger', () => {
          sharedStateBuilder.setMerger('shallow');
          expect(ShallowMerger).toHaveBeenCalled();
        });
      });

      describe('with deep strategy', () => {
        it('should create DeepMerger', () => {
          sharedStateBuilder.setMerger('deep');
          expect(DeepMerger).toHaveBeenCalled();
        });
      });

      describe('with custom merge function', () => {
        it('should use custom merger', () => {
          const customMerge: MergeStrategy<StateTree> = (
            oldState: StateTree,
            newState: StateTree,
          ) => ({ ...oldState, ...newState }) as StateTree;
          sharedStateBuilder.setMerger(customMerge);
          expect(sharedStateBuilder['merger']?.merge).toBe(customMerge);
        });
      });

      describe('without merge strategy', () => {
        it('should create OverwriteMerger', () => {
          sharedStateBuilder.setMerger();
          expect(OverwriteMerger).toHaveBeenCalled();
        });
      });
    });
  });

  describe('build()', () => {
    describe('when called', () => {
      describe('with complete configuration', () => {
        it('should create SharedState instance', () => {
          sharedStateBuilder
            .setStore(piniaStore)
            .setChannel(storeId)
            .setFilter()
            .setMerger();

          const sharedState: SharedState<StateTree> =
            sharedStateBuilder.build();
          expect(sharedState).toBeDefined();
        });
      });

      describe('with incomplete configuration', () => {
        it('should throw error', () => {
          expect(() => sharedStateBuilder.build()).toThrow(
            'SharedState is not configured properly',
          );
        });
      });
    });
  });

  describe('fromOptions()', () => {
    describe('when called', () => {
      describe('with full options', () => {
        it('should create configured SharedState', () => {
          const options: LocalSharedStateOptions<StateTree> = {
            channel: (id: string) => `custom-${id}`,
            instant: true,
            pickPaths: ['foo'],
            omitPaths: ['bar'],
            mergeStrategy: 'deep',
          };

          const sharedState: SharedState<StateTree> =
            SharedStateBuilder.fromOptions(piniaStore, options);
          expect(sharedState).toBeDefined();
        });
      });
    });
  });
});

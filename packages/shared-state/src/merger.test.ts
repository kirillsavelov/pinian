import type { StateTree } from 'pinia';
import { DeepMerger, OverwriteMerger, ShallowMerger } from 'src/merger';
import { beforeEach, describe, expect, it } from 'vitest';

const oldState: StateTree = {
  a: 1,
  b: 'old',
  nested: {
    x: true,
    y: {
      deep: 'value',
    },
  },
  array: [1, 2, 3],
};
const newState: StateTree = {
  a: 1,
  b: 'new',
  nested: {
    x: false,
    y: {
      deep: 'new-value',
    },
  },
  array: [1, 2, 3],
};

describe('OverwriteMerger', () => {
  let overwriteMerger: OverwriteMerger<StateTree>;

  describe('merge()', () => {
    describe('with different states', () => {
      it('should completely overwrite old state with new state', () => {
        overwriteMerger = new OverwriteMerger<StateTree>();
        expect(overwriteMerger.merge(oldState, newState)).toBe(newState);
      });
    });
  });
});

describe('ShallowMerger', () => {
  let shallowMerger: ShallowMerger<StateTree>;

  beforeEach(() => {
    shallowMerger = new ShallowMerger<StateTree>();
  });

  describe('merge()', () => {
    describe('with nested objects', () => {
      it('should merge only top-level properties', () => {
        const result: StateTree = shallowMerger.merge(oldState, newState);
        expect(result).toEqual({
          ...oldState,
          ...newState,
        });
      });

      it('should overwrite nested objects entirely', () => {
        const result: StateTree = shallowMerger.merge(oldState, newState);
        expect(result.nested).toBe(newState.nested);
      });
    });
  });
});

describe('DeepMerger', () => {
  let deepMerger: DeepMerger<StateTree>;

  beforeEach(() => {
    deepMerger = new DeepMerger<StateTree>();
  });

  describe('merge()', () => {
    describe('with nested objects', () => {
      it('should merge objects recursively', () => {
        const result: StateTree = deepMerger.merge(oldState, newState);
        expect(result).toEqual({
          a: 1,
          b: 'new',
          nested: {
            x: false,
            y: {
              deep: 'new-value',
            },
          },
          array: [1, 2, 3],
        });
      });
    });

    describe('with arrays', () => {
      it('should replace arrays entirely', () => {
        const stateWithNewArray: StateTree = {
          ...oldState,
          array: [4, 5],
        };
        const result: StateTree = deepMerger.merge(oldState, stateWithNewArray);
        expect(result.array).toEqual([4, 5]);
      });
    });

    describe('with non-object values', () => {
      it('should overwrite with new primitive values', () => {
        const stateWithString: StateTree = {
          ...oldState,
          nested: 'string',
        };
        const result: StateTree = deepMerger.merge(oldState, stateWithString);
        expect(result.nested).toBe('string');
      });
    });

    describe('with null values', () => {
      it('should preserve original non-null values', () => {
        const stateWithNulls: StateTree = {
          ...oldState,
          b: null,
          nested: {
            ...oldState.nested,
            x: null,
          },
        };
        const result: StateTree = deepMerger.merge(oldState, stateWithNulls);
        expect(result.b).toBe(oldState.b);
        expect(result.nested.x).toBe(oldState.nested.x);
      });
    });
  });
});

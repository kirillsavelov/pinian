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
    it('should completely overwrite old state with new state when called with different states', () => {
      overwriteMerger = new OverwriteMerger<StateTree>();
      expect(overwriteMerger.merge(oldState, newState)).toBe(newState);
    });
  });
});

describe('ShallowMerger', () => {
  let shallowMerger: ShallowMerger<StateTree>;

  beforeEach(() => {
    shallowMerger = new ShallowMerger<StateTree>();
  });

  describe('merge()', () => {
    it('should merge only top-level properties when called with nested objects', () => {
      const result: StateTree = shallowMerger.merge(oldState, newState);
      expect(result).toEqual({
        ...oldState,
        ...newState,
      });
    });

    it('should overwrite nested objects entirely  when called with nested objects', () => {
      const result: StateTree = shallowMerger.merge(oldState, newState);
      expect(result.nested).toBe(newState.nested);
    });
  });
});

describe('DeepMerger', () => {
  let deepMerger: DeepMerger<StateTree>;

  beforeEach(() => {
    deepMerger = new DeepMerger<StateTree>();
  });

  describe('merge()', () => {
    it('should merge objects recursively when called with nested objects', () => {
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

    it('should replace arrays entirely when called with arrays', () => {
      const stateWithNewArray: StateTree = {
        ...oldState,
        array: [4, 5],
      };
      const result: StateTree = deepMerger.merge(oldState, stateWithNewArray);
      expect(result.array).toEqual([4, 5]);
    });

    it('should overwrite with new primitive values when called with non-object values', () => {
      const stateWithString: StateTree = {
        ...oldState,
        nested: 'string',
      };
      const result: StateTree = deepMerger.merge(oldState, stateWithString);
      expect(result.nested).toBe('string');
    });

    it('should preserve original non-null values when called with null values', () => {
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

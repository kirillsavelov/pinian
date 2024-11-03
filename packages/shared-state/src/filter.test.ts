import type { StateTree } from 'pinia';
import { PathFilter } from 'src/filter';
import { describe, expect, it } from 'vitest';

describe('PathFilter', () => {
  const state: StateTree = {
    foo: 'bar',
    nested: {
      a: 1,
      b: 2,
      deep: {
        x: true,
        y: false,
      },
    },
    array: [1, 2, 3],
  };
  let pathFilter: PathFilter<StateTree>;

  describe('constructor()', () => {
    it('should create filter with empty paths when called with default options', () => {
      pathFilter = new PathFilter();
      expect(pathFilter.filter(state)).toEqual(state);
    });
  });

  describe('filter()', () => {
    it('should return original state when called with empty paths', () => {
      pathFilter = new PathFilter();
      expect(pathFilter.filter(state)).toEqual(state);
    });

    it('should pick simple paths when called with pick paths', () => {
      pathFilter = new PathFilter(['foo']);
      expect(pathFilter.filter(state)).toEqual({ foo: 'bar' });
    });

    it('should pick nested paths when called with pick paths', () => {
      pathFilter = new PathFilter(['nested.a', 'nested.deep.x']);
      expect(pathFilter.filter(state)).toEqual({
        nested: {
          a: 1,
          deep: {
            x: true,
          },
        },
      });
    });

    it('should handle non-existent paths when called with pick paths', () => {
      pathFilter = new PathFilter(['missing', 'nested.missing']);
      expect(pathFilter.filter(state)).toEqual({});
    });

    it('should omit simple paths when called with omit paths', () => {
      pathFilter = new PathFilter([], ['foo']);
      const expected: StateTree = { ...state };
      expected.foo = undefined;
      expect(pathFilter.filter(state)).toEqual(expected);
    });

    it('should omit nested paths when called with omit paths', () => {
      pathFilter = new PathFilter([], ['nested.a', 'nested.deep.x']);
      expect(pathFilter.filter(state)).toEqual({
        foo: 'bar',
        array: [1, 2, 3],
        nested: {
          b: 2,
          deep: {
            y: false,
          },
        },
      });
    });

    it('should handle non-existent paths when called with omit paths', () => {
      pathFilter = new PathFilter([], ['missing', 'nested.missing']);
      expect(pathFilter.filter(state)).toEqual(state);
    });

    it('should apply pick first, then omit when called with both pick and omit paths', () => {
      pathFilter = new PathFilter(['nested', 'foo'], ['nested.a']);
      expect(pathFilter.filter(state)).toEqual({
        foo: 'bar',
        nested: {
          b: 2,
          deep: {
            x: true,
            y: false,
          },
        },
      });
    });
  });
});

import type { StateTree } from 'pinia';
import { JsonSerializer } from 'src/serializer';
import { type Mock, describe, expect, it, vi } from 'vitest';

describe('JsonSerializer', () => {
  const state: StateTree = {
    string: 'value',
    number: 42,
    nested: { key: 'value' },
  };

  describe('serialize()', () => {
    it('should serialize state correctly when called with default JSON serializer', () => {
      const serializer: JsonSerializer<StateTree> = new JsonSerializer(
        JSON.stringify,
        JSON.parse,
      );
      expect(serializer.serialize(state)).toBe(JSON.stringify(state));
    });

    it('should use provided serialize function when called with custom serializer', () => {
      const serialize: Mock = vi.fn().mockReturnValue('serialized');
      const deserialize: Mock = vi.fn();
      const serializer: JsonSerializer<StateTree> = new JsonSerializer(
        serialize,
        deserialize,
      );
      serializer.serialize(state);
      expect(serialize).toHaveBeenCalledWith(state);
    });
  });

  describe('deserialize()', () => {
    it('should deserialize data correctly when called with default JSON deserializer', () => {
      const serializer: JsonSerializer<StateTree> = new JsonSerializer(
        JSON.stringify,
        JSON.parse,
      );
      const data: string = JSON.stringify(state);
      expect(serializer.deserialize(data)).toEqual(state);
    });

    it('should use provided deserialize function when called with custom deserializer', () => {
      const serialize: Mock = vi.fn();
      const deserialize: Mock = vi.fn().mockReturnValue(state);
      const serializer: JsonSerializer<StateTree> = new JsonSerializer(
        serialize,
        deserialize,
      );
      serializer.deserialize('data');
      expect(deserialize).toHaveBeenCalledWith('data');
    });
  });
});

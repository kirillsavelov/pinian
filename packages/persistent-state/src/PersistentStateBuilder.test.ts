import type { Store as PiniaStore, StateTree } from 'pinia';
import type { PersistentState } from 'src/PersistentState';
import { PersistentStateBuilder } from 'src/PersistentStateBuilder';
import { PathFilter } from 'src/filter';
import { HtmlSanitizer } from 'src/sanitizer';
import { JsonSerializer } from 'src/serializer';
import type { Store } from 'src/store';
import type { KeyFn, LocalPersistentStateOptions } from 'src/types';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/store');
vi.mock('src/serializer');
vi.mock('src/filter');
vi.mock('src/sanitizer');

describe('PersistentStateBuilder', () => {
  const storeId: string = 'test-store';
  let piniaStore: PiniaStore;
  let store: Store<StateTree>;
  let persistentStateBuilder: PersistentStateBuilder<StateTree>;

  beforeEach(() => {
    piniaStore = {
      $id: storeId,
    } as unknown as PiniaStore;
    store = {
      getState: vi.fn(),
      patchState: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as Store<StateTree>;
    persistentStateBuilder = new PersistentStateBuilder();
  });

  describe('setStore()', () => {
    it('should save store when called with valid store', () => {
      persistentStateBuilder.setStore(store);
      expect(persistentStateBuilder['store']).toBe(store);
    });
  });

  describe('setKey()', () => {
    it('should use default key function when called with only storeId', () => {
      persistentStateBuilder.setKey(storeId);
      expect(persistentStateBuilder['key']).toBe(storeId);
    });

    it('should use custom key when called with custom key function', () => {
      const keyFn: KeyFn = (id: string): string => `custom-${id}`;
      persistentStateBuilder.setKey(storeId, keyFn);
      expect(persistentStateBuilder['key']).toBe(`custom-${storeId}`);
    });
  });

  describe('setStorage()', () => {
    it('should use localStorage when called with no arguments', () => {
      persistentStateBuilder.setStorage();
      expect(persistentStateBuilder['storage']).toBe(localStorage);
    });

    it('should use provided storage when called with custom storage', () => {
      persistentStateBuilder.setStorage(sessionStorage);
      expect(persistentStateBuilder['storage']).toBe(sessionStorage);
    });
  });

  describe('setSerializer()', () => {
    it('should create default JsonSerializer when called with no arguments', () => {
      persistentStateBuilder.setSerializer();
      expect(JsonSerializer).toHaveBeenCalledWith(JSON.stringify, JSON.parse);
    });

    it('should create JsonSerializer with custom functions when called with custom functions', () => {
      const serialize: Mock = vi.fn();
      const deserialize: Mock = vi.fn();
      persistentStateBuilder.setSerializer(serialize, deserialize);
      expect(JsonSerializer).toHaveBeenCalledWith(serialize, deserialize);
    });
  });

  describe('setFilter()', () => {
    it('should create PathFilter with empty paths when called with no arguments', () => {
      persistentStateBuilder.setFilter();
      expect(PathFilter).toHaveBeenCalledWith([], []);
    });

    it('should create PathFilter with provided paths when called with paths', () => {
      const pickPaths: string[] = ['foo'];
      const omitPaths: string[] = ['bar'];
      persistentStateBuilder.setFilter(pickPaths, omitPaths);
      expect(PathFilter).toHaveBeenCalledWith(pickPaths, omitPaths);
    });
  });

  describe('setSanitizer()', () => {
    it('should create HtmlSanitizer when called', () => {
      persistentStateBuilder.setSanitizer();
      expect(HtmlSanitizer).toHaveBeenCalled();
    });
  });

  describe('build()', () => {
    it('should create PersistentState instance when called with complete configuration', () => {
      persistentStateBuilder
        .setStore(store)
        .setKey(storeId)
        .setStorage()
        .setSerializer()
        .setFilter()
        .setSanitizer();
      const persistentState: PersistentState<StateTree> =
        persistentStateBuilder.build();
      expect(persistentState).toBeDefined();
    });

    it('should throw error when called with incomplete configuration', () => {
      expect(() => persistentStateBuilder.build()).toThrow(
        'PersistentState is not configured properly',
      );
    });
  });

  describe('fromOptions()', () => {
    it('should create PersistentState with custom configuration when all options are provided', () => {
      const options: LocalPersistentStateOptions<StateTree> = {
        key: (id: string): string => `custom-${id}`,
        storage: sessionStorage,
        serialize: vi.fn(),
        deserialize: vi.fn(),
        pickPaths: ['foo'],
        omitPaths: ['bar'],
      };
      const persistentState: PersistentState<StateTree> =
        PersistentStateBuilder.fromOptions(piniaStore, options);
      expect(persistentState).toBeDefined();
      expect(JsonSerializer).toHaveBeenCalledWith(
        options.serialize,
        options.deserialize,
      );
      expect(PathFilter).toHaveBeenCalledWith(
        options.pickPaths,
        options.omitPaths,
      );
    });

    it('should create PersistentState with default configuration when no options are provided', () => {
      const options: LocalPersistentStateOptions<StateTree> = {};
      const persistentState: PersistentState<StateTree> =
        PersistentStateBuilder.fromOptions(piniaStore, options);
      expect(persistentState).toBeDefined();
      expect(JsonSerializer).toHaveBeenCalledWith(JSON.stringify, JSON.parse);
      expect(PathFilter).toHaveBeenCalledWith([], []);
    });

    it('should create PersistentState with default key when key function is not provided', () => {
      const options: LocalPersistentStateOptions<StateTree> = {};
      const persistentState: PersistentState<StateTree> =
        PersistentStateBuilder.fromOptions(piniaStore, options);
      expect(persistentState).toBeDefined();
      expect(persistentState['key']).toBe(storeId);
    });

    it('should create PersistentState with localStorage when storage is not provided', () => {
      const options: LocalPersistentStateOptions<StateTree> = {
        key: (id: string): string => `custom-${id}`,
      };
      const persistentState: PersistentState<StateTree> =
        PersistentStateBuilder.fromOptions(piniaStore, options);
      expect(persistentState).toBeDefined();
      expect(persistentState['storage']).toBe(localStorage);
    });

    it('should create PersistentState with HtmlSanitizer when called with any options', () => {
      const options: LocalPersistentStateOptions<StateTree> = {};
      PersistentStateBuilder.fromOptions(piniaStore, options);
      expect(HtmlSanitizer).toHaveBeenCalled();
    });
  });
});

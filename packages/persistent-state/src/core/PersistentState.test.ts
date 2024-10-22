import type { StateTree } from 'pinia';
import { PersistentState } from 'src/core/PersistentState';
import type { DeepPartial } from 'src/types';
import { StorageStub } from 'test/stubs/StorageStub';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('PersistentState', () => {
  const id: string = 'id';
  const state: StateTree = { a: 1, b: { c: 2 }, d: 3 };
  let persistentState: PersistentState<StateTree>;

  beforeEach(() => {
    vi.stubGlobal('localStorage', new StorageStub());
    vi.stubGlobal('sessionStorage', new StorageStub());
  });

  describe('save()', () => {
    describe('with default constructor options', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id);
      });

      describe('when called with a state', () => {
        it('should save the state to storage under the default key', () => {
          persistentState.save(state);
          expect(localStorage.getItem(id)).toEqual(JSON.stringify(state));
        });
      });

      describe('when called with a state containing strings that need sanitization', () => {
        it('should sanitize string values before saving', () => {
          persistentState.save({
            ...state,
            e: '<script>alert("xss")</script>',
          });
          expect(localStorage.getItem(id)).toEqual(
            JSON.stringify({
              ...state,
              e: '&lt;script&gt;alert("xss")&lt;/script&gt;',
            }),
          );
        });
      });
    });

    describe('with custom key option', () => {
      const customKey: string = `custom-${id}`;

      beforeEach(() => {
        persistentState = new PersistentState(id, {
          key: (id: string): string => `custom-${id}`,
        });
      });

      describe('when called with a state', () => {
        it('should save the state under the custom key', () => {
          persistentState.save(state);
          expect(localStorage.getItem(customKey)).toEqual(
            JSON.stringify(state),
          );
        });
      });
    });

    describe('with custom storage option', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          storage: sessionStorage,
        });
      });

      describe('when called with a state', () => {
        it('should save the state to the custom storage', () => {
          persistentState.save(state);
          expect(sessionStorage.getItem(id)).toEqual(JSON.stringify(state));
          expect(localStorage.getItem(id)).toBeNull();
        });
      });
    });

    describe('with pickPaths option', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          pickPaths: ['a', 'b.c'],
        });
      });

      describe('when called with a state', () => {
        it('should save only the specified paths', () => {
          persistentState.save(state);
          expect(localStorage.getItem(id)).toEqual(
            JSON.stringify({ a: 1, b: { c: 2 } }),
          );
        });
      });
    });

    describe('with omitPaths option', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          omitPaths: ['b.c'],
        });
      });

      describe('when called with a state', () => {
        it('should omit the specified paths from the saved state', () => {
          persistentState.save(state);
          expect(localStorage.getItem(id)).toEqual(
            JSON.stringify({ a: 1, b: {}, d: 3 }),
          );
        });
      });
    });

    describe('with custom sanitize function', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          sanitize: (state: DeepPartial<StateTree>): DeepPartial<StateTree> => {
            const sanitizedState: DeepPartial<StateTree> = { ...state };

            if (sanitizedState.d) {
              sanitizedState.d = 'sanitized';
            }

            return sanitizedState;
          },
        });
      });

      describe('when called with a state containing unsanitized data', () => {
        it('should sanitize the state before saving', () => {
          persistentState.save(state);
          expect(localStorage.getItem(id)).toEqual(
            JSON.stringify({
              ...state,
              d: 'sanitized',
            }),
          );
        });
      });
    });

    describe('with custom serialize function', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          serialize: (state: DeepPartial<StateTree>): string =>
            'serialized state',
        });
      });

      describe('when called with a state', () => {
        it('should use the custom serialize function to save the state', () => {
          persistentState.save(state);
          expect(localStorage.getItem(id)).toEqual('serialized state');
        });
      });
    });
  });

  describe('load()', () => {
    describe('with default constructor options', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id);
      });

      describe('when state exists in storage', () => {
        beforeEach(() => {
          localStorage.setItem(id, JSON.stringify(state));
        });

        it('should load and return the state from storage', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toEqual(state);
        });
      });

      describe('when state does not exist in storage', () => {
        it('should return null', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toBeNull();
        });
      });

      describe('when state contains strings that need sanitization', () => {
        beforeEach(() => {
          localStorage.setItem(
            id,
            JSON.stringify({
              ...state,
              e: '<script>alert("xss")</script>',
            }),
          );
        });

        it('should sanitize string values after loading', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toEqual({
            ...state,
            e: '&lt;script&gt;alert("xss")&lt;/script&gt;',
          });
        });
      });
    });

    describe('with custom key option', () => {
      const customKey: string = `custom-${id}`;

      beforeEach(() => {
        persistentState = new PersistentState(id, {
          key: (id: string): string => `custom-${id}`,
        });
        localStorage.setItem(customKey, JSON.stringify(state));
      });

      describe('when state exists under custom key', () => {
        it('should load the state using the custom key', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toEqual(state);
        });
      });
    });

    describe('with custom storage option', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          storage: sessionStorage,
        });
        sessionStorage.setItem(id, JSON.stringify(state));
      });

      describe('when state exists in custom storage', () => {
        it('should load the state from the custom storage', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toEqual(state);
        });
      });
    });

    describe('with pickPaths option', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          pickPaths: ['a', 'b.c'],
        });
        localStorage.setItem(id, JSON.stringify(state));
      });

      describe('when state exists in storage', () => {
        it('should load only the specified paths', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toEqual({ a: 1, b: { c: 2 } });
        });
      });
    });

    describe('with omitPaths option', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          omitPaths: ['b.c'],
        });
        localStorage.setItem(id, JSON.stringify(state));
      });

      describe('when state exists in storage', () => {
        it('should omit the specified paths from the loaded state', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toEqual({ a: 1, b: {}, d: state.d });
        });
      });
    });

    describe('with custom sanitize function', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          sanitize: (state) => {
            const sanitizedState: StateTree = { ...state };

            if (sanitizedState.d) {
              sanitizedState.d = 'sanitized';
            }

            return sanitizedState;
          },
        });
        localStorage.setItem(id, JSON.stringify(state));
      });

      describe('when state contains unsanitized data', () => {
        it('should sanitize the state after loading', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toEqual({
            ...state,
            d: 'sanitized',
          });
        });
      });
    });

    describe('with custom deserialize function', () => {
      beforeEach(() => {
        persistentState = new PersistentState(id, {
          deserialize: () => ({ deserialized: true }),
        });
        localStorage.setItem(id, 'any serialized data');
      });

      describe('when state exists in storage', () => {
        it('should use the custom deserialize function to load the state', () => {
          const loadedState: DeepPartial<StateTree> | null =
            persistentState.load();
          expect(loadedState).toEqual({ deserialized: true });
        });
      });
    });
  });
});

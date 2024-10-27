import type { StateTree } from 'pinia';
import type { DeepPartial } from 'src/types';

export interface Merger<T extends StateTree> {
  merge<S extends T | DeepPartial<T>>(oldState: S, newState: S): S;
}

export class OverwriteMerger<T extends StateTree> implements Merger<T> {
  public merge<S extends T | DeepPartial<T>>(oldState: S, newState: S): S {
    return newState;
  }
}

export class ShallowMerger<T extends StateTree> implements Merger<T> {
  public merge<S extends T | DeepPartial<T>>(oldState: S, newState: S): S {
    return {
      ...oldState,
      ...newState,
    };
  }
}

export class DeepMerger<T extends StateTree> implements Merger<T> {
  public merge<S extends T | DeepPartial<T>>(oldState: S, newState: S): S {
    if (!this.isObject(oldState) || !this.isObject(newState)) {
      return newState;
    }

    const result: S = { ...oldState };

    for (const key in newState) {
      if (Object.prototype.hasOwnProperty.call(newState, key)) {
        const oldValue = oldState[key];
        const newValue = newState[key];

        result[key] =
          this.isObject(oldValue) && this.isObject(newValue)
            ? this.merge(oldValue, newValue)
            : (newValue ?? oldValue);
      }
    }

    return result;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

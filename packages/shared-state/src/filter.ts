import type { StateTree } from 'pinia';
import type { DeepPartial } from 'src/types';

export interface Filter<T extends StateTree> {
  filter(state: T): T | DeepPartial<T>;
}

export class PathFilter<T extends StateTree> implements Filter<T> {
  constructor(
    private readonly pickPaths: string[] = [],
    private readonly omitPaths: string[] = [],
  ) {}

  public filter(state: T): T | DeepPartial<T> {
    if (!this.pickPaths.length && !this.omitPaths.length) {
      return state;
    }

    let result: DeepPartial<T> = state as DeepPartial<T>;

    if (this.pickPaths.length) {
      result = this.pickByPaths(result);
    }

    if (this.omitPaths.length) {
      result = this.omitByPaths(result);
    }

    return result;
  }

  private pickByPaths(state: T | DeepPartial<T>): DeepPartial<T> {
    const result: DeepPartial<T> = {} as DeepPartial<T>;

    for (const path of this.pickPaths) {
      const keys: string[] = path.split('.');
      let value: unknown = state;
      let current: Record<string, unknown> = result;

      for (const [index, key] of keys.entries()) {
        if (value && typeof value === 'object' && key in value) {
          value = (value as Record<string, unknown>)[key];

          if (index === keys.length - 1) {
            current[key] = value;
          } else {
            current[key] = current[key] || {};
            current = current[key] as Record<string, unknown>;
          }
        } else {
          break;
        }
      }
    }

    return result;
  }

  private omitByPaths(state: T | DeepPartial<T>): DeepPartial<T> {
    const result: DeepPartial<T> = JSON.parse(
      JSON.stringify(state),
    ) as DeepPartial<T>;

    for (const path of this.omitPaths) {
      const keys: string[] = path.split('.');
      let current: Record<string, unknown> = result;

      for (const [index, key] of keys.entries()) {
        if (current && typeof current === 'object' && key in current) {
          if (index === keys.length - 1) {
            delete current[key];
          } else {
            current = current[key] as Record<string, unknown>;
          }
        } else {
          break;
        }
      }
    }

    return result;
  }
}

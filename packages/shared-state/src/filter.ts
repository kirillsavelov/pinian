import type { StateTree } from 'pinia';
import type { DeepPartial } from 'src/types';

export interface Filter<T extends StateTree> {
  filter(state: T): T | DeepPartial<T>;
}

export class PathFilter<T extends StateTree> implements Filter<T> {
  private readonly pickedPaths: Set<string>;
  private readonly omittedPaths: Set<string>;

  constructor(pickPaths: string[] = [], omitPaths: string[] = []) {
    this.pickedPaths = new Set(pickPaths);
    this.omittedPaths = new Set(omitPaths);
  }

  public filter(state: T): T | DeepPartial<T> {
    if (!this.pickedPaths.size && !this.omittedPaths.size) {
      return state;
    }

    const picked: T | DeepPartial<T> = this.pickedPaths.size
      ? this.pick(state)
      : state;

    return this.omittedPaths.size ? this.omit(picked) : picked;
  }

  private pick(state: T | DeepPartial<T>, parentPath = ''): DeepPartial<T> {
    const result: DeepPartial<T> = {} as DeepPartial<T>;

    for (const [key, value] of Object.entries<unknown>(state)) {
      const currentPath: string = parentPath ? `${parentPath}.${key}` : key;

      if (this.isPickedPath(currentPath)) {
        if (this.isNestedObject(value)) {
          const picked: DeepPartial<StateTree> = this.pick(value, currentPath);

          if (Object.keys(picked).length > 0) {
            result[key as keyof T] = picked as DeepPartial<T>[keyof T];
          }
        } else {
          result[key as keyof T] = value as DeepPartial<T>[keyof T];
        }
      }
    }

    return result;
  }

  private omit(state: T | DeepPartial<T>, parentPath = ''): DeepPartial<T> {
    const result: DeepPartial<T> = {} as DeepPartial<T>;

    for (const [key, value] of Object.entries<unknown>(state)) {
      const currentPath: string = parentPath ? `${parentPath}.${key}` : key;

      if (!this.omittedPaths.has(currentPath)) {
        if (this.isNestedObject(value)) {
          const filtered: DeepPartial<StateTree> = this.omit(
            value,
            currentPath,
          );

          if (Object.keys(filtered).length > 0) {
            result[key as keyof T] = filtered as DeepPartial<T>[keyof T];
          }
        } else {
          result[key as keyof T] = value as DeepPartial<T>[keyof T];
        }
      }
    }

    return result;
  }

  private isPickedPath(path: string): boolean {
    if (this.pickedPaths.has(path)) {
      return true;
    }

    for (const pickedPath of this.pickedPaths) {
      if (
        pickedPath.startsWith(`${path}.`) ||
        path.startsWith(`${pickedPath}.`)
      ) {
        return true;
      }
    }

    return false;
  }

  private isNestedObject(value: unknown): value is StateTree {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

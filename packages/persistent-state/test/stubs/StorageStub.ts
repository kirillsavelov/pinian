import type { KeyValueStorage } from 'src/types';

export class StorageStub implements KeyValueStorage {
  private data: Record<string, string> = {};

  public getItem(key: string): string | null {
    return this.data[key] || null;
  }

  public setItem(key: string, value: string): void {
    this.data[key] = value;
  }
}

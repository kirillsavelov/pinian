import type { StateTree } from 'pinia';
import type { DeepPartial, DeserializeFn, SerializeFn } from 'src/types';

export interface Serializer<T> {
  serialize(state: T | DeepPartial<T>): string;
  deserialize(data: string): T | DeepPartial<T>;
}

export class JsonSerializer<T extends StateTree> implements Serializer<T> {
  constructor(
    private readonly serializeFn: SerializeFn<T> = JSON.stringify,
    private readonly deserializeFn: DeserializeFn<T> = JSON.parse,
  ) {}

  public serialize(state: T | DeepPartial<T>): string {
    return this.serializeFn(state);
  }

  public deserialize(data: string): T | DeepPartial<T> {
    return this.deserializeFn(data);
  }
}

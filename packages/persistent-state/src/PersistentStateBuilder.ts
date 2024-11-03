import type { Store as PiniaStore, StateTree } from 'pinia';
import { PersistentState } from 'src/PersistentState';
import { type Filter, PathFilter } from 'src/filter';
import { HtmlSanitizer, type Sanitizer } from 'src/sanitizer';
import { JsonSerializer, type Serializer } from 'src/serializer';
import { PiniaAdapter, type Store } from 'src/store';
import type {
  DeserializeFn,
  KeyFn,
  KeyValueStorage,
  LocalPersistentStateOptions,
  SerializeFn,
} from 'src/types';

export class PersistentStateBuilder<T extends StateTree> {
  private static readonly DEFAULT_OPTIONS = {
    key: (id: string): string => id,
    storage: localStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    pickPaths: [] as string[],
    omitPaths: [] as string[],
  };

  private store?: Store<T>;
  private key?: string;
  private storage?: KeyValueStorage;
  private serializer?: Serializer<T>;
  private filter?: Filter<T>;
  private sanitizer?: Sanitizer<T>;

  public setStore(store: Store<T>): PersistentStateBuilder<T> {
    this.store = store;

    return this;
  }

  public setKey(
    storeId: string,
    keyFn: KeyFn = PersistentStateBuilder.DEFAULT_OPTIONS.key,
  ): PersistentStateBuilder<T> {
    this.key = keyFn(storeId);

    return this;
  }

  public setStorage(
    storage: KeyValueStorage = PersistentStateBuilder.DEFAULT_OPTIONS.storage,
  ): PersistentStateBuilder<T> {
    this.storage = storage;

    return this;
  }

  public setSerializer(
    serialize: SerializeFn<T> = PersistentStateBuilder.DEFAULT_OPTIONS
      .serialize,
    deserialize: DeserializeFn<T> = PersistentStateBuilder.DEFAULT_OPTIONS
      .deserialize,
  ): PersistentStateBuilder<T> {
    this.serializer = new JsonSerializer(serialize, deserialize);

    return this;
  }

  public setFilter(
    pickPaths: string[] = PersistentStateBuilder.DEFAULT_OPTIONS.pickPaths,
    omitPaths: string[] = PersistentStateBuilder.DEFAULT_OPTIONS.omitPaths,
  ): PersistentStateBuilder<T> {
    this.filter = new PathFilter(pickPaths, omitPaths);

    return this;
  }

  public setSanitizer(): PersistentStateBuilder<T> {
    this.sanitizer = new HtmlSanitizer();

    return this;
  }

  public build(): PersistentState<T> {
    if (
      !this.store ||
      !this.key ||
      !this.storage ||
      !this.serializer ||
      !this.filter ||
      !this.sanitizer
    ) {
      throw new Error('PersistentState is not configured properly');
    }

    return new PersistentState(
      this.store,
      this.key,
      this.storage,
      this.serializer,
      this.filter,
      this.sanitizer,
    );
  }

  public static fromOptions<T extends StateTree>(
    store: PiniaStore,
    options: LocalPersistentStateOptions<T>,
  ): PersistentState<T> {
    return new PersistentStateBuilder<T>()
      .setStore(new PiniaAdapter(store))
      .setKey(store.$id, options.key)
      .setStorage(options.storage)
      .setSerializer(options.serialize, options.deserialize)
      .setFilter(options.pickPaths, options.omitPaths)
      .setSanitizer()
      .build();
  }
}

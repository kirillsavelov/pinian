import type { StateTree } from 'pinia';
import type { Filter } from 'src/filter';
import { Pipeline } from 'src/pipeline';
import type { Sanitizer } from 'src/sanitizer';
import type { Serializer } from 'src/serializer';
import type { Store } from 'src/store';
import type { DeepPartial, KeyValueStorage } from 'src/types';

export class PersistentState<T extends StateTree> {
  private unsubscribe: (() => void) | null = null;

  constructor(
    private readonly store: Store<T>,
    private readonly key: string,
    private readonly storage: KeyValueStorage,
    private readonly serializer: Serializer<T>,
    private readonly filter: Filter<T>,
    private readonly sanitizer: Sanitizer<T>,
  ) {}

  public persist(): void {
    this.hydrate();

    if (!this.unsubscribe) {
      this.subscribe();
    }
  }

  public unpersist(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private hydrate(): void {
    const serializedState: string | null = this.storage.getItem(this.key);

    if (!serializedState) {
      return;
    }

    const state: T | DeepPartial<T> = this.deserialize(serializedState);

    this.store.patchState(state);
  }

  private subscribe(): void {
    this.unsubscribe = this.store.subscribe(() => {
      const state: T = this.store.getState();
      const serializedState: string = this.serialize(state);

      this.storage.setItem(this.key, serializedState);
    });
  }

  private serialize(state: T | DeepPartial<T>): string {
    const pipeline: Pipeline<T | DeepPartial<T>, string> = new Pipeline<
      T | DeepPartial<T>,
      string
    >();

    pipeline
      .addStep((state: T | DeepPartial<T>): T | DeepPartial<T> =>
        this.filter.filter(state),
      )
      .addStep((state: T | DeepPartial<T>): T | DeepPartial<T> =>
        this.sanitizer.sanitize(state),
      )
      .addStep((state: T | DeepPartial<T>): string =>
        this.serializer.serialize(state),
      );

    return pipeline.process(state);
  }

  private deserialize(state: string): T | DeepPartial<T> {
    const pipeline: Pipeline<string, T | DeepPartial<T>> = new Pipeline<
      string,
      T | DeepPartial<T>
    >();

    pipeline
      .addStep((state: string): T | DeepPartial<T> =>
        this.serializer.deserialize(state),
      )
      .addStep((state: T | DeepPartial<T>): T | DeepPartial<T> =>
        this.sanitizer.sanitize(state),
      )
      .addStep((state: T | DeepPartial<T>): T | DeepPartial<T> =>
        this.filter.filter(state),
      );

    return pipeline.process(state);
  }
}

import type { StateTree } from 'pinia';
import { StateProcessor } from 'src/core/StateProcessor';
import type {
  DeepPartial,
  KeyValueStorage,
  PersistentStateOptions,
} from 'src/types';

export class PersistentState<T extends StateTree> {
  private readonly key: string;
  private readonly storage: KeyValueStorage;
  private readonly pickPaths: string[];
  private readonly omitPaths: string[];
  private readonly sanitize: (state: DeepPartial<T>) => DeepPartial<T>;
  private readonly serialize: (state: DeepPartial<T>) => string;
  private readonly deserialize: (state: string) => DeepPartial<T>;

  constructor(
    private readonly id: string,
    options: PersistentStateOptions<T> = {},
  ) {
    this.key = options.key ? options.key(this.id) : this.id;
    this.storage = options.storage || localStorage;
    this.pickPaths = options.pickPaths || [];
    this.omitPaths = options.omitPaths || [];
    this.sanitize =
      options.sanitize ||
      ((state: DeepPartial<T>): DeepPartial<T> =>
        JSON.parse(
          JSON.stringify(state, (key: string, value: any): any => {
            if (typeof value === 'string') {
              const element: HTMLDivElement = document.createElement('div');
              element.textContent = value;

              return element.innerHTML;
            }

            return value;
          }),
        ));
    this.serialize = options.serialize || JSON.stringify;
    this.deserialize = options.deserialize || JSON.parse;
  }

  public save(state: DeepPartial<T>): void {
    const processor: StateProcessor<
      DeepPartial<T>,
      string
    > = new StateProcessor();

    processor
      .addStep(
        (state: DeepPartial<T>): DeepPartial<T> =>
          this.pickPaths.length ? this.pick(state, this.pickPaths) : state,
      )
      .addStep(
        (state: DeepPartial<T>): DeepPartial<T> =>
          this.omitPaths.length ? this.omit(state, this.omitPaths) : state,
      )
      .addStep((state: DeepPartial<T>): DeepPartial<T> => this.sanitize(state))
      .addStep((state: DeepPartial<T>): string => this.serialize(state));

    this.storage.setItem(this.key, processor.process(state));
  }

  public load(): DeepPartial<T> | null {
    const serializedState: string | null = this.storage.getItem(this.key);

    if (!serializedState) {
      return null;
    }

    const processor: StateProcessor<
      string,
      DeepPartial<T>
    > = new StateProcessor();

    processor
      .addStep((state: string): DeepPartial<T> => this.deserialize(state))
      .addStep((state: DeepPartial<T>): DeepPartial<T> => this.sanitize(state))
      .addStep(
        (state: DeepPartial<T>): DeepPartial<T> =>
          this.pickPaths.length ? this.pick(state, this.pickPaths) : state,
      )
      .addStep(
        (state: DeepPartial<T>): DeepPartial<T> =>
          this.omitPaths.length ? this.omit(state, this.omitPaths) : state,
      );

    return processor.process(serializedState);
  }

  private pick(state: DeepPartial<T>, paths: string[]): DeepPartial<T> {
    const result: DeepPartial<T> = {};

    for (const path of paths) {
      const keys: string[] = path.split('.');
      let value: any = JSON.parse(JSON.stringify(state));
      let temp: any = result;

      for (const [index, key] of keys.entries()) {
        if (Object.hasOwn(value, key)) {
          value = value[key];

          if (index === keys.length - 1) {
            temp[key] = value;
          } else {
            temp[key] = temp[key] || {};
            temp = temp[key];
          }
        } else {
          break;
        }
      }
    }

    return result;
  }

  private omit(state: DeepPartial<T>, paths: string[]): DeepPartial<T> {
    const result: DeepPartial<T> = JSON.parse(JSON.stringify(state));

    for (const path of paths) {
      const keys: string[] = path.split('.');
      let temp: any = result;

      for (const [index, key] of keys.entries()) {
        if (Object.hasOwn(temp, key)) {
          if (index === keys.length - 1) {
            delete temp[key];
          } else {
            temp = temp[key];
          }
        }
      }
    }

    return result;
  }
}

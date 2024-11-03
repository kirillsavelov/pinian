import type { StateTree } from 'pinia';
import type { DeepPartial } from 'src/types';

export interface Sanitizer<T> {
  sanitize<S extends T | DeepPartial<T>>(state: S): S;
}

export class HtmlSanitizer<T extends StateTree> implements Sanitizer<T> {
  public sanitize<S extends T | DeepPartial<T>>(state: S): S {
    return JSON.parse(
      JSON.stringify(state, (key: string, value: any): any => {
        if (typeof value === 'string') {
          const element: HTMLDivElement = document.createElement('div');
          element.textContent = value;

          return element.innerHTML;
        }

        return value;
      }),
    );
  }
}

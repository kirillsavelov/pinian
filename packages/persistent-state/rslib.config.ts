import { defineConfig } from '@rslib/core';

const shared = {
  dts: {
    bundle: true,
  },

  /**
   * Using footer because rslib drops 'declare module' during bundling
   */
  footer: {
    dts: `declare module 'pinia' {
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persistentState?:
      | boolean
      | LocalPersistentStateOptions<S>
      | LocalPersistentStateOptions<S>[];
  }
}`,
  },
};

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
    },
    {
      ...shared,
      format: 'cjs',
    },
  ],
});

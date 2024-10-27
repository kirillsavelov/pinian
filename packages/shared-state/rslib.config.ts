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
    sharedState?: boolean | LocalSharedStateOptions<S>;
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

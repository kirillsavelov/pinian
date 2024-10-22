import { defineConfig } from '@rslib/core';

const shared = {
  dts: {
    bundle: true,
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

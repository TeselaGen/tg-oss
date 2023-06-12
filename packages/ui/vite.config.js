/// <reference types="vitest" />
import { defineConfig } from 'vite';
import fs from "node:fs";
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { joinPathFragments } from '@nx/devkit';
import * as esbuild from "esbuild";

const sourceJSPattern = /\/src\/.*\.js$/;
const rollupPlugin = (matchers) => ({
  name: "js-in-jsx",
  load(id) {
    if (matchers.some(matcher => matcher.test(id))) {
      const file = fs.readFileSync(id, { encoding: "utf-8" });
      return esbuild.transformSync(file, { loader: "jsx" });
    }
  }
});

export default defineConfig({
  cacheDir: '../../node_modules/.vite/ui',

  plugins: [
    dts({
      entryRoot: 'src',
      tsConfigFilePath: joinPathFragments(__dirname, 'tsconfig.lib.json'),
      skipDiagnostics: true,
    }),
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],
  esbuild: {
    loader: "jsx",
    include: [sourceJSPattern],
    exclude: [],
    keepNames: true,
    minifyIdentifiers: false,
    minifySyntax: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.js',
      name: 'ui',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      plugins: [
        rollupPlugin([sourceJSPattern])
      ],
      // External packages that should not be bundled into your library.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});



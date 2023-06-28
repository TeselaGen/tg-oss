/// <reference types="vitest" />
import { defineConfig } from 'vite';
import fs from "node:fs";
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { joinPathFragments } from '@nx/devkit';
import * as esbuild from "esbuild";
import vitePluginVirtualHtml from 'vite-plugin-virtual-html';


const sourceJSPattern = [/\/src\/.*\.js$/, /\/demo\/.*\.js$/, /\/helperUtils\/.*\.js$/,];
const rollupPlugin = (matchers: RegExp[]) => ({
  name: "js-in-jsx",
  load(id: string) {
    if (matchers.some(matcher => matcher.test(id))) {
      const file = fs.readFileSync(id, { encoding: "utf-8" });
      return esbuild.transformSync(file, { loader: "jsx" }).code;
    }
    return null;
  }
});

export default ({
  name,
  dir
}: {
  name: string;
  dir: string;
}) => defineConfig(({ command, mode }) => {
  console.log(`mode:`, mode)
  console.log(`command:`, command)
  return {
    cacheDir: `../../node_modules/.vite/${name}`,

    plugins: [
      dts({
        entryRoot: 'src',
        tsConfigFilePath: joinPathFragments(dir, 'tsconfig.json'),
        skipDiagnostics: true,
      }),
      react(),
      viteTsConfigPaths({
        root: '../../',
      }),
      ...mode === 'build' ? [] : [vitePluginVirtualHtml({
        pages: {
          index: {
            entry: './demo/index.js', // MUST
            title: `${name} demo`,// optional, default: ''
            body: '<div id="app"><div id="demo"></div></div>' // optional, default: '<div id="app"></div>'
          }
        },
      })]
    ],
    esbuild: {
      loader: "jsx",
      include: sourceJSPattern,
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
        name,
        fileName: 'index',
        // Change this to the formats you want to support.
        // Don't forgot to update your package.json as well.
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        plugins: [
          rollupPlugin(sourceJSPattern),
        ],
        // External packages that should not be bundled into your library.
        external: ['react', 'react-dom', 'react/jsx-runtime'],
      },
    },
    test: {
      globals: true,
      cache: {
        dir: '../../node_modules/.vitest',
      },
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  }
})




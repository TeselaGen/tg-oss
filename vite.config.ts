import { defineConfig } from "vite";

import viteTsConfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import { joinPathFragments } from "@nx/devkit";
import { camelCase } from "lodash-es";
import { viteStaticCopy } from "vite-plugin-static-copy";

//vite config for simple iso packages

const conf = ({
  name,
  dir,
  testEnvironment
}: {
  testEnvironment?: string;
  name: string;
  dir: string;
}) =>
  defineConfig(({ command }) => ({
    cacheDir: `../../node_modules/.vite/${name}`,
    plugins: [
      dts({
        exclude: ["**/*.test.ts", "**/*.spec.ts"],
        entryRoot: "src",
        tsconfigPath: joinPathFragments(dir, "tsconfig.json")
      }),
      viteTsConfigPaths({
        root: "../../"
      }),
      ...(command === "build"
        ? [
            // noBundlePlugin({ copy: "**/*.css" }),
            viteStaticCopy({
              targets: [
                {
                  src: "./src",
                  dest: "."
                },
                {
                  src: "./README.md",
                  dest: "."
                },
                {
                  src: "./package.json",
                  dest: "."
                }
              ]
            })
          ]
        : [])
    ],
    esbuild: {
      keepNames: true,
      minifyIdentifiers: false,
      minifySyntax: false
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
      minify: false,
      target: "es2015",
      emptyOutDir: true,
      outDir: `../../dist/${name}`,
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: "src/index.js",
        name,
        fileName: "index",
        // Change this to the formats you want to support.
        // Don't forgot to update your package.json as well.
        formats: ["es", "cjs", "umd"]
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [],
        output: {
          name: camelCase(name)
        }
      }
    },
    test: {
      globals: true,
      environment: testEnvironment || "node",
      include: [
        "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
        "test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"
      ]
    }
  }));

export default conf;

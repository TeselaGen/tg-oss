/// <reference types="vitest" />
import { defineConfig } from "vite";
import fs from "node:fs";
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import * as esbuild from "esbuild";
import vitePluginVirtualHtml from "vite-plugin-virtual-html";
import libCss from "vite-plugin-libcss";
import { camelCase } from "lodash";
import { getPort } from "./getPort";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "node:path";
// import million from "million/compiler";
//vite config for react packages

const justSrc = [
  /\/src\/.*\.js$/,
  /\/src\/.*\.jsx$/,
  /\/src\/.*\.ts$/,
  /\/src\/.*\.tsx$/
];
const sourceJSPattern = [
  ...justSrc,
  /\/demo\/.*\.js$/,
  /\/helperUtils\/.*\.js$/
];
const rollupPlugin = (matchers: RegExp[]) => ({
  name: "js-in-jsx",
  load(id: string) {
    if (matchers.some(matcher => matcher.test(id))) {
      const file = fs.readFileSync(id, { encoding: "utf-8" });
      return esbuild.transformSync(file, { loader: "jsx" }).code;
    }
    return undefined;
  }
});

export default ({ name }: { name: string; dir: string }) =>
  defineConfig(({ command, mode = "production" }) => {
    const isDemo = mode === "demo";
    const isUmd = mode === "umd";
    if (!isDemo) {
      mode = "production";
    }
    const port = getPort(name);
    return {
      ...(command === "build"
        ? {
            define: {
              "process.env.NODE_ENV": JSON.stringify("production")
            }
          }
        : {}),
      cacheDir: `../../node_modules/.vite/${name}`,
      server: {
        port
      },
      base: "./",
      plugins: [
        //tnw - maybe add this back later after adding performance metrics https://twitter.com/aidenybai/status/1689773623827943424
        // million.vite({
        //   auto: true
        // }),
        // dts({
        //   entryRoot: 'src',
        //   tsConfigFilePath: joinPathFragments(dir, 'tsconfig.json'),
        //   skipDiagnostics: true,
        // }),
        react(),
        libCss(),
        viteTsConfigPaths({
          root: "../../"
        }),
        ...(command === "build" && !isDemo
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
                  }
                ]
              })
            ]
          : [
              vitePluginVirtualHtml({
                pages: {
                  index: {
                    entry: "./demo/index.js", // MUST
                    title: `${name} demo`, // optional, default: ''
                    body: `
            <div id="app"><div id="demo"></div></div>
            ` // optional, default: '<div id="app"></div>'
                  }
                }
              })
            ])
      ],
      esbuild: {
        loader: "jsx",
        include: sourceJSPattern,
        exclude: [],
        keepNames: true,
        minifyIdentifiers: false,
        minifySyntax: false
      },
      optimizeDeps: {
        esbuildOptions: {
          loader: {
            ".js": "jsx",
            ".ts": "tsx"
          }
        }
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
        outDir: `../../${isDemo ? "demo-dist" : "dist"}/${name}`,
        ...(isDemo
          ? {}
          : {
              lib: {
                // Could also be a dictionary or array of multiple entry points.
                entry: "src/index.js",
                name,
                fileName: format => `index.${format}.js`,
                formats: isUmd ? ["umd"] : ["es", "cjs"]
                // Change this to the formats you want to support.
                // Don't forgot to update your package.json as well.
              }
            }),
        rollupOptions: {
          plugins: [rollupPlugin(justSrc)],
          output: {
            name: camelCase(name)
          },
          // External packages that should not be bundled into your library.
          external:
            mode === "demo" || isUmd
              ? []
              : [
                  "react",
                  "react-dom",
                  "react/jsx-runtime",
                  "redux",
                  "react-redux",
                  "redux-form",
                  "@blueprintjs/core",
                  "@blueprintjs/select",
                  "@blueprintjs/datetime"
                ]
        }
      },
      resolve: {
        alias: {
          react: path.join(__dirname, "node_modules/react"),
          "@blueprintjs/core": path.join(
            __dirname,
            "node_modules/@blueprintjs/core"
          ),
          "@blueprintjs/datetime": path.join(
            __dirname,
            "node_modules/@blueprintjs/datetime"
          ),

          // "@teselagen/react-table/react-table.css": `/Users/tnrich/Sites/react-table/react-table.css`,
          // "@teselagen/react-table": `/Users/tnrich/Sites/react-table/src`,
          "react-dom": path.join(__dirname, "node_modules/react-dom"),
          "react-redux": path.join(__dirname, "node_modules/react-redux"),
          "redux-form": path.join(__dirname, "node_modules/redux-form"),
          redux: path.join(__dirname, "node_modules/redux")
          // "@teselagen/range-utils": path.resolve(__dirname, "../tg-oss/packages/range-utils/src"),
          // "@teselagen/sequence-utils": path.resolve(__dirname, "../tg-oss/packages/sequence-utils/src"),
          // "@teselagen/bio-parsers": path.resolve(__dirname, "../tg-oss/packages/bio-parsers/src"),
        }
      },
      test: {
        globals: true,
        cache: {
          dir: "../../node_modules/.vitest"
        },
        setupFiles: ["../../vitest.setup.ts"],
        environment: "jsdom",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
      }
    };
  });

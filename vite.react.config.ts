import { defineConfig } from "vite";
import fs from "node:fs";
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import * as esbuild from "esbuild";
import libCss from "vite-plugin-libcss";
import { camelCase } from "lodash-es";
import { getPort } from "./getPort";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "node:path";
import dts from "vite-plugin-dts";
import { joinPathFragments } from "nx/src/devkit-exports";

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

export default ({ name, dir }: { name: string; dir: string }) =>
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
        dts({
          exclude: ["**/*.test.ts", "**/*.spec.ts"],
          entryRoot: "src",
          tsconfigPath: joinPathFragments(dir, "tsconfig.json")
          // skipDiagnostics: true,
        }),
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
        }
      }
    };
  });

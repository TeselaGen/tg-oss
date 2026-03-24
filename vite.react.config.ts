import { defineConfig } from "vite";
import fs from "node:fs";
import react from "@vitejs/plugin-react";
import * as esbuild from "esbuild";
import libCss from "vite-plugin-libcss";
import { getPort } from "./getPort";
import { viteStaticCopy } from "vite-plugin-static-copy";
import dts from "vite-plugin-dts";
import { joinPathFragments } from "nx/src/devkit-exports";

const camelCase = (str: string) =>
  str.replace(/[-_ .]([a-z0-9])/gi, (_, letter) => letter.toUpperCase());

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
        react({
          jsxRuntime: "automatic"
        }),
        libCss(),
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
          : []),
        {
          name: "transform-js-files-as-jsx",
          enforce: "pre",
          transform(code, id) {
            const cleanId = id.split("?")[0].split("#")[0];
            if (
              sourceJSPattern.some(matcher => matcher.test(cleanId)) &&
              !cleanId.includes("node_modules")
            ) {
              let transformed = esbuild.transformSync(code, {
                loader: "jsx",
                sourcefile: cleanId
              }).code;
              // Build-level interop for badly published CJS libraries breaking under Vite 8 / Native ESM
              transformed = transformed.replace(
                /import\s+(\w+)\s+from\s+['"]node-interval-tree['"]/g,
                'import _$1 from "node-interval-tree";\nconst $1 = _$1.default || _$1;'
              );
              transformed = transformed.replace(
                /import\s+(\w+)\s+from\s+['"]react-draggable['"]/g,
                'import _$1 from "react-draggable";\nconst $1 = _$1.default || _$1;'
              );
              transformed = transformed.replace(
                /import\s+(\w+)\s+from\s+['"]@teselagen\/react-list['"]/g,
                'import _$1 from "@teselagen/react-list";\nconst $1 = _$1.default || _$1;'
              );
              return transformed;
            }
            return null;
          }
        },
        {
          name: "resolve-buffer",
          enforce: "pre",
          resolveId(this: any, id: string) {
            if (id === "buffer") {
              return this.resolve("buffer/", undefined, { skipSelf: true });
            }
          }
        } as any
      ],
      optimizeDeps: {
        rolldownOptions: {
          plugins: [
            {
              name: "load-js-files-as-jsx",
              load(id: string) {
                if (id.includes("node_modules")) return undefined;
                if (sourceJSPattern.some(matcher => matcher.test(id))) {
                  const file = fs.readFileSync(id, "utf-8");
                  return esbuild.transformSync(file, {
                    loader: "jsx",
                    sourcefile: id
                  }).code;
                }
                return undefined;
              }
            }
          ]
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
                  "@blueprintjs/datetime",
                  "buffer",
                  "string_decoder"
                ]
        }
      },
      resolve: {
        alias: {
          string_decoder: "string_decoder/",
          buffer: "buffer/"
        },
        tsconfigPaths: true
      }
    };
  });

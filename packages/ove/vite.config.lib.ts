/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import libCss from "vite-plugin-libcss";
import viteTsConfigPaths from "vite-tsconfig-paths";

import packageJson from "../../package.json";

const justSrc = [
  /\/src\/.*\.js$/,
  /\/src\/.*\.jsx$/,
  /\/src\/.*\.ts$/,
  /\/src\/.*\.tsx$/
];

const dependencyKeys = Object.keys(packageJson.dependencies).filter(
  (item) => item !== "node-interval-tree"
);

export default defineConfig({
  cacheDir: "./node_modules/.vite/ove",

  plugins: [
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    libCss(),
    viteTsConfigPaths({
      root: "../../"
    })
  ],
  esbuild: {
    loader: "jsx",
    include: justSrc,
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
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: "src/index.js",
      name: "ove",
      fileName: "index"
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
    },
    cssCodeSplit: true,
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: dependencyKeys,
      output: [
        {
          name: "ove",
          format: "cjs",
          dir: "./dist/lib/cjs/"
        },
        {
          name: "ove",
          format: "es",
          dir: "./dist/lib/es/"
        }
      ]
    }
  }
});

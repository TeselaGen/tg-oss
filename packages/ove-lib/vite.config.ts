/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

const justSrc = [
  /\/src\/.*\.js$/,
  /\/src\/.*\.jsx$/,
  /\/src\/.*\.ts$/,
  /\/src\/.*\.tsx$/
];

export default defineConfig({
  cacheDir: "../../node_modules/.vite/ove-lib",

  plugins: [
    react(),
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
      name: "ove-lib",
      fileName: "index",
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ["react", "react-dom", "react/jsx-runtime"]
    }
  }
});

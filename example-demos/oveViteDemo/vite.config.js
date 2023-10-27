/// <reference types="vitest" />
import react from "@vitejs/plugin-react";

export default {
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx"
      }
    }
  },
  // tnw trying to fix this issue by using an init global polyfill https://stackoverflow.com/a/73208485/2178112
  // instead of using the below code since it caused other issues: https://github.com/TeselaGen/tg-oss/issues/42
  // define: {
  //   // By default, Vite doesn't include shims for NodeJS/
  //   // necessary for segment analytics lib to work
  //   global: {}
  // },
  test: {
    environment: "jsdom",
    globals: true
  }
};

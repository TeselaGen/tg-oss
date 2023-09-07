// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import viteReactConfig from "../../vite.react.config";

export default viteReactConfig({
  name: "tauri-ove",
  dir: __dirname,
  // plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true
  },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"]
})({
  command: "build",
  mode: "demo"
});

import vitePluginVirtualHtml from "vite-plugin-virtual-html";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vitePluginVirtualHtml({
      pages: {
        index: {
          entry: "./index.js", // MUST
          title: `demo`, // optional, default: ''
          body: `
              <h1>Hello, World!</h1>
              <p id="status">zebra printer not ready</p>
              <button disabled id="print">Print Example Zpl</button>
            `
        }
      }
    })
  ]
});

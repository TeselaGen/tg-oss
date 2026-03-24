import react from "@vitejs/plugin-react";
import fs from "fs";
import * as esbuild from "esbuild";

export default {
  plugins: [react()],
  optimizeDeps: {
    rolldownOptions: {
      plugins: [
        {
          name: "load-js-files-as-jsx",
          load(id) {
            if (id.endsWith(".js") && !id.includes("node_modules")) {
              const file = fs.readFileSync(id, "utf-8");
              return esbuild.transformSync(file, { loader: "jsx" }).code;
            }
          }
        }
      ]
    }
  }
};

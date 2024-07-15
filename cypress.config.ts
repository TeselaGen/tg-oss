import { defineConfig } from "cypress";
import { getPort } from "./getPort";
// import vitePreprocessor from "cypress-vite";
// import path from "path";

export default ({
  name = "pass_the_package_name_here",
  projectId = "pass_a_cypress_project_id_here"
}) =>
  defineConfig({
    projectId,
    viewportHeight: 800,
    viewportWidth: 1280,
    video: false,
    pageLoadTimeout: 40000,
    e2e: {
      retries: {
        runMode: 3,
        openMode: 0
      },
      // Allow logging in the Cypress test runner
      // calling cy.task('log', 'message') will log the message to the console
      setupNodeEvents(on, config) {
        on("task", {
          log(message) {
            console.log(message);
            return null;
          }
        });
        // on(
        //   "file:preprocessor",
        //   vitePreprocessor({
        //     // configFile: "./vite.config.js",
        //     configFile: path.resolve(__dirname, "./vite.config.js"),
        //     mode: "development"
        //   })
      },

      //   // return require("./cypress/plugins/index.js")(on, config);
      // },
      supportFile: "cypress/support/index.js",
      // We've imported your old cypress plugins here.
      // You may want to clean this up later by importing these.
      // setupNodeEvents(on, config) {
      //   return require('./cypress/plugins/index.js')(on, config)
      // },
      baseUrl: `http://localhost:${getPort(name)}`,
      specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}"
    }

    // "component": {
    //   "devServer": {
    //     "framework": "react",
    //     "bundler": "webpack"
    //   }
    // }
  });

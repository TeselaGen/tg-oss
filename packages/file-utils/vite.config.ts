// eslint-disable-next-line @nx/enforce-module-boundaries
import viteConfig from "../../vite.config";
export default viteConfig({
  name: "file-utils",
  dir: __dirname,
  testEnvironment: "jsdom"
});

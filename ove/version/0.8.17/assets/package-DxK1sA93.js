const name = "@teselagen/bounce-loader";
const version = "0.3.15";
const main = "./src/index.js";
const type = "module";
const exports = { ".": { "import": "./index.es.js", "require": "./index.cjs.js" }, "./style.css": "./style.css" };
const dependencies = { "classnames": "^2.3.2", "react": "^18.3.1" };
const _package = {
  name,
  version,
  main,
  type,
  exports,
  dependencies
};
export {
  _package as default,
  dependencies,
  exports,
  main,
  name,
  type,
  version
};

const name = "@teselagen/uploader";
const version = "0.2.0";
const main = "./src/index.js";
const types = "./index.d.ts";
const type = "module";
const exports = {
  ".": {
    "import": "./index.es.js",
    require: "./index.cjs.js"
  }
};
const dependencies = {};
const _package = {
  name,
  version,
  main,
  types,
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
  types,
  version
};

const name = "@teselagen/uploader";
const version = "0.2.0";
const main = "./src/index.js";
const types = "./index.d.ts";
const type = "commonjs";
const exports = {
  ".": {
    "import": "./index.es.js",
    require: "./index.cjs.js"
  }
};
const _package = {
  name,
  version,
  main,
  types,
  type,
  exports
};
export {
  _package as default,
  exports,
  main,
  name,
  type,
  types,
  version
};

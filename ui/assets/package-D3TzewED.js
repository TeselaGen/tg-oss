const name = "@teselagen/ove";
const version = "0.7.20";
const main = "./src/index.js";
const type = "module";
const exports = {
  ".": {
    "import": "./index.es.js",
    require: "./index.cjs.js"
  },
  "./*": "./*"
};
const _package = {
  name,
  version,
  main,
  type,
  exports
};
export {
  _package as default,
  exports,
  main,
  name,
  type,
  version
};

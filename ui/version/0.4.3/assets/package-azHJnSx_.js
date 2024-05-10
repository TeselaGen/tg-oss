const name = "@teselagen/ove";
const version = "0.5.3";
const main = "./src/index.js";
const exports = {
  ".": {
    "import": "./index.es.js",
    require: "./index.cjs.js"
  },
  "./style.css": "./style.css"
};
const _package = {
  name,
  version,
  main,
  exports
};
export {
  _package as default,
  exports,
  main,
  name,
  version
};

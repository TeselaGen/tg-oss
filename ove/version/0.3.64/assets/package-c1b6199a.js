const name = "@teselagen/bounce-loader";
const version = "0.3.11";
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

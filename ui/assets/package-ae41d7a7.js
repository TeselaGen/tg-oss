const name = "@teselagen/ove";
const version = "0.3.52";
const main = "./src/index.js";
const exports = {
  ".": {
    "import": "./index.es.js",
    require: "./index.cjs.js"
  },
  "./style.css": "./style.css"
};
const volta = {
  node: "16.20.2"
};
const _package = {
  name,
  version,
  main,
  exports,
  volta
};
export {
  _package as default,
  exports,
  main,
  name,
  version,
  volta
};

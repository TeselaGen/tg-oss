const name = "@teselagen/sequence-utils";
const version = "0.3.42";
const repository = "https://github.com/TeselaGen/tg-oss";
const type = "module";
const dependencies = { "escape-string-regexp": "5.0.0", "jsondiffpatch": "0.7.3", "string-splice": "^1.3.0", "lodash-es": "^4.17.21", "shortid": "2.2.16", "@teselagen/range-utils": "file:../range-utils" };
const exports = { ".": { "import": "./index.js", "require": "./index.cjs" } };
const _package = {
  name,
  version,
  repository,
  type,
  dependencies,
  exports
};
export {
  _package as default,
  dependencies,
  exports,
  name,
  repository,
  type,
  version
};

const name = "@teselagen/bio-parsers";
const version = "0.4.27";
const type = "module";
const dependencies = { "@gmod/gff": "^1.2.1", "buffer": "5.7.1", "bufferpack": "^0.0.6", "color": "3.2.1", "fast-xml-parser": "^4.2.5", "fflate": "^0.8.0", "lodash-es": "^4.17.21", "string_decoder": "^1.3.0", "validate.io-nonnegative-integer-array": "^1.0.1", "@teselagen/sequence-utils": "file:../sequence-utils", "@teselagen/range-utils": "file:../range-utils" };
const exports = { ".": { "import": "./index.js", "require": "./index.cjs" } };
const _package = {
  name,
  version,
  type,
  dependencies,
  exports
};
export {
  _package as default,
  dependencies,
  exports,
  name,
  type,
  version
};

const name = "@teselagen/file-utils";
const version = "0.3.15";
const type = "commonjs";
const dependencies = {
  bluebird: "^3.7.2",
  jszip: "^3.10.1",
  lodash: "^4.17.21",
  papaparse: "^5.4.1"
};
const devDependencies = {
  "mock-fs": "^5.2.0"
};
const _package = {
  name,
  version,
  type,
  dependencies,
  devDependencies
};
export {
  _package as default,
  dependencies,
  devDependencies,
  name,
  type,
  version
};

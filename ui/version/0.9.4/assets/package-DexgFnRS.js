const name = "@teselagen/ui";
const version = "0.9.4";
const main = "./src/index.js";
const type = "module";
const exports = { ".": { "import": "./index.es.js", "require": "./index.cjs.js" }, "./style.css": "./style.css" };
const devDependencies = {};
const dependencies = { "@blueprintjs/core": "3.54.0", "@blueprintjs/datetime": "^3.24.1", "@blueprintjs/select": "3.18.11", "@dnd-kit/core": "^6.1.0", "@dnd-kit/modifiers": "^7.0.0", "@dnd-kit/sortable": "^8.0.0", "@teselagen/react-table": "6.10.18", "chance": "1.1.11", "classnames": "^2.3.2", "color": "^3.2.1", "copy-to-clipboard": "^3.3.1", "dayjs": "^1.10.4", "dom-scroll-into-view": "^2.0.1", "downloadjs": "^1.4.7", "fuse.js": "^6.6.2", "fuzzysearch": "^1.0.3", "immer": "^9.0.15", "lodash-es": "^4.17.21", "math-expression-evaluator": "^1.3.7", "mobx": "^6.10.2", "nanoid": "^4.0.0", "papaparse": "5.3.2", "qs": "^6.9.6", "react": "^18.3.1", "react-color": "^2.19.3", "react-dom": "^18.3.1", "react-dropzone": "^11.4.2", "react-markdown": "9.0.1", "react-redux": "^8.0.5", "react-rnd": "^10.2.4", "react-router-dom": "5", "react-transition-group": "^2.4.0", "recompose": "npm:react-recompose@0.31.1", "redux": "^4.1.2", "redux-form": "^8.3.10", "redux-thunk": "2.4.1", "remark-gfm": "^4.0.0", "tippy.js": "^6.3.7", "url-join": "^4.0.1", "use-deep-compare-effect": "^1.6.1", "write-excel-file": "^1.4.25", "@dnd-kit/utilities": "3.2.2", "@teselagen/file-utils": "file:../file-utils", "@blueprintjs/icons": "3.33.0" };
const _package = {
  name,
  version,
  main,
  type,
  exports,
  devDependencies,
  dependencies
};
export {
  _package as default,
  dependencies,
  devDependencies,
  exports,
  main,
  name,
  type,
  version
};

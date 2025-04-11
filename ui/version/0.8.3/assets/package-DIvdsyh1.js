const name = "@teselagen/ove";
const version = "0.7.27";
const main = "./src/index.js";
const type = "module";
const exports = { ".": { "import": "./index.es.js", "require": "./index.cjs.js" }, "./*": "./*" };
const dependencies = { "@teselagen/sequence-utils": "file:../sequence-utils", "@teselagen/range-utils": "file:../range-utils", "@teselagen/ui": "file:../ui", "@teselagen/file-utils": "file:../file-utils", "@teselagen/bio-parsers": "file:../bio-parsers", "@blueprintjs/core": "3.54.0", "@hello-pangea/dnd": "16.2.0", "@risingstack/react-easy-state": "^6.3.0", "@teselagen/react-list": "0.8.18", "classnames": "^2.3.2", "color": "^3.2.1", "combokeys": "^3.0.1", "copy-to-clipboard": "^3.3.1", "deep-equal": "^1.1.1", "dom-to-image": "^2.6.0", "downloadjs": "^1.4.7", "file-saver": "^2.0.5", "html2canvas": "^1.4.1", "immer": "^9.0.15", "is-mobile": "^3.0.0", "lodash": "4.17.21", "lodash-es": "^4.17.21", "node-interval-tree": "^1.3.3", "papaparse": "5.3.2", "paths-js": "^0.4.11", "pluralize": "^7.0.0", "popper.js": "^1.16.1", "prop-types": "^15.6.2", "react": "^18.3.1", "react-dom": "^18.3.1", "react-draggable": "4.4.5", "react-dropzone": "^11.4.2", "react-markdown": "9.0.1", "react-measure": "^2.5.2", "react-redux": "^8.0.5", "react-sizeme": "^2.6.12", "recompose": "npm:react-recompose@0.31.1", "redux": "^4.1.2", "redux-act": "^1.8.0", "redux-form": "^8.3.10", "redux-thunk": "2.4.1", "remark-gfm": "^4.0.0", "reselect": "^4.1.7", "tg-use-local-storage-state": "^16.0.3", "to-regex-range": "5.0.1", "use-debounce": "^8.0.4", "validate.io-nonnegative-integer-array": "^1.0.1", "cypress-real-events": "^1.13.0", "biomsa": "^0.2.4", "shortid": "2.2.16", "@use-gesture/react": "10.3.0", "vite": "^5.2.11", "@vitejs/plugin-react": "^4.3.0", "vite-plugin-libcss": "^1.1.1", "vite-tsconfig-paths": "^4.3.2", "@playwright/test": "^1.44.1" };
const _package = {
  name,
  version,
  main,
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
  version
};

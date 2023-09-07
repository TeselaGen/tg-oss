//optionally connect to the redux store
import {
  legacy_createStore as createStore,
  combineReducers,
  applyMiddleware,
  compose
} from "redux";
import thunk from "redux-thunk";
import { reducer as form } from "redux-form";
import { vectorEditorMiddleware, vectorEditorReducer } from "@teselagen/ove";

const composeEnhancer =
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      actionsDenylist: ["HOVEREDANNOTATIONUPDATE", "HOVEREDANNOTATIONCLEAR"],
      // actionSanitizer,
      latency: 1000,
      name: "openVE"
    })) ||
  compose;

const store = createStore(
  combineReducers({
    form,
    VectorEditor: vectorEditorReducer()
  }),
  undefined,
  composeEnhancer(
    applyMiddleware(thunk, vectorEditorMiddleware) //your store should be redux-thunk connected for the VectorEditor component to work
  )
);

export default store;

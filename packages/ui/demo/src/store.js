import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { tg_modalState } from "../../src";
import { reducer as form } from "redux-form";
import thunk from "redux-thunk";

const composeEnhancer =
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      actionsBlacklist: []
    })) ||
  compose;

const store = createStore(
  combineReducers({
    form,
    tg_modalState
  }),
  undefined,
  composeEnhancer(applyMiddleware(thunk))
);

export default store;

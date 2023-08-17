//./caretPosition.js
import { createReducer } from "redux-act";
import createAction from "./utils/createMetaAction";
import { noop } from "lodash";

// ------------------------------------
// Actions
// ------------------------------------
export const toggleViewVersionHistory = createAction(
  "TOGGLE_VIEW_VERSION_HISTORY",
  noop
); //NOTE!!:: second argument sanitizes actions so no payload is passed

// ------------------------------------
// Reducer
// ------------------------------------
export default createReducer(
  {
    [toggleViewVersionHistory]: (state) => {
      return { viewVersionHistory: !state.viewVersionHistory };
    }
  },
  {
    viewVersionHistory: false
  }
);

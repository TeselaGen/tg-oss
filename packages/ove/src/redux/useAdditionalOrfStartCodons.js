//./caretPosition.js
import { createReducer } from "redux-act";
import createAction from "./utils/createMetaAction";
import { noop } from "lodash-es";

// ------------------------------------
// Actions
// ------------------------------------
export const useAdditionalOrfStartCodonsToggle = createAction(
  "useAdditionalOrfStartCodonsToggle",
  noop
);

// ------------------------------------
// Reducer
// ------------------------------------
export default createReducer(
  {
    [useAdditionalOrfStartCodonsToggle]: state => {
      return !state;
    }
  },
  false
);

import createAction from "./utils/createMetaAction";
import createMergedDefaultStateReducer from "./utils/createMergedDefaultStateReducer";

export const updateTemporaryAnnotations = createAction(
  "TEMPORARY_ANNOTATIONS_UPDATE"
);

export default createMergedDefaultStateReducer(
  {
    TEMPORARY_ANNOTATIONS_UPDATE: (state, payload) => {
      return { ...state, ...payload };
    },
    VECTOR_EDITOR_UPDATE: (state, payload) => {
      return { ...state, ...payload.temporaryAnnotations };
    }
  },
  {
    features: {},
    primers: {},
    parts: {}
  }
);

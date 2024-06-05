import { formValueSelector } from "redux-form";
import { reduce } from "lodash-es";
import { connect } from "react-redux";
/**
 * @param {*string} formName
 * @param {*string} formName
 * @param {*string} formName
 * @param {*string} ...etc
 * adds a new prop `${formName}SelectedEntities` eg sequenceTableSelectedEntities
 */
export default function withSelectedEntities(...formNames) {
  if (!formNames.length) {
    throw new Error(
      "You need to pass at least one arg to withSelectedEntities"
    );
  }
  if (typeof formNames[0] === "string") {
    //NEW WAY
    return connect(state => {
      return formNames.reduce((acc, formName) => {
        acc[formName + "SelectedEntities"] = getRecordsFromReduxForm(
          state,
          formName
        );
        return acc;
      }, {});
    });
  } else {
    //OLD WAY:
    const { formName, name } = formNames[0];
    if (!formName) {
      throw new Error(
        "Please pass a {formName} option when using withSelectedEntities"
      );
    }
    return connect(state => {
      return {
        [name || "selectedEntities"]: getRecordsFromReduxForm(state, formName)
      };
    });
  }
}

export function getRecordsFromReduxForm(state, formName) {
  const selector = formValueSelector(formName);
  return getRecordsFromIdMap(selector(state, "reduxFormSelectedEntityIdMap"));
}

export function getRecordsFromIdMap(idMap = {}) {
  return reduce(
    idMap,
    (acc, item) => {
      if (item && item.entity) acc.push(item);
      return acc;
    },
    []
  )
    .sort((a, b) => a.rowIndex - b.rowIndex)
    .map(item => item.entity);
}

export function getSelectedEntities(storeOrState, formName) {
  const state = storeOrState.getState ? storeOrState.getState() : storeOrState;
  return getRecordsFromReduxForm(state, formName);
}

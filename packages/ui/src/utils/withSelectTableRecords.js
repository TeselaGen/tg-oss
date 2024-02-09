/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import { compose, withHandlers } from "recompose";
import { connect } from "react-redux";
import { change, initialize } from "redux-form";

export default function (_tableFormName, propName = "selectTableRecords") {
  return compose(
    connect(null, {
      changeFormValue: change,
      initializeForm: initialize
    }),
    withHandlers({
      [propName]:
        props =>
        (_records = []) => {
          let tableFormName = _tableFormName;
          if (typeof _tableFormName === "function") {
            tableFormName = _tableFormName(props);
          }
          // initialize if needed so that the values will stay
          props.initializeForm(tableFormName, {}, true, {
            keepDirty: true,
            updateUnregisteredFields: true,
            keepValues: true
          });
          const selectedEntityIdMap = {};
          let records = _records;
          if (_records && !Array.isArray(_records)) records = [records];
          records.forEach(record => {
            selectedEntityIdMap[record.id] = {
              entity: record,
              time: Date.now()
            };
          });
          props.changeFormValue(
            tableFormName,
            "reduxFormSelectedEntityIdMap",
            selectedEntityIdMap
          );
        }
    })
  );
}

import React, { useCallback, useMemo, useState } from "react";
import { reduxForm } from "redux-form";
import {
  wrapDialog,
  DataTable,
  SwitchField,
  useTableEntities
} from "@teselagen/ui";
import { compose } from "redux";
import { Button, Classes, Popover } from "@blueprintjs/core";
import classNames from "classnames";
import withEditorProps from "../../withEditorProps";
import { forEach, camelCase, startCase } from "lodash-es";
import { sizeSchema } from "../PropertiesDialog/utils";
import { getRangeLength } from "@teselagen/range-utils";
import { useFormValue } from "../../utils/useFormValue";

const dialogFormName = "RemoveDuplicatesDialog";
const dataTableFormName = "duplicatesToRemove";
const checkboxStyle = { marginTop: 0, marginBottom: 0 };

const RemoveDuplicatesDialog = props => {
  const {
    type,
    sequenceData = { sequence: "" },
    sequenceLength,
    isProtein,
    hideModal
  } = props;

  const { selectedEntities } = useTableEntities(dataTableFormName);

  const ignoreName = useFormValue(dialogFormName, "ignoreName");
  const ignoreStartAndEnd = useFormValue(dialogFormName, "ignoreStartAndEnd");
  const ignoreStrand = useFormValue(dialogFormName, "ignoreStrand");

  const recomputeDups = useCallback(
    values => {
      const ignoreName = values?.ignoreName;
      const ignoreStartAndEnd = values?.ignoreStartAndEnd;
      const ignoreStrand = values?.ignoreStrand;
      const annotations = sequenceData[type];
      const newDups = [];
      const seqsHashByStartEndStrandName = {};
      forEach(annotations, a => {
        const hash = `${ignoreStartAndEnd ? "" : a.start}&${
          ignoreStartAndEnd ? "" : a.end
        }&${ignoreStrand ? "" : a.strand}&${ignoreName ? "" : a.name}`;
        if (seqsHashByStartEndStrandName[hash]) {
          newDups.push({ ...a, size: getRangeLength(a, sequenceLength) });
        } else {
          seqsHashByStartEndStrandName[hash] = true;
        }
      });
      return newDups;
    },
    [sequenceData, sequenceLength, type]
  );

  const [dups, setDups] = useState(recomputeDups);
  const selectedIds = useMemo(() => dups.map(d => d.id), [dups]);

  const fieldSubmit = useCallback(
    (newVal, field) => {
      const values = {
        ignoreName,
        ignoreStartAndEnd,
        ignoreStrand,
        [field]: newVal
      };
      const newDups = recomputeDups(values);
      setDups(newDups);
    },
    [ignoreName, ignoreStartAndEnd, ignoreStrand, recomputeDups]
  );

  const schema = useMemo(
    () => ({
      fields: [
        { path: "name", type: "string" },
        // ...(noType ? [] : [{ path: "type", type: "string" }]),
        sizeSchema(isProtein),
        { path: "strand", type: "string" }
      ]
    }),
    [isProtein]
  );

  return (
    <div className={classNames(Classes.DIALOG_BODY, "tg-min-width-dialog")}>
      <DataTable
        noPadding
        withCheckboxes
        noFullscreenButton
        maxHeight={400}
        selectedIds={selectedIds}
        formName={dataTableFormName}
        noRouter
        noRowsFoundMessage="No duplicates found"
        compact
        noHeader
        noFooter
        withSearch={false}
        hideSelectedCount
        isInfinite
        schema={schema}
        entities={dups}
      />
      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <Popover
          target={<Button icon="settings" />}
          content={
            <div style={{ padding: 20, maxWidth: 250 }}>
              <div>Ignore These Fields While Finding Duplicates:</div>
              <br />
              <SwitchField
                containerStyle={{ marginBottom: 2 }}
                //delay the call to recompute dups until redux has had time to update
                onFieldSubmit={newVal => fieldSubmit(newVal, "ignoreName")}
                style={checkboxStyle}
                name="ignoreName"
                label="Name"
              />
              <SwitchField
                containerStyle={{ marginBottom: 2 }}
                //delay the call to recompute dups until redux has had time to update
                onFieldSubmit={newVal => fieldSubmit(newVal, "ignoreStrand")}
                style={checkboxStyle}
                name="ignoreStrand"
                label="Strand"
              />
              <SwitchField
                containerStyle={{ marginBottom: 2 }}
                //delay the call to recompute dups until redux has had time to update
                onFieldSubmit={newVal =>
                  fieldSubmit(newVal, "ignoreStartAndEnd")
                }
                style={checkboxStyle}
                name="ignoreStartAndEnd"
                label="Start and End"
              />
            </div>
          }
        />

        <Button
          intent="primary"
          onClick={() => {
            props[camelCase(`delete_${type}`).slice(0, -1)](
              Object.keys(selectedEntities || {})
            );
            window.toastr.success(
              `Successfully Deleted ${
                Object.keys(selectedEntities || {}).length
              } ${startCase(type)}`
            );
            hideModal();
          }}
          disabled={!Object.keys(selectedEntities || {}).length}
        >
          Remove {Object.keys(selectedEntities || {}).length} Duplicates
        </Button>
      </div>
    </div>
  );
};

export default compose(
  wrapDialog(),
  withEditorProps,
  reduxForm({ form: dialogFormName })
)(RemoveDuplicatesDialog);

import React from "react";
import { Button, Classes } from "@blueprintjs/core";

import {
  connectToEditor,
  updateCircular,
  handleInverse,
  getShowGCContent
} from "../withEditorProps";
import "./style.css";
import { withHandlers, compose } from "recompose";
import { divideBy3 } from "../utils/proteinUtils";
import { getSelectionMessage } from "../utils/editorUtils";
import useMeltingTemp from "../utils/useMeltingTemp";
import MeltingTemp from "./MeltingTemp";
import { getSequenceWithinRange } from "@teselagen/range-utils";
import { handleReadOnlyChange } from "../ToolBar/editTool";
import { TgHTMLSelect } from "@teselagen/ui";

export const EditReadOnlyItem = connectToEditor(({ readOnly }) => ({
  readOnly
}))(props => {
  const {
    onSave,
    readOnly,
    showReadOnly,
    disableSetReadOnly,
    disableBpEditing
  } = props;
  const disabled = disableSetReadOnly || !onSave; //the !onSave here is redundant
  return showReadOnly ? (
    <StatusBarItem dataTest="veStatusBar-readOnly">
      {onSave ? (
        <TgHTMLSelect
          data-tip={
            !readOnly && typeof disableBpEditing === "string"
              ? disableBpEditing
              : undefined
          }
          options={[
            {
              label: "Read Only",
              value: "readOnly"
            },
            {
              label: "Editable" + (disableBpEditing ? "*" : ""),
              value: "editable"
            }
          ]}
          disabled={disabled}
          className={Classes.MINIMAL + " veReadOnlySelect"}
          value={readOnly ? "readOnly" : "editable"}
          onChange={({ target: { value } }) =>
            handleReadOnlyChange(value === "readOnly", props)
          }
        />
      ) : readOnly ? (
        "Read Only"
      ) : (
        "Editable"
      )}
    </StatusBarItem>
  ) : null;
});

const ShowSelectionItem = compose(
  connectToEditor(
    (
      { selectionLayer, caretPosition, sequenceData = { sequence: "" } },
      ownProps,
      ...rest
    ) => {
      return {
        showGCContent: getShowGCContent(rest[rest.length - 1], ownProps),
        selectionLayer,
        isProtein: sequenceData.isProtein,
        caretPosition,
        sequenceLength: sequenceData.sequence.length,
        sequenceData
      };
    }
  ),
  withHandlers({ handleInverse })
)(({
  selectionLayer = { start: -1, end: -1 },
  caretPosition = -1,
  sequenceLength = 0,
  isProtein,
  showAminoAcidUnitAsCodon,
  sequenceData = { sequence: "" },
  showGCContent,
  GCDecimalDigits,
  handleInverse
}) => {
  const [showMeltingTemp] = useMeltingTemp();

  const sequence = getSequenceWithinRange(
    selectionLayer,
    sequenceData.sequence
  );

  return (
    <React.Fragment>
      <StatusBarItem dataTest="veStatusBar-selection">
        {getSelectionMessage({
          caretPosition,
          selectionLayer,
          sequenceLength,
          sequenceData,
          showGCContent,
          showAminoAcidUnitAsCodon,
          GCDecimalDigits,
          isProtein
        })}

        <Button
          minimal
          disabled={sequenceLength <= 0}
          onClick={handleInverse}
          style={{ marginLeft: 5, color: "#48AFF0" }}
          small
        >
          Select Inverse
        </Button>
      </StatusBarItem>
      {showMeltingTemp && (
        <MeltingTemp
          WrapperToUse={StatusBarItem}
          sequence={sequence}
        ></MeltingTemp>
      )}
    </React.Fragment>
  );
});

const ShowLengthItem = connectToEditor(
  ({ sequenceData = { sequence: "" } }) => ({
    sequenceLength: sequenceData.sequence.length
  })
)(({ isProtein, sequenceLength = 0, showAminoAcidUnitAsCodon }) => (
  <StatusBarItem dataTest="veStatusBar-length">{`Length: ${divideBy3(
    sequenceLength,
    isProtein
  )} ${isProtein ? `${showAminoAcidUnitAsCodon ? "codons" : "AAs"}` : "bps"}`}</StatusBarItem>
));

const ShowTypeItem = connectToEditor(({ sequenceData }) => ({
  isProtein: sequenceData.isProtein,
  isOligo: sequenceData.isOligo,
  isRna: sequenceData.isRna,
  isMixedRnaAndDna: sequenceData.isMixedRnaAndDna
}))(({ isProtein, isOligo, isRna, isMixedRnaAndDna }) => {
  let type = "DNA";
  if (isProtein) type = "Protein";
  if (isRna) type = "RNA";
  if (isOligo) type = "Oligo";
  if (isMixedRnaAndDna) type = "Mixed RNA/DNA";
  return <StatusBarItem dataTest="veStatusBar-type">{type}</StatusBarItem>;
});

export const EditCircularityItem = compose(
  connectToEditor(
    ({
      readOnly,
      sequenceData,
      sequenceData: { circular /* materiallyAvailable */ } = {}
    }) => ({
      readOnly,
      sequenceData,
      circular
    })
  ),
  withHandlers({ updateCircular })
)(({ readOnly, showCircularity, circular, updateCircular }) => {
  return showCircularity ? (
    <StatusBarItem dataTest="veStatusBar-circularity">
      {readOnly ? (
        circular ? (
          "Circular"
        ) : (
          "Linear"
        )
      ) : (
        <TgHTMLSelect
          onChange={({ target: { value } }) => {
            updateCircular(value === "circular");
          }}
          className={Classes.MINIMAL}
          value={circular ? "circular" : "linear"}
          options={[
            { label: "Circular", value: "circular" },
            { label: "Linear", value: "linear" }
          ]}
        />
      )}
    </StatusBarItem>
  ) : null;
});
export const EditAvailabilityItem = connectToEditor(
  ({ readOnly, sequenceData: { materiallyAvailable } = {} }) => ({
    readOnly,
    materiallyAvailable
  })
)(({ readOnly, showAvailability, materiallyAvailable, updateAvailability }) => {
  return showAvailability ? (
    <StatusBarItem>
      {readOnly ? (
        materiallyAvailable ? (
          "Available"
        ) : (
          "Unavailable"
        )
      ) : (
        <TgHTMLSelect
          onChange={({ target: { value } }) => {
            updateAvailability(value === "available");
          }}
          className={Classes.MINIMAL}
          value={materiallyAvailable ? "available" : "unavailable"}
          options={[
            { label: "Available", value: "available" },
            { label: "Unavailable", value: "unavailable" }
          ]}
        />
      )}
    </StatusBarItem>
  ) : null;
});

export function StatusBar({
  disableSetReadOnly,
  disableBpEditing,
  onSave,
  editorName,
  showCircularity = true,
  showMoleculeType = true,
  showReadOnly = true,
  showAvailability = false,
  showGCContentByDefault,
  onSelectionOrCaretChanged,
  GCDecimalDigits = 1,
  isProtein,
  showAminoAcidUnitAsCodon,
  beforeReadOnlyChange
}) {
  return (
    <div className="veStatusBar">
      {showMoleculeType && (
        <ShowTypeItem editorName={editorName}></ShowTypeItem>
      )}
      <EditReadOnlyItem
        beforeReadOnlyChange={beforeReadOnlyChange}
        editorName={editorName}
        onSave={onSave}
        disableBpEditing={disableBpEditing}
        disableSetReadOnly={disableSetReadOnly}
        showReadOnly={showReadOnly}
      />
      <EditCircularityItem
        editorName={editorName}
        showCircularity={showCircularity}
      />
      <EditAvailabilityItem
        editorName={editorName}
        showAvailability={showAvailability}
      />
      <ShowSelectionItem
        showAminoAcidUnitAsCodon={showAminoAcidUnitAsCodon}
        editorName={editorName}
        isProtein={isProtein}
        showGCContentByDefault={showGCContentByDefault}
        onSelectionOrCaretChanged={onSelectionOrCaretChanged}
        GCDecimalDigits={GCDecimalDigits}
      />
      <ShowLengthItem
        isProtein={isProtein}
        editorName={editorName}
        showAminoAcidUnitAsCodon={showAminoAcidUnitAsCodon}
      />
    </div>
  );
}

function StatusBarItem({ children, dataTest }) {
  return (
    <React.Fragment>
      <div data-test={dataTest} className="veStatusBarItem">
        {children}
      </div>
      <div className="veStatusBarSpacer" />
    </React.Fragment>
  );
}

export default StatusBar;

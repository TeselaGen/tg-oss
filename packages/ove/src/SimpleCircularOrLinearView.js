import React, { useState } from "react";
import {
  showContextMenu,
  commandMenuEnhancer,
  FillWindow
} from "@teselagen/ui";

import { CircularView } from "./CircularView";
import { LinearView } from "./LinearView";
import { RowView } from "./RowView";

import { HoveredIdContext } from "./helperComponents/withHover";
import { visibilityDefaultValues } from "./redux/annotationVisibility";
import { addWrappedAddons } from "./utils/addWrappedAddons";
import { SimpleOligoPreview } from "./SimpleOligoPreview";
import { cloneDeep, flatMap, map, startCase } from "lodash";
import {
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Popover,
  Tooltip
} from "@blueprintjs/core";
import getCommands from "./commands";
import { withHandlers } from "recompose";
import { exportSequenceToFile } from "./withEditorProps";
import {
  editorClicked,
  updateSelectionOrCaret
} from "./withEditorInteractions/clickAndDragUtils";

//this view is meant to be a helper for showing a simple (non-redux connected) circular or linear view!
export default props => {
  let {
    sequenceData: _sequenceData,
    annotationVisibility: _annotationVisibility = {},
    noWarnings = true,
    withDownload,
    withChoosePreviewType,
    withCaretEnabled,
    withSelectionEnabled,
    smallSlider,
    withVisibilityOptions,
    minimalPreviewTypeBtns,
    withFullscreen,
    selectionLayer,
    selectionLayerUpdate,
    caretPositionUpdate
  } = props;
  const [previewType, setPreviewType] = useState(
    _sequenceData.circular ? "circular" : "linear"
  );
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);
  const [visibilityOptions, setVisibilityOptions] = useState({});
  const [caretPosition, _caretPositionUpdate] = useState(
    withCaretEnabled ? -1 : undefined
  );
  const [_selectionLayer, _selectionLayerUpdate] = useState(
    withSelectionEnabled ? { start: -1, end: -1 } : undefined
  );
  const sequenceLength = _sequenceData.noSequence
    ? _sequenceData.size
    : _sequenceData.sequence.length;
  selectionLayer = selectionLayer || _selectionLayer;

  const selectionLayerUpdateOld = selectionLayerUpdate || _selectionLayerUpdate;
  const caretPositionUpdateOld = caretPositionUpdate || _caretPositionUpdate;

  selectionLayerUpdate = (newSel, dontTrigger) => {
    if (!dontTrigger && newSel.start > -1) {
      caretPositionUpdate(-1, true);
    }
    selectionLayerUpdateOld(newSel);
  };
  caretPositionUpdate = (newCaret, dontTrigger) => {
    if (!dontTrigger && newCaret > -1) {
      selectionLayerUpdate({ start: -1, end: -1 }, true);
    }
    caretPositionUpdateOld(newCaret);
  };
  function annotationClicked({ annotation, event }) {
    event.stopPropagation();
    event.preventDefault();
    withSelectionEnabled &&
      updateSelectionOrCaret({
        doNotWrapOrigin: !sequenceData.circular,
        shiftHeld: event.shiftKey,
        sequenceLength,
        newRangeOrCaret: annotation,
        caretPosition,
        selectionLayer,
        selectionLayerUpdate: selectionLayerUpdate,
        caretPositionUpdate: caretPositionUpdate
      });
  }

  let tickSpacing = undefined;
  let Component = (
    withChoosePreviewType ? previewType === "circular" : _sequenceData.circular
  )
    ? CircularView
    : _sequenceData.isOligo && _sequenceData.sequence
      ? SimpleOligoPreview
      : LinearView;
  if (withChoosePreviewType && previewType === "row") {
    Component = RowView;
    tickSpacing = undefined;
  }

  let sequenceData = cloneDeep(_sequenceData);
  const annotationVisibility = {
    ...visibilityDefaultValues,
    ..._annotationVisibility,
    ...visibilityOptions
  };

  //here we're making it possible to not pass a sequenceData.sequence
  //we can just pass a .size property to save having to send the whole sequence if it isn't needed!
  if (sequenceData.noSequence) {
    annotationVisibility.sequence = false;
    annotationVisibility.reverseSequence = false;
    if (sequenceData.size === undefined) {
      return (
        <div>
          Error: No sequenceData.size detected when using noSequence flag{" "}
        </div>
      );
    }
    sequenceData = {
      ...sequenceData,
      sequence: {
        length: sequenceData.size
      }
    };
  }
  sequenceData.parts = addWrappedAddons(
    sequenceData.parts,
    sequenceData.sequence.length
  );
  const inner = ({ width, height }) => (
    <HoveredIdContext.Provider value={{ hoveredId: props.hoveredId }}>
      <div style={{ width: "fit-content" }}>
        {(withDownload ||
          withChoosePreviewType ||
          withFullscreen ||
          VisibilityOptions) && (
          <div
            style={{
              marginLeft: 10,
              marginBottom: 5,
              ...(isFullscreen && {
                marginRight: 10,
                paddingTop: 10
              }),
              display: "flex",
              justifyContent: "end"
            }}
          >
            {withDownload && <DownloadBtn {...props}></DownloadBtn>}
            {withVisibilityOptions && (
              <VisibilityOptions
                {...{
                  ...props,
                  sequenceData,
                  annotationVisibility,
                  setVisibilityOptions,
                  isPopoverOpen,
                  setPopoverOpen
                }}
              ></VisibilityOptions>
            )}

            {withChoosePreviewType && (
              <ButtonGroup>
                <Tooltip content="Circular View">
                  <Button
                    minimal={minimalPreviewTypeBtns}
                    className="tgPreviewTypeCircular"
                    active={previewType === "circular"}
                    intent="primary"
                    onClick={() => setPreviewType("circular")}
                    icon="circle"
                  ></Button>
                </Tooltip>
                <Tooltip content="Linear View">
                  <Button
                    minimal={minimalPreviewTypeBtns}
                    className="tgPreviewTypeLinear"
                    active={previewType === "linear"}
                    intent="primary"
                    onClick={() => setPreviewType("linear")}
                    icon="layout-linear"
                  ></Button>
                </Tooltip>
                <Tooltip content="Sequence View">
                  <Button
                    minimal={minimalPreviewTypeBtns}
                    className="tgPreviewTypeRow"
                    active={previewType === "row"}
                    intent="primary"
                    onClick={() => setPreviewType("row")}
                    icon="menu"
                  ></Button>
                </Tooltip>
              </ButtonGroup>
            )}
            {withFullscreen && (
              <FullscreenBtn
                {...{ setFullscreen, isFullscreen }}
              ></FullscreenBtn>
            )}
          </div>
        )}
        <Component
          {...{
            showCicularViewInternalLabels: true,
            className: "tg-simple-dna-view veEditor",
            width: 300,
            height: 300,
            noWarnings,
            partClicked: annotationClicked,
            featureClicked: annotationClicked,
            primerClicked: annotationClicked,
            ...props,
            ...(isFullscreen && {
              width: width - 10,
              height: height - 10
            }),
            smartCircViewLabelRender: true,
            caretPosition,
            smallSlider,
            ...(withSelectionEnabled && {
              selectionLayer,
              selectionLayerUpdate
            }),
            readOnly: true,
            editorClicked: ({ nearestCaretPos, event } = {}) => {
              if (!withCaretEnabled) {
                if (!withSelectionEnabled) return;
                if (!event.shiftKey) return;
                if (!(selectionLayer.start > -1)) return;
              }

              editorClicked({
                nearestCaretPos,
                shiftHeld: !withSelectionEnabled ? false : event.shiftKey,
                updateSelectionOrCaret: (shiftHeld, newRangeOrCaret) => {
                  updateSelectionOrCaret({
                    doNotWrapOrigin: !sequenceData.circular,
                    sequenceLength,
                    shiftHeld,
                    newRangeOrCaret,
                    caretPosition,
                    selectionLayer,
                    selectionLayerUpdate: selectionLayerUpdate,
                    caretPositionUpdate: caretPositionUpdate
                  });
                }
              });
            },
            instantiated: true,
            tickSpacing,
            hoveredId: props.hoveredId,
            annotationVisibility,
            sequenceData,
            showTitle: true
          }}
        />
      </div>
    </HoveredIdContext.Provider>
  );
  if (isFullscreen) {
    return (
      <FillWindow asPortal className="tgSimpleViewFullscreen">
        {inner}
      </FillWindow>
    );
  }
  return inner({});
};

const DownloadBtn = withHandlers({ exportSequenceToFile })(props => {
  return (
    <Tooltip content="Download">
      <Button
        className="veDownloadButton"
        style={{ marginRight: 10 }}
        onClick={event =>
          showContextMenu(
            [
              "exportSequenceAsGenbank",
              "exportDNASequenceAsFasta",
              "exportProteinSequenceAsFasta",
              "exportSequenceAsTeselagenJson"
            ],
            [
              commandMenuEnhancer(getCommands({ props }), {
                useTicks: true,
                omitIcons: true
              })
            ],
            event
          )
        }
        minimal
        intent="primary"
        icon="download"
      ></Button>
    </Tooltip>
  );
});
const FullscreenBtn = ({ setFullscreen, isFullscreen }) => {
  return (
    <Tooltip content={`${isFullscreen ? "Close " : ""}Fullscreen`}>
      <Button
        className="veFullscreenButton"
        style={{ marginLeft: 10, marginRight: 10 }}
        onClick={() => {
          setFullscreen(!isFullscreen);
        }}
        minimal
        intent="primary"
        icon={!isFullscreen ? "maximize" : "minimize"}
      ></Button>
    </Tooltip>
  );
};
const VisibilityOptions = ({
  annotationVisibility,
  sequenceData,
  setVisibilityOptions,
  isPopoverOpen,
  setPopoverOpen
}) => {
  return (
    <Tooltip disabled={isPopoverOpen} content="Visibility Options">
      <Popover
        minimal
        onInteraction={isOpen => {
          setPopoverOpen(isOpen);
        }}
        isOpen={isPopoverOpen}
        content={
          <Menu>
            {flatMap(
              ["features", "parts", "primers", "translations", "cutsites"],
              name => {
                if (!map(sequenceData[name]).length) return [];
                return (
                  <MenuItem
                    onClick={e => {
                      setVisibilityOptions({
                        ...annotationVisibility,
                        [name]: !annotationVisibility[name]
                      });
                      e.stopPropagation();
                    }}
                    icon={annotationVisibility[name] ? "tick" : "blank"}
                    key={name}
                    text={startCase(name)}
                  ></MenuItem>
                );
              }
            )}
          </Menu>
        }
      >
        <Button
          className="veSimpleVisibilityBtn"
          style={{ marginLeft: 10, marginRight: 10 }}
          minimal
          intent="primary"
          icon="eye-open"
        ></Button>
      </Popover>
    </Tooltip>
  );
};

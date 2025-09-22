import React, { useEffect, useMemo, useState } from "react";
import store from "./store";
import msaAlignment from "./exampleData/msaAlignment.json";
import pairwiseAlignment from "./exampleData/pairwiseAlignment.json";
import sangerAlignment from "./exampleData/sangerAlignment.json";
import msaAlignmentWithGaps from "./exampleData/msaAlignment_withGaps.json";
import { addAlignment, AlignmentView /* updateEditor */ } from "../../src/";
import { useToggle } from "./utils/useToggle";
import {
  BPSelect,
  getCurrentParamsFromUrl,
  setCurrentParamsOnUrl
} from "@teselagen-biotech/ui";
import pairwiseAlignment2 from "./exampleData/pairwiseAlignment2.json";
import { Button } from "@blueprintjs/core";
import { difference } from "lodash-es";

// Use the line below because using the full 30 sequences murders Redux dev tools.
msaAlignment.alignmentTracks = msaAlignment.alignmentTracks.slice(0, 20);
const defaultState = {
  alignmentDataId: msaAlignment.id,
  showDemoOptions: true,
  forceHeightMode: false,
  isFullyZoomedOut: false,
  setMinimapLaneHeight: false,
  setMinimapLaneSpacing: false,
  setAlignmentName: false,
  noClickDragHandlers: false,
  hasTemplate: false,
  noVisibilityOptions: false,
  setTickSpacing: false
};
const bpSelectOptions = [
  {
    label: "Multiple Sequence Alignment",
    value: msaAlignment.id
  },
  { label: "Pairwise Alignment", value: pairwiseAlignment.id },
  {
    label: "Pairwise Alignment 2",
    value: pairwiseAlignment2.id
  },
  { label: "Sanger Alignment", value: sangerAlignment.id },
  { label: "MSA with gaps", value: msaAlignmentWithGaps.id }
];

const alignmentViewStyle = {
  marginRight: 10
};

export default props => {
  useEffect(() => {
    addAlignment(store, msaAlignment);
    addAlignment(store, pairwiseAlignment);
    addAlignment(store, pairwiseAlignment2);
    addAlignment(store, sangerAlignment);
    addAlignment(store, msaAlignmentWithGaps);
  }, []);

  const defaultValues = useMemo(() => {
    const editorDemoState = getCurrentParamsFromUrl(props.history.location);
    // localStorage.editorDemoState = props.history.location.search;
    const massagedEditorDemoState = Object.keys(editorDemoState).reduce(
      (acc, key) => {
        if (editorDemoState[key] === "false") {
          acc[key] = false;
        } else if (editorDemoState[key] === "true") {
          acc[key] = true;
        } else {
          acc[key] = editorDemoState[key];
        }
        return acc;
      },
      {}
    );
    return {
      ...defaultState,
      ...massagedEditorDemoState
    };
  }, [props.history.location]);
  const [forceHeightMode, forceHeightModeSwitch] = useToggle({
    type: "forceHeightMode",
    label: "Force Height 500px",
    description:
      "You can force a height for the editor by passing height:500 (same for width)",
    defaultValue: defaultValues.forceHeightMode
  });

  const [showDemoOptions, setShowDemoOptions] = useState(
    defaultValues.showDemoOptions
  );
  const [, showDemoOptionsSwitch] = useToggle({
    alwaysShow: true,
    type: "showDemoOptions",
    label: "Show Demo Options",
    hotkey: `cmd+'`,
    controlledValue: showDemoOptions,
    setControlledValue: setShowDemoOptions,
    defaultValue: defaultValues.showDemoOptions
  });

  const [alignmentDataId, setAlignmentDataId] = useState(
    defaultValues.alignmentDataId
  );
  const [setAlignmentName, setAlignmentNameSwitch] = useToggle({
    type: "setAlignmentName",
    label: "Set Alignment Name",
    description:
      "You can give the alignment a name by setting alignmentName:'Ref Seq Name'",
    defaultValue: defaultValues.setAlignmentName
  });
  const [alignmentName, setAlignmentNameValue] = useState();
  const [isFullyZoomedOut, isFullyZoomedOutSwitch] = useToggle({
    type: "isFullyZoomedOut",
    label: "View Zoomed-Out Alignment",
    description:
      "You can view the alignment zoomed-out by setting isFullyZoomedOut:true",
    defaultValue: defaultValues.isFullyZoomedOut
  });
  const [setMinimapLaneHeight, setMinimapLaneHeightSwitch] = useToggle({
    type: "setMinimapLaneHeight",
    label: "Set Minimap Lane Height 13px",
    description:
      "You can set a height for the minimap lanes by passing minimapLaneHeight:13",
    defaultValue: defaultValues.setMinimapLaneHeight
  });
  const [setMinimapLaneSpacing, setMinimapLaneSpacingSwitch] = useToggle({
    type: "setMinimapLaneSpacing",
    label: "Set Minimap Lane Spacing 3px",
    description:
      "You can set a height for the space between minimap lanes by passing minimapLaneSpacing:3",
    defaultValue: defaultValues.setMinimapLaneSpacing
  });
  const [noClickDragHandlers, noClickDragHandlersSwitch] = useToggle({
    type: "noClickDragHandlers",
    label: "Disable Clicks, Dragging and Highlighting",
    description:
      "You can disable click-drag highlighting by setting noClickDragHandlers:true",
    defaultValue: defaultValues.noClickDragHandlers
  });
  const [allowTrackNameEdit, allowTrackNameEditSwitch] = useToggle({
    type: "allowTrackNameEdit"
  });
  const [handleAlignmentRename, handleAlignmentRenameSwitch] = useToggle({
    type: "handleAlignmentRename"
  });
  const [shouldAutosave, shouldAutosaveSwitch] = useToggle({
    type: "shouldAutosave"
  });
  const [allowTrimming, allowTrimmingSwitch] = useToggle({
    type: "allowTrimming"
  });
  const [allowTrackRearrange, allowTrackRearrangeSwitch] = useToggle({
    type: "allowTrackRearrange"
  });
  const [hasTemplate, hasTemplateSwitch] = useToggle({
    type: "hasTemplate",
    label: "Specify Alignment with Template",
    description:
      "You can specify that the first sequence in an alignment is a template sequence by setting hasTemplate:true",
    defaultValue: defaultValues.hasTemplate
  });
  const [setTickSpacing, setTickSpacingSwitch] = useToggle({
    type: "setTickSpacing",
    label: "Force Tick Spacing 5 bps",
    description:
      "You can set force the spacing of tick marks on the axis by setting linearViewOptions:{tickSpacing:5}",
    defaultValue: defaultValues.setTickSpacing
  });
  const [noVisibilityOptions, noVisibilityOptionsSwitch] = useToggle({
    type: "noVisibilityOptions",
    label: "Disable Visibility Options",
    description:
      "You can disable the visibility options menu by setting noVisibilityOptions:true",
    defaultValue: defaultValues.noVisibilityOptions
  });
  const [overrideSelectionRightClick, overrideSelectionRightClickSwitch] =
    useToggle({
      type: "overrideSelectionRightClick",
      label: "Override Selection Right Click",
      description:
        "You can override the selection right click by passing a selectionLayerRightClicked={(event)={}} prop"
    });
  const [addSelectionRightClickOptions, addSelectionRightClickOptionsSwitch] =
    useToggle({
      type: "addSelectionRightClickOptions",
      label: "Add Selection Right Click Options",
      description: `You can add options to the selection right click by passing additionalSelectionLayerRightClickedOptions={(event)=>({
            text: "I'm an additional option",
            className: "createDiversityRegion",
            onClick: () => this.addDiversityRegionIfPossible()
          })} prop`
    });

  // constructor(props) {
  //   super(props);
  //   setupOptions({ that: this, defaultState, props });
  // }

  useEffect(() => {
    if (props.history) {
      const diff = difference(
        {
          alignmentDataId,
          showDemoOptions,
          forceHeightMode,
          isFullyZoomedOut,
          setMinimapLaneHeight,
          setMinimapLaneSpacing,
          setAlignmentName,
          noClickDragHandlers,
          hasTemplate,
          noVisibilityOptions,
          setTickSpacing
        },
        defaultState
      );
      setCurrentParamsOnUrl(diff, props.history.replace);
    }
  }, [
    alignmentDataId,
    forceHeightMode,
    hasTemplate,
    isFullyZoomedOut,
    noClickDragHandlers,
    noVisibilityOptions,
    props.history,
    setAlignmentName,
    setMinimapLaneHeight,
    setMinimapLaneSpacing,
    setTickSpacing,
    showDemoOptions
  ]);

  return (
    <div
      className={"AlignmentDemo"}
      style={{
        display: "flex",
        position: "relative",
        // flexDirection: "column",
        flexGrow: "1",
        minHeight: 0,
        height: "100%",
        width: "100%"
      }}
    >
      {showDemoOptions && (
        <div data-test="optionContainer" className="tgOptionContainer">
          <div style={{ display: "none" }}>{showDemoOptionsSwitch}</div>
          <BPSelect
            onChange={val => {
              setAlignmentDataId(val);
            }}
            options={bpSelectOptions}
          />
          <br />
          {forceHeightModeSwitch}
          {setAlignmentNameSwitch}
          {isFullyZoomedOutSwitch}
          {setMinimapLaneHeightSwitch}
          {setMinimapLaneSpacingSwitch}
          {noClickDragHandlersSwitch}
          {allowTrackNameEditSwitch}
          {handleAlignmentRenameSwitch}
          {shouldAutosaveSwitch}
          {allowTrimmingSwitch}
          {allowTrackRearrangeSwitch}
          {hasTemplateSwitch}
          {setTickSpacingSwitch}
          {noVisibilityOptionsSwitch}
          {overrideSelectionRightClickSwitch}
          {addSelectionRightClickOptionsSwitch}
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
        </div>
      )}
      <AlignmentView
        style={alignmentViewStyle}
        {...(addSelectionRightClickOptions && {
          additionalSelectionLayerRightClickedOptions: () => [
            {
              text: "I'm an additional option",
              className: "createDiversityRegion",
              onClick: () => window.toastr.success("You did it!")
            }
          ]
        })}
        {...(overrideSelectionRightClick && {
          selectionLayerRightClicked: () => {
            window.toastr.success("lezzz goooo!");
          }
        })}
        additionalTopLeftEl={
          <Button
            minimal
            data-tip={
              showDemoOptions ? "Hide Demo Options" : "Show Demo Options"
            }
            icon={showDemoOptions ? "chevron-left" : "chevron-right"}
            onClick={() => {
              setShowDemoOptions(prev => !prev);
            }}
          />
        }
        additionalTopEl={<Button>Additional Top El</Button>}
        id={alignmentDataId}
        height={forceHeightMode ? 500 : undefined}
        isFullyZoomedOut={isFullyZoomedOut}
        minimapLaneHeight={setMinimapLaneHeight ? 13 : undefined}
        minimapLaneSpacing={setMinimapLaneSpacing ? 3 : undefined}
        handleAlignmentRename={
          handleAlignmentRename
            ? newName => {
                window.toastr.success(
                  `handleAlignmentRename triggered with ${newName}`
                );
                setAlignmentNameValue(newName);
              }
            : undefined
        }
        alignmentName={
          alignmentName
            ? alignmentName
            : !setAlignmentName
              ? "Ref Seq Name"
              : "Alignment Name Placeholder"
        }
        noClickDragHandlers={noClickDragHandlers}
        allowTrackNameEdit={allowTrackNameEdit}
        allowTrimming={allowTrimming}
        shouldAutosave={shouldAutosave}
        handleAlignmentSave={
          shouldAutosave
            ? () => {
                window.toastr.success("Autosave Triggered");
              }
            : undefined
        }
        allowTrackRearrange={allowTrackRearrange}
        hasTemplate={hasTemplate}
        noVisibilityOptions={noVisibilityOptions}
        linearViewOptions={{
          ...(setTickSpacing && { tickSpacing: 10 })
        }}
      />
    </div>
  );
};

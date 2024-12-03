import React, { useEffect, useState } from "react";
import store from "./store";
import msaAlignment from "./exampleData/msaAlignment.json";
import pairwiseAlignment from "./exampleData/pairwiseAlignment.json";
import sangerAlignment from "./exampleData/sangerAlignment.json";
import msaAlignmentWithGaps from "./exampleData/msaAlignment_withGaps.json";
import { addAlignment, AlignmentView /* updateEditor */ } from "../../src/";
import { BPSelect } from "@teselagen/ui";
import pairwiseAlignment2 from "./exampleData/pairwiseAlignment2.json";
import { Button } from "@blueprintjs/core";
import { useToggle } from "./utils/useToggle";

// Use the line below because using the full 30 sequences murders Redux dev tools.
msaAlignment.alignmentTracks = msaAlignment.alignmentTracks.slice(0, 20);
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

export default () => {
  const [showDemoOptions, setShowDemoOptions] = useState(true);
  const [, showDemoOptionsComp] = useToggle({
    alwaysShow: true,
    defaultValue: true,
    type: "showDemoOptions",
    label: "Show Demo Options",
    controlledValue: showDemoOptions,
    setControlledValue: setShowDemoOptions
  });
  const [forceHeightMode, forceHeightModeComp] = useToggle({
    defaultValue: false,
    type: "forceHeightMode",
    label: "Force Height 500px",
    description:
      "You can force a height for the editor by passing height:500 (same for width)"
  });
  const [alignmentDataId, setAlignmentDataId] = useState(msaAlignment.id);
  const [alignmentName, setAlignmentName] = useState();
  const [, alignmentNameComp] = useToggle({
    type: "setAlignmentName",
    label: "Set Alignment Name",
    description:
      "You can give the alignment a name by setting alignmentName:'Ref Seq Name'",
    controlledValue: alignmentName,
    setControlledValue: setAlignmentName
  });
  const [isFullyZoomedOut, isFullyZoomedOutComp] = useToggle({
    type: "isFullyZoomedOut",
    label: "View Zoomed-Out Alignment",
    description:
      "You can view the alignment zoomed-out by setting isFullyZoomedOut:true",
    defaultValue: false
  });
  const [setMinimapLaneHeight, setMinimapLaneHeightComp] = useToggle({
    defaultValue: false,
    type: "setMinimapLaneHeight",
    label: "Set Minimap Lane Height 13px",
    description:
      "You can set a height for the minimap lanes by passing minimapLaneHeight:13"
  });
  const [setMinimapLaneSpacing, setMinimapLaneSpacingComp] = useToggle({
    defaultValue: false,
    type: "setMinimapLaneSpacing",
    label: "Set Minimap Lane Spacing 3px",
    description:
      "You can set a height for the space between minimap lanes by passing minimapLaneSpacing:3"
  });
  const [noClickDragHandlers, noClickDragHandlersComp] = useToggle({
    defaultValue: false,
    type: "noClickDragHandlers",
    label: "Disable Clicks, Dragging and Highlighting",
    description:
      "You can disable click-drag highlighting by setting noClickDragHandlers:true"
  });
  const [hasTemplate, hasTemplateComp] = useToggle({
    defaultValue: false,
    type: "hasTemplate",
    label: "Specify Alignment with Template",
    description:
      "You can specify that the first sequence in an alignment is a template sequence by setting hasTemplate:true"
  });
  const [noVisibilityOptions, noVisibilityOptionsComp] = useToggle({
    defaultValue: false,
    type: "noVisibilityOptions",
    label: "Disable Visibility Options",
    description:
      "You can disable the visibility options menu by setting noVisibilityOptions:true"
  });
  const [setTickSpacing, setTickSpacingComp] = useToggle({
    defaultValue: false,
    type: "setTickSpacing",
    label: "Force Tick Spacing 5 bps",
    description:
      "You can set force the spacing of tick marks on the axis by setting linearViewOptions:{tickSpacing:5}"
  });
  const [allowTrackNameEdit, allowTrackNameEditComp] = useToggle({
    type: "allowTrackNameEdit"
  });
  const [handleAlignmentRename, handleAlignmentRenameComp] = useToggle({
    type: "handleAlignmentRename"
  });
  const [shouldAutosave, shouldAutosaveComp] = useToggle({
    type: "shouldAutosave"
  });
  const [allowTrimming, allowTrimmingComp] = useToggle({
    type: "allowTrimming"
  });
  const [allowTrackRearrange, allowTrackRearrangeComp] = useToggle({
    type: "allowTrackRearrange"
  });
  const [overrideSelectionRightClick, overrideSelectionRightClickComp] =
    useToggle({
      type: "overrideSelectionRightClick",
      label: "Override Selection Right Click",
      description:
        "You can override the selection right click by passing a selectionLayerRightClicked={(event)={}} prop"
    });
  const [addSelectionRightClickOptions, addSelectionRightClickOptionsComp] =
    useToggle({
      type: "addSelectionRightClickOptions",
      label: "Add Selection Right Click Options",
      description: `You can add options to the selection right click by passing additionalSelectionLayerRightClickedOptions={(event)=>({
            text: "I'm an additional option",
            className: "createDiversityRegion",
            onClick: () => this.addDiversityRegionIfPossible()
          })} prop`
    });

  useEffect(() => {
    addAlignment(store, msaAlignment);
    addAlignment(store, pairwiseAlignment);
    addAlignment(store, pairwiseAlignment2);
    addAlignment(store, sangerAlignment);
    addAlignment(store, msaAlignmentWithGaps);
  }, []);

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
          <div style={{ display: "none" }}>{showDemoOptionsComp}</div>
          <BPSelect
            onChange={val => setAlignmentDataId(val)}
            options={bpSelectOptions}
          />
          <br />
          {forceHeightModeComp}
          {alignmentNameComp}
          {isFullyZoomedOutComp}
          {setMinimapLaneHeightComp}
          {setMinimapLaneSpacingComp}
          {noClickDragHandlersComp}
          {allowTrackNameEditComp}
          {handleAlignmentRenameComp}
          {shouldAutosaveComp}
          {allowTrimmingComp}
          {allowTrackRearrangeComp}
          {hasTemplateComp}
          {setTickSpacingComp}
          {noVisibilityOptionsComp}
          {overrideSelectionRightClickComp}
          {addSelectionRightClickOptionsComp}
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      )}
      <AlignmentView
        style={{
          marginRight: 10
        }}
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
                setAlignmentName(newName);
              }
            : undefined
        }
        alignmentName={alignmentName || "Alignment Name Placeholder"}
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

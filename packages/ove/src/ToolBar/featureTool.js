import { Icon } from "@blueprintjs/core";
// import { Checkbox, Button } from "@blueprintjs/core";
import React from "react";
// import { connect } from "react-redux";
// import { convertRangeTo1Based } from "@teselagen-biotech/range-utils";
import { featureIcon } from "@teselagen-biotech/ui";
import ToolbarItem from "./ToolbarItem";
import { connectToEditor } from "../withEditorProps";

export default connectToEditor(
  ({ annotationVisibility = {}, toolBar = {} }) => {
    return {
      toggled: annotationVisibility.features,
      isOpen: toolBar.openItem === "featureTool"
    };
  }
)(({ toolbarItemProps, toggled, annotationVisibilityToggle, isOpen }) => {
  return (
    <ToolbarItem
      {...{
        Icon: <Icon icon={featureIcon} />,
        onIconClick: function () {
          annotationVisibilityToggle("features");
        },
        toggled,
        tooltip: "Show features",
        tooltipToggled: "Hide features",
        // Dropdown: ConnectedFeatureToolDropdown,
        dropdowntooltip: (!isOpen ? "Show" : "Hide") + " Feature Options",
        ...toolbarItemProps
      }}
    />
  );
});

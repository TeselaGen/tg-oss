import {
  Button,
  Popover,
  Intent,
  Tooltip,
  Tag,
  Menu,
  MenuItem
} from "@blueprintjs/core";
import React from "react";
import { map, startCase } from "lodash-es";
import { pureNoFunc, wrapDialog } from "@teselagen/ui";
import { compose } from "redux";
import { showDialog } from "../GlobalDialogUtils";
// import { fullSequenceTranslationMenu } from "../MenuBar/viewSubmenu";

export default pureNoFunc(function AlignmentVisibilityTool(props) {
  return (
    <Popover
      minimal
      position="bottom"
      content={<VisibilityOptions {...props} />}
      target={
        <Tooltip content="Visibility Options">
          <Button
            className="tg-alignment-visibility-toggle"
            small
            rightIcon="caret-down"
            intent={Intent.PRIMARY}
            minimal
            icon="eye-open"
          />
        </Tooltip>
      }
    />
  );
});

function VisibilityOptions({
  // alignmentAnnotationVisibility = {},
  alignmentAnnotationVisibilityToggle,
  togglableAlignmentAnnotationSettings = {},
  // alignmentAnnotationLabelVisibility = {},
  // alignmentAnnotationLabelVisibilityToggle
  annotationsWithCounts,
  currentPairwiseAlignmentIndex
}) {
  let annotationCountToUse = {};
  if (currentPairwiseAlignmentIndex) {
    annotationCountToUse = annotationsWithCounts[currentPairwiseAlignmentIndex];
  } else {
    annotationCountToUse = annotationsWithCounts[0];
  }

  const subMenuElements = ["physicalProperties", "plot"];
  const physicalPropertyElements = [
    "hydrophobicity",
    "polar",
    "negative",
    "positive",
    "charged",
    "aliphatic",
    "aromatic"
  ];
  const plotElements = ["conservation", "properties"];

  return (
    <Menu
      style={{ padding: 10 }}
      className="alignmentAnnotationVisibilityToolInner"
    >
      {map(togglableAlignmentAnnotationSettings, (visible, annotationName) => {
        if (
          !physicalPropertyElements.includes(annotationName) &&
          !plotElements.includes(annotationName)
        ) {
          return (
            <MenuItem
              icon={
                visible && !subMenuElements.includes(annotationName)
                  ? "tick"
                  : ""
              }
              onClick={e => {
                e.stopPropagation();
                if (annotationName === "axis") {
                  return alignmentAnnotationVisibilityToggle({
                    axisNumbers: !visible,
                    axis: !visible
                  });
                }
                if (annotationName === "cdsFeatureTranslations" && !visible) {
                  return alignmentAnnotationVisibilityToggle({
                    cdsFeatureTranslations: !visible,
                    translations: !visible
                  });
                }

                alignmentAnnotationVisibilityToggle({
                  [annotationName]: !visible
                });
              }}
              text={
                <>
                  {startCase(annotationName)
                    .replace("Cds", "CDS")
                    .replace("Dna", "DNA")}
                  {annotationName in annotationCountToUse ? (
                    <Tag round style={{ marginLeft: 7 }}>
                      {annotationCountToUse[annotationName]}
                    </Tag>
                  ) : (
                    ""
                  )}
                </>
              }
              key={annotationName}
            >
              {annotationName === "physicalProperties"
                ? map(
                    togglableAlignmentAnnotationSettings,
                    (_visible, _annotationName) => {
                      if (physicalPropertyElements.includes(_annotationName)) {
                        return (
                          <MenuItem
                            icon={_visible ? "tick" : ""}
                            onClick={e => {
                              e.stopPropagation();
                              alignmentAnnotationVisibilityToggle({
                                [_annotationName]: !_visible
                              });
                            }}
                            text={<>{startCase(_annotationName)}</>}
                            key={_annotationName}
                          />
                        );
                      }
                    }
                  ).filter(Boolean)
                : annotationName === "plot"
                  ? map(
                      togglableAlignmentAnnotationSettings,
                      (_visible, _annotationName) => {
                        if (plotElements.includes(_annotationName)) {
                          return (
                            <div style={{ position: "relative" }}>
                              <MenuItem
                                className={`plot-${_annotationName}`}
                                icon={_visible ? "tick" : ""}
                                onClick={e => {
                                  e.stopPropagation();
                                  alignmentAnnotationVisibilityToggle({
                                    [_annotationName]: !_visible
                                  });
                                }}
                                text={<>{startCase(_annotationName)}</>}
                                key={_annotationName}
                              />
                              {_annotationName === "properties" ? (
                                <Button
                                  icon="info-sign"
                                  style={{
                                    position: "absolute",
                                    top: 3,
                                    right: 0
                                  }}
                                  onClick={() => {
                                    showDialog({
                                      ModalComponent: PropertyDialog
                                    });
                                  }}
                                  minimal
                                  small
                                />
                              ) : null}
                            </div>
                          );
                        }
                      }
                    ).filter(Boolean)
                  : null}
            </MenuItem>
          );
        }
      })}
      {/* <MenuItem icon="" text={fullSequenceTranslationMenu.text}>
        {fullSequenceTranslationMenu.submenu.map(({ text, cmd }) => {
          return <MenuItem key={cmd} text={text}></MenuItem>;
        })}
      </MenuItem> */}
    </Menu>
  );
}

const PropertyDialog = compose(
  wrapDialog({
    title: "Amino Acid Properties",
    style: {
      width: 600
    }
  })
)(function () {
  return (
    <div style={{ width: "100%", padding: 10 }}>
      <img src="/aaprops.svg" width={580} alt="Amino Acid Properties" />
    </div>
  );
});

import React from "react";
import {
  DataTable,
  withSelectedEntities,
  CmdButton,
  getTagProps,
  getKeyedTagsAndTagOptions,
  DropdownButton,
  createCommandMenu,
  popoverOverflowModifiers,
  removeDuplicatesIcon
} from "@teselagen/ui";
import { map, upperFirst, pick, startCase, isFunction } from "lodash-es";
import {
  AnchorButton,
  ButtonGroup,
  Icon,
  Menu,
  Tag,
  Tooltip
} from "@blueprintjs/core";
import { getRangeLength } from "@teselagen/range-utils";
// import { Popover } from "@blueprintjs/core";
// import ColorPicker from "./ColorPicker";
import { connectToEditor } from "../../withEditorProps";
import { compose } from "recompose";
import commands from "../../commands";
import { sizeSchema } from "./utils";
import { showAddOrEditAnnotationDialog } from "../../GlobalDialogUtils";
import { typeField } from "./typeField";
import { getSequenceWithinRange } from "@teselagen/range-utils";
import { getReverseComplementSequenceString } from "@teselagen/sequence-utils";

const genericAnnotationProperties = ({
  annotationType,
  noType,
  visSubmenu,
  withTags,
  withBases,
  additionalFooterEls
}) => {
  const annotationTypeUpper = upperFirst(annotationType);
  class AnnotationProperties extends React.Component {
    constructor(props) {
      super(props);
      this.commands = commands(this);
    }
    onRowSelect = ([record]) => {
      if (!record) return;
      const { dispatch, editorName } = this.props;
      dispatch({
        type: "SELECTION_LAYER_UPDATE",
        payload: record,
        meta: {
          editorName
        }
      });
    };
    render() {
      const {
        readOnly,
        annotations = {},
        annotationVisibility,
        sequenceLength,
        selectionLayer,
        sequence,
        isProtein,
        allPartTags,
        annotationPropertiesSelectedEntities:
          _annotationPropertiesSelectedEntities,
        selectedAnnotationId
      } = this.props;
      const annotationPropertiesSelectedEntities =
        _annotationPropertiesSelectedEntities.filter(a => annotations[a.id]);

      const deleteAnnotation = this.props[`delete${annotationTypeUpper}`];

      const annotationsToUse = map(annotations, annotation => {
        return {
          ...annotation,
          ...(annotation.strand === undefined && {
            strand: annotation.forward ? 1 : -1
          }),
          size: getRangeLength(annotation, sequenceLength)
        };
      });

      const keyedPartTags = getKeyedTagsAndTagOptions(allPartTags) ?? {};

      this.schema = {
        fields: [
          {
            path: "name",
            type: "string",

            render: (name, ann) => {
              const checked =
                !this.props.annotationVisibility[
                  `${annotationType}IndividualToHide`
                ][ann.id];

              return (
                <>
                  <Icon
                    data-tip="Hide/Show"
                    onClick={e => {
                      e.stopPropagation();
                      const upperType = startCase(annotationType);
                      if (checked) {
                        this.props[`hide${upperType}Individual`]([ann.id]);
                      } else {
                        this.props[`show${upperType}Individual`]([ann.id]);
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      marginRight: 4,
                      marginTop: 3,
                      color: "darkgray"
                    }}
                    icon={`eye-${checked ? "open" : "off"}`}
                  ></Icon>
                  {name}
                </>
              );
            }
          },

          ...(!withBases
            ? []
            : [
                {
                  path: "bases",
                  type: "string",
                  render: (bases, primer) => {
                    let bps = bases;
                    if (!bases) {
                      bps = getSequenceWithinRange(primer, this.props.sequence);
                      if (!primer.forward) {
                        bps = getReverseComplementSequenceString(bps);
                      }
                    }
                    return bps;
                  }
                }
              ]),
          ...(noType
            ? []
            : [
                typeField,
                {
                  path: "color",
                  type: "string",
                  width: 50,
                  render: color => {
                    return (
                      <div
                        style={{ height: 20, width: 20, background: color }}
                      />
                      // <ColorPickerPopover>
                      //   <div style={{ height: 20, width: 20, background: color }} />
                      // </ColorPickerPopover>
                    );
                  }
                }
              ]),
          sizeSchema(this.props.isProtein),
          { path: "strand", type: "number" },
          {
            path: "user.username",
            displayName: "Added By",
            width: 120,
            render: (val, row) => {
              return (
                row.user?.username || <span style={{ color: "#999" }}>-</span>
              );
            }
          },
          {
            path: "updatedAt",
            displayName: "Modified",
            width: 150,
            type: "timestamp",
            render: (val, row) => {
              if (!row.updatedAt)
                return <span style={{ color: "#999" }}>-</span>;
              return new Date(row.updatedAt).toLocaleString();
            }
          },
          {
            path: "autoAnnotationMeta",
            displayName: "Auto Annotation",
            type: "string",
            width: 160,
            render: autoAnnotationMeta => {
              if (!autoAnnotationMeta)
                return <span style={{ color: "#999" }}>-</span>;

              return (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.9em" }}>Sequence Annotate</span>
                  <Tooltip
                    content={
                      <div style={{ maxWidth: 400, padding: 8 }}>
                        <div
                          style={{
                            marginBottom: 12,
                            fontWeight: "bold",
                            fontSize: "1em",
                            borderBottom: "1px solid #ccc",
                            paddingBottom: 4
                          }}
                        >
                          Auto-Annotation Details
                        </div>

                        {/* Source Information */}
                        {(autoAnnotationMeta.sourceType ||
                          autoAnnotationMeta.sourceDescription ||
                          autoAnnotationMeta.description) && (
                          <div style={{ marginBottom: 12 }}>
                            {autoAnnotationMeta.sourceType && (
                              <div style={{ marginBottom: 4 }}>
                                <strong>Source:</strong>{" "}
                                {autoAnnotationMeta.sourceType}
                              </div>
                            )}
                            {autoAnnotationMeta.sourceDescription && (
                              <div style={{ marginBottom: 4 }}>
                                <strong>Source Description:</strong>{" "}
                                {autoAnnotationMeta.sourceDescription}
                              </div>
                            )}
                            {autoAnnotationMeta.description && (
                              <div style={{ marginBottom: 4 }}>
                                <strong>Description:</strong>{" "}
                                {autoAnnotationMeta.description}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Match Quality */}
                        {(autoAnnotationMeta.identity !== undefined ||
                          autoAnnotationMeta.mismatchCount !== undefined ||
                          autoAnnotationMeta.referenceCoverage !==
                            undefined) && (
                          <div style={{ marginBottom: 12 }}>
                            <div
                              style={{ fontWeight: "bold", marginBottom: 4 }}
                            >
                              Match Quality:
                            </div>
                            <div style={{ paddingLeft: 12 }}>
                              {autoAnnotationMeta.identity !== undefined && (
                                <div>
                                  Identity:{" "}
                                  {autoAnnotationMeta.identity.toFixed(1)}%
                                </div>
                              )}
                              {autoAnnotationMeta.mismatchCount !==
                                undefined && (
                                <div>
                                  Mismatches: {autoAnnotationMeta.mismatchCount}{" "}
                                  bp
                                </div>
                              )}
                              {autoAnnotationMeta.referenceCoverage !==
                                undefined && (
                                <div>
                                  Coverage:{" "}
                                  {autoAnnotationMeta.referenceCoverage.toFixed(
                                    1
                                  )}
                                  %
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Target Position */}
                        {(autoAnnotationMeta.start !== undefined ||
                          autoAnnotationMeta.end !== undefined) && (
                          <div style={{ marginBottom: 12 }}>
                            <div
                              style={{ fontWeight: "bold", marginBottom: 4 }}
                            >
                              Target Position:
                            </div>
                            <div style={{ paddingLeft: 12 }}>
                              {autoAnnotationMeta.start !== undefined &&
                                autoAnnotationMeta.end !== undefined && (
                                  <div>
                                    Range: {autoAnnotationMeta.start}-
                                    {autoAnnotationMeta.end}
                                  </div>
                                )}
                              {autoAnnotationMeta.strand !== undefined && (
                                <div>
                                  Strand:{" "}
                                  {autoAnnotationMeta.strand === 1
                                    ? "Forward (+)"
                                    : autoAnnotationMeta.strand === -1
                                      ? "Reverse (-)"
                                      : autoAnnotationMeta.strand}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Alignment Details */}
                        {(autoAnnotationMeta.matchLength ||
                          autoAnnotationMeta.referenceStart !== undefined) && (
                          <div>
                            <div
                              style={{ fontWeight: "bold", marginBottom: 4 }}
                            >
                              Reference Alignment:
                            </div>
                            <div style={{ paddingLeft: 12 }}>
                              {autoAnnotationMeta.matchLength && (
                                <div>
                                  Match Length: {autoAnnotationMeta.matchLength}{" "}
                                  bp
                                </div>
                              )}
                              {autoAnnotationMeta.referenceStart !==
                                undefined &&
                                autoAnnotationMeta.referenceEnd !==
                                  undefined && (
                                  <div>
                                    Position:{" "}
                                    {autoAnnotationMeta.referenceStart}-
                                    {autoAnnotationMeta.referenceEnd}
                                    {autoAnnotationMeta.referenceLength &&
                                      ` (${autoAnnotationMeta.referenceLength} bp total)`}
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    }
                    position="left"
                  >
                    <Icon
                      icon="info-sign"
                      style={{
                        color: "#2196F3",
                        cursor: "pointer"
                      }}
                    />
                  </Tooltip>
                </div>
              );
            }
          },
          ...(withTags && this.props.allPartTags
            ? [
                {
                  path: "tags",
                  type: "string",
                  getValueToFilterOn: o => {
                    const toRet = (o.tags || [])
                      .map(tagId => {
                        const tag = keyedPartTags[tagId];
                        if (!tag) return "";
                        return tag.label;
                      })
                      .join(" ");
                    return toRet;
                  },
                  render: tags => {
                    return (
                      <div style={{ display: "flex" }}>
                        {(tags || []).map((tagId, i) => {
                          const tag = keyedPartTags[tagId];
                          if (!tag) return null;
                          return <Tag key={i} {...getTagProps(tag)}></Tag>;
                        })}
                      </div>
                    );
                  }
                }
              ]
            : []),
          // Auto Annotation metadata columns (hidden by default)
          {
            path: "autoAnnotationMeta.identity",
            displayName: "Identity %",
            description:
              "Percentage of matched base pairs within the match range",
            isHidden: true,
            width: 100,
            render: (val, row) => {
              if (
                !row.autoAnnotationMeta?.identity &&
                row.autoAnnotationMeta?.identity !== 0
              )
                return <span style={{ color: "#999" }}>-</span>;
              return `${row.autoAnnotationMeta.identity.toFixed(1)}%`;
            }
          },
          {
            path: "autoAnnotationMeta.matchLength",
            displayName: "Match Length",
            description:
              "Size (bps) of the matched string (HSP) obtained by BLAST",
            isHidden: true,
            width: 110,
            render: (val, row) => {
              if (!row.autoAnnotationMeta?.matchLength)
                return <span style={{ color: "#999" }}>-</span>;
              return `${row.autoAnnotationMeta.matchLength} bp`;
            }
          },
          {
            path: "autoAnnotationMeta.mismatchCount",
            displayName: "Mismatches",
            description: "Number of mismatches within the matching range",
            isHidden: true,
            width: 100,
            render: (val, row) => {
              if (
                !row.autoAnnotationMeta?.mismatchCount &&
                row.autoAnnotationMeta?.mismatchCount !== 0
              )
                return <span style={{ color: "#999" }}>-</span>;
              return row.autoAnnotationMeta.mismatchCount;
            }
          },
          {
            path: "autoAnnotationMeta.referenceCoverage",
            displayName: "Coverage %",
            description:
              "Approximate percentage of the complete subject sequence covered by the current match. The max score (100%) is given to matches that: covers the complete subject sequence at the reference db and scores 100% identity",
            isHidden: true,
            width: 110,
            render: (val, row) => {
              if (
                !row.autoAnnotationMeta?.referenceCoverage &&
                row.autoAnnotationMeta?.referenceCoverage !== 0
              )
                return <span style={{ color: "#999" }}>-</span>;
              return `${row.autoAnnotationMeta.referenceCoverage.toFixed(1)}%`;
            }
          },
          {
            path: "autoAnnotationMeta.start",
            displayName: "Target Start",
            description: "Start position of the match in the target sequence",
            isHidden: true,
            width: 100,
            render: (val, row) => {
              if (
                !row.autoAnnotationMeta?.start &&
                row.autoAnnotationMeta?.start !== 0
              )
                return <span style={{ color: "#999" }}>-</span>;
              return row.autoAnnotationMeta.start;
            }
          },
          {
            path: "autoAnnotationMeta.end",
            displayName: "Target End",
            description: "End position of the match in the target sequence",
            isHidden: true,
            width: 100,
            render: (val, row) => {
              if (
                !row.autoAnnotationMeta?.end &&
                row.autoAnnotationMeta?.end !== 0
              )
                return <span style={{ color: "#999" }}>-</span>;
              return row.autoAnnotationMeta.end;
            }
          },
          {
            path: "autoAnnotationMeta.referenceStart",
            displayName: "Reference Start",
            isHidden: true,
            width: 90,
            render: (val, row) => {
              if (
                !row.autoAnnotationMeta?.referenceStart &&
                row.autoAnnotationMeta?.referenceStart !== 0
              )
                return <span style={{ color: "#999" }}>-</span>;
              return row.autoAnnotationMeta.referenceStart;
            }
          },
          {
            path: "autoAnnotationMeta.referenceEnd",
            displayName: "Reference End",
            isHidden: true,
            width: 90,
            render: (val, row) => {
              if (
                !row.autoAnnotationMeta?.referenceEnd &&
                row.autoAnnotationMeta?.referenceEnd !== 0
              )
                return <span style={{ color: "#999" }}>-</span>;
              return row.autoAnnotationMeta.referenceEnd;
            }
          },
          {
            path: "autoAnnotationMeta.referenceLength",
            displayName: "Reference Length",
            description:
              "Total size (bps) of the matched reference sequence (subject) in the source database",
            isHidden: true,
            width: 100,
            render: (val, row) => {
              if (!row.autoAnnotationMeta?.referenceLength)
                return <span style={{ color: "#999" }}>-</span>;
              return `${row.autoAnnotationMeta.referenceLength} bp`;
            }
          },
          {
            path: "autoAnnotationMeta.sourceType",
            displayName: "Source Type",
            description: "Type of the reference database",
            isHidden: true,
            width: 150,
            render: (val, row) => {
              if (!row.autoAnnotationMeta?.sourceType)
                return <span style={{ color: "#999" }}>-</span>;
              // Format the source type for better display
              return row.autoAnnotationMeta.sourceType
                .replace(/reference_database-/gi, "")
                .replace(/_/g, " ")
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            }
          },
          {
            path: "autoAnnotationMeta.sourceDescription",
            displayName: "Source Description",
            description: "An additional description of the reference database",
            isHidden: true,
            width: 200,
            render: (val, row) => {
              if (!row.autoAnnotationMeta?.sourceDescription)
                return <span style={{ color: "#999" }}>-</span>;
              return row.autoAnnotationMeta.sourceDescription;
            }
          },
          // Updated By column (hidden by default)
          {
            path: "updatedByUser.username",
            displayName: "Updated By",
            isHidden: true,
            width: 120,
            render: (val, row) => {
              return (
                row.updatedByUser?.username || (
                  <span style={{ color: "#999" }}>-</span>
                )
              );
            }
          }
        ]
      };

      return (
        <DataTable
          withDisplayOptions
          topLeftItems={getVisFilter(
            createCommandMenu(
              isFunction(visSubmenu) ? visSubmenu(this.props) : visSubmenu,
              this.commands,
              {
                useTicks: true
              }
            )
          )}
          annotationPropertiesSelectedEntities={
            annotationPropertiesSelectedEntities
          }
          leftOfSearchBarItems={
            <>
              {!readOnly && (
                <ButtonGroup style={{ marginTop: 3, marginRight: 4 }}>
                  <Tooltip
                    position="top"
                    modifiers={popoverOverflowModifiers}
                    content="New"
                  >
                    <AnchorButton
                      disabled={!sequenceLength}
                      icon="plus"
                      className="tgNewAnnBtn"
                      onClick={() => {
                        showAddOrEditAnnotationDialog({
                          type: annotationType,
                          annotation: pick(
                            selectionLayer,
                            "start",
                            "end",
                            "forward"
                          )
                        });
                      }}
                    ></AnchorButton>
                  </Tooltip>
                  <Tooltip
                    position="top"
                    modifiers={popoverOverflowModifiers}
                    content="Edit"
                  >
                    <AnchorButton
                      onClick={() => {
                        showAddOrEditAnnotationDialog({
                          type: annotationType,
                          annotation: annotationPropertiesSelectedEntities[0]
                        });
                      }}
                      disabled={
                        annotationPropertiesSelectedEntities.length !== 1
                      }
                      icon="edit"
                    ></AnchorButton>
                  </Tooltip>

                  {["feature"].includes(annotationType) && (
                    <CmdButton
                      text=""
                      icon="cog"
                      data-tip="Configure Feature Types"
                      cmd={this.commands.onConfigureFeatureTypesClick}
                    />
                  )}
                  {["part", "primer", "feature"].includes(annotationType) && (
                    <CmdButton
                      text=""
                      icon={removeDuplicatesIcon}
                      data-tip="Remove Duplicates"
                      cmd={
                        this.commands[
                          `showRemoveDuplicatesDialog${
                            annotationTypeUpper + "s"
                          }`
                        ]
                      }
                    />
                  )}

                  {additionalFooterEls && additionalFooterEls(this.props)}
                  <Tooltip
                    position="top"
                    modifiers={popoverOverflowModifiers}
                    content="Delete"
                  >
                    <AnchorButton
                      onClick={() => {
                        deleteAnnotation(annotationPropertiesSelectedEntities);
                      }}
                      className="tgDeleteAnnsBtn"
                      intent="danger"
                      disabled={!annotationPropertiesSelectedEntities.length}
                      icon="trash"
                    ></AnchorButton>
                  </Tooltip>
                </ButtonGroup>
              )}
              {/* {createCommandMenu(
                  {
                    cmd: "featureFilterIndividualCmd",
                    // text: 'hahah',
                    shouldDismissPopover: false
                  },
                  this.commands,
                  {
                    useTicks: true
                  }
                )} */}
              {/* <CmdCheckbox
                  prefix="Show "
                  cmd={this.commands.featureFilterIndividualCmd}
                /> */}
            </>
          }
          onDoubleClick={annotation => {
            showAddOrEditAnnotationDialog({
              type: annotationType,
              annotation
            });
          }}
          withCheckboxes
          showFeatureIndividual={this.props.showFeatureIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          hideFeatureIndividual={this.props.hideFeatureIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          showPartIndividual={this.props.showPartIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          hidePartIndividual={this.props.hidePartIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          showPrimerIndividual={this.props.showPrimerIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          hidePrimerIndividual={this.props.hidePrimerIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          annotationVisibility={annotationVisibility} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          featureLengthsToHide={this.props.featureLengthsToHide} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          primerLengthsToHide={this.props.primerLengthsToHide} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          partLengthsToHide={this.props.partLengthsToHide} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          sequence={sequence} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
          noPadding
          noFullscreenButton
          onRowSelect={this.onRowSelect}
          selectedIds={selectedAnnotationId}
          formName="annotationProperties"
          noRouter
          isProtein={isProtein}
          compact
          isInfinite
          schema={this.schema}
          entities={annotationsToUse}
        />
      );
    }
  }

  return compose(
    connectToEditor(
      ({
        readOnly,
        annotationVisibility = {},
        sequenceData,
        selectionLayer,
        featureLengthsToHide,
        primerLengthsToHide,
        partLengthsToHide
      }) => {
        return {
          annotationVisibility,
          selectionLayer,
          readOnly,
          featureLengthsToHide,
          primerLengthsToHide,
          partLengthsToHide,
          sequenceData,
          sequence: sequenceData.sequence,
          annotations: sequenceData[annotationType + "s"],
          [annotationType + "s"]: sequenceData[annotationType + "s"],
          sequenceLength: sequenceData.sequence.length
        };
      }
    ),
    // withEditorProps,
    withSelectedEntities("annotationProperties")
  )(AnnotationProperties);
};

export default genericAnnotationProperties;

// const ColorPickerPopover = ({ readOnly, onColorSelect, children }) => {
//   return (
//     <Popover
//       disabled={readOnly}
//       content={<ColorPicker onColorSelect={onColorSelect} />}
//     >
//       {children}
//     </Popover>
//   );
// };

export function getVisFilter(submenu) {
  return (
    <DropdownButton
      style={{ marginTop: 3 }}
      icon="eye-open"
      className="propertiesVisFilter"
      data-tip="Visibility Filter"
      menu={<Menu>{submenu}</Menu>}
    ></DropdownButton>
  );
}

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
  removeDuplicatesIcon,
  useMemoDeepEqual
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
import pluralize from "pluralize";
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
  const AnnotationProperties = props => {
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
      selectedAnnotationId,
      PropertiesProps,
      dispatch,
      editorName
    } = props;

    // We need to keep a ref to the props so that the commands factory (old code) works
    const instanceRef = React.useRef({ props });
    instanceRef.current.props = props;
    const cmds = React.useMemo(() => commands(instanceRef.current), []);

    const onRowSelect = React.useCallback(
      ([record]) => {
        if (!record) return;
        dispatch({
          type: "SELECTION_LAYER_UPDATE",
          payload: record,
          meta: {
            editorName
          }
        });
      },
      [dispatch, editorName]
    );

    const annotationPropertiesSelectedEntities =
      _annotationPropertiesSelectedEntities.filter(a => annotations[a.id]);

    const deleteAnnotation = props[`delete${annotationTypeUpper}`];

    const annotationsToUse = React.useMemo(
      () =>
        map(annotations, annotation => {
          return {
            ...annotation,
            ...(annotation.strand === undefined && {
              strand: annotation.forward ? 1 : -1
            }),
            size: getRangeLength(annotation, sequenceLength)
          };
        }),
      [annotations, sequenceLength]
    );

    const keyedPartTags = getKeyedTagsAndTagOptions(allPartTags) ?? {};
    const additionalColumns =
      PropertiesProps?.propertiesList?.find(
        p => (p.name || p) === (pluralize(annotationType) || "")
      )?.additionalColumns || [];

    const schema = useMemoDeepEqual(
      () => ({
        fields: [
          {
            path: "name",
            type: "string",
            render: (name, ann) => {
              const checked =
                !annotationVisibility[`${annotationType}IndividualToHide`][
                  ann.id
                ];

              return (
                <>
                  <Icon
                    data-tip="Hide/Show"
                    onClick={e => {
                      e.stopPropagation();
                      const upperType = startCase(annotationType);
                      if (checked) {
                        props[`hide${upperType}Individual`]([ann.id]);
                      } else {
                        props[`show${upperType}Individual`]([ann.id]);
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
                      bps = getSequenceWithinRange(primer, sequence);
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
          sizeSchema(isProtein),
          ...(withTags && allPartTags
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
          { path: "strand", type: "number" },
          ...additionalColumns
        ]
      }),
      [
        additionalColumns,
        allPartTags,
        annotationVisibility,
        isProtein,
        keyedPartTags,
        sequence
      ]
    );

    return (
      <DataTable
        topLeftItems={getVisFilter(
          createCommandMenu(
            isFunction(visSubmenu) ? visSubmenu(props) : visSubmenu,
            cmds,
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
                    disabled={annotationPropertiesSelectedEntities.length !== 1}
                    icon="edit"
                  ></AnchorButton>
                </Tooltip>

                {["feature"].includes(annotationType) && (
                  <CmdButton
                    text=""
                    icon="cog"
                    data-tip="Configure Feature Types"
                    cmd={cmds.onConfigureFeatureTypesClick}
                  />
                )}
                {["part", "primer", "feature"].includes(annotationType) && (
                  <CmdButton
                    text=""
                    icon={removeDuplicatesIcon}
                    data-tip="Remove Duplicates"
                    cmd={
                      cmds[
                        `showRemoveDuplicatesDialog${annotationTypeUpper + "s"}`
                      ]
                    }
                  />
                )}

                {additionalFooterEls && additionalFooterEls(props)}
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
                cmds,
                {
                  useTicks: true
                }
              )} */}
            {/* <CmdCheckbox
                prefix="Show "
                cmd={cmds.featureFilterIndividualCmd}
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
        showFeatureIndividual={props.showFeatureIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        hideFeatureIndividual={props.hideFeatureIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        showPartIndividual={props.showPartIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        hidePartIndividual={props.hidePartIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        showPrimerIndividual={props.showPrimerIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        hidePrimerIndividual={props.hidePrimerIndividual} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        annotationVisibility={annotationVisibility} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        featureLengthsToHide={props.featureLengthsToHide} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        primerLengthsToHide={props.primerLengthsToHide} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        partLengthsToHide={props.partLengthsToHide} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        sequence={sequence} //we need to pass this in order to force the DT to rerenderannotationVisibility={annotationVisibility}
        noPadding
        noFullscreenButton
        onRowSelect={onRowSelect}
        selectedIds={selectedAnnotationId}
        formName="annotationProperties"
        noRouter
        isProtein={isProtein}
        compact
        isInfinite
        withDisplayOptions
        schema={schema}
        entities={annotationsToUse}
      />
    );
  };

  return compose(
    connectToEditor(
      (
        {
          readOnly,
          annotationVisibility = {},
          sequenceData,
          selectionLayer,
          featureLengthsToHide,
          primerLengthsToHide,
          partLengthsToHide,
          PropertiesProps
        },
        ownProps
      ) => {
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
          sequenceLength: sequenceData.sequence.length,
          PropertiesProps: ownProps.PropertiesProps || PropertiesProps
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

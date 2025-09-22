import React from "react";
import {
  DataTable,
  withSelectedEntities,
  createCommandMenu
} from "@teselagen-biotech/ui";
import { map } from "lodash-es";
// import { Button } from "@blueprintjs/core";
import { getRangeLength } from "@teselagen-biotech/range-utils";
import { getOrfColor } from "../../constants/orfFrameToColorMap";
import { connectToEditor } from "../../withEditorProps";
import { compose } from "recompose";
import selectors from "../../selectors";

import getCommands from "../../commands";
import { sizeSchema } from "./utils";
import { orfsSubmenu } from "../../MenuBar/viewSubmenu";
import { getVisFilter } from "./GenericAnnotationProperties";

class OrfProperties extends React.Component {
  constructor(props) {
    super(props);
    this.commands = getCommands(this);
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
    const { orfs, sequenceLength, annotationVisibility } = this.props;
    const orfsToUse = map(orfs, orf => {
      return {
        ...orf,
        color: getOrfColor(orf),
        frame: orf.frame + 1,
        ...(orf.strand === undefined && {
          strand: orf.forward ? 1 : -1
        }),
        size: getRangeLength(orf, sequenceLength),
        sizeAa: Math.floor(getRangeLength(orf, sequenceLength) / 3 - 1)
      };
    });
    return (
      <React.Fragment>
        <DataTable
          topLeftItems={getVisFilter(
            createCommandMenu(orfsSubmenu, this.commands, {
              useTicks: true
            })
          )}
          annotationVisibility={annotationVisibility} //we need to pass this in order to force the DT to rerender
          noPadding
          noFullscreenButton
          onRowSelect={this.onRowSelect}
          withSearch={false}
          formName="orfProperties"
          noRouter
          compact
          isInfinite
          schema={{
            fields: [
              {
                path: "color",
                type: "string",
                render: color => {
                  return (
                    <div style={{ height: 20, width: 20, background: color }} />
                  );
                }
              },
              {
                path: "sizeAa",
                displayName: "Size (aa)",
                type: "number"
              },
              sizeSchema(this.props.isProtein),
              { path: "frame", type: "number" },
              { path: "strand", type: "number" }
            ]
          }}
          entities={orfsToUse}
        />
        <br />
      </React.Fragment>
    );
  }
}

export default compose(
  connectToEditor(editorState => {
    const {
      readOnly,
      annotationVisibility = {},
      sequenceData: { sequence = "" } = {},
      sequenceData,
      minimumOrfSize,
      useAdditionalOrfStartCodons
    } = editorState;
    return {
      readOnly,
      annotationVisibility,
      useAdditionalOrfStartCodons,
      orfs: selectors.orfsSelector(editorState),
      sequenceLength: sequence.length,
      sequenceData,
      minimumOrfSize
    };
  }),
  withSelectedEntities("orfProperties")
)(OrfProperties);

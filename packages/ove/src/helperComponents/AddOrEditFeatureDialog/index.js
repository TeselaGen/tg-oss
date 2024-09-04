import React from "react";
import {
  getFeatureToColorMap,
  getFeatureTypes
} from "@teselagen/sequence-utils";

import AddOrEditAnnotationDialog from "../AddOrEditAnnotationDialog";
import { ReactSelectField } from "@teselagen/ui";

const RenderTypes = ({ readOnly, type }) => (
  <ReactSelectField
    inlineLabel
    tooltipError
    disabled={readOnly}
    defaultValue={type ?? "misc_feature"}
    options={getFeatureTypes().map(featureType => {
      return {
        label: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: 10
            }}
          >
            <div
              style={{
                background: getFeatureToColorMap({ includeHidden: true })[
                  featureType
                ],
                height: 15,
                width: 15,
                marginRight: 5
              }}
            />
            {featureType}
          </div>
        ),
        value: featureType
      };
    })}
    name="type"
    label="Type"
  />
);

export default AddOrEditAnnotationDialog({
  formName: "AddOrEditFeatureDialog",
  dialogProps: {
    // height: 500,
    width: 400
  },
  getProps: props => ({
    upsertAnnotation: props.upsertFeature,
    // renderLocations: true, //tnw enable this eventually for proteins
    renderLocations: !props.sequenceData.isProtein,
    RenderTypes,
    annotationTypePlural: "features"
  })
});

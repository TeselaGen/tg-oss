import { omit } from "lodash";

import cleanUpTeselagenJsonForExport from "./utils/cleanUpTeselagenJsonForExport";
import { tidyUpSequenceData } from "@teselagen/sequence-utils";

/**
 * @param {*} incomingJson
 * @returns a sequence json cleaned up and converted to a string with extranous fields ommited
 */
export default function jsonToJsonString(incomingJson) {
  return JSON.stringify(
    omit(
      cleanUpTeselagenJsonForExport(
        tidyUpSequenceData(incomingJson, { annotationsAsObjects: false })
      ),
      [
        "sequenceFragments",
        "sequenceFeatures",
        "cutsites",
        "orfs",
        "filteredParts",
        "filteredFeatures"
      ]
    )
  );
}

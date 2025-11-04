import shortid from "shortid";
import circularSelector from "./circularSelector";
import sequenceSelector from "./sequenceSelector";
import restrictionEnzymesSelector from "./restrictionEnzymesSelector";
import cutsiteLabelColorSelector from "./cutsiteLabelColorSelector";
import { createSelector } from "reselect";
import { isEqual } from "lodash-es";

import { flatMap as flatmap, map } from "lodash-es";
import { getCutsitesFromSequence } from "@teselagen/sequence-utils";
import { getLowerCaseObj } from "../utils/arrayUtils";

// [{ args: {sequence,circular,enzymeList,cutsiteLabelColors}, result }]
const cutsitesCache = [];

function getCachedResult(argsObj) {
  const idx = cutsitesCache.findIndex(
    entry =>
      entry &&
      isEqual(entry.args, argsObj)
  );
  if (idx === -1) return;
  const hit = cutsitesCache[idx];
  return hit.result;
}

function setCachedResult(
  argsObj,
  result,
  cacheSize = 1
) {
  cutsitesCache.push({
    args: argsObj,
    result
  });
  //keep cache size manageable
  if (cutsitesCache.length > cacheSize) cutsitesCache.shift();
}

function cutsitesSelector(
  sequence,
  circular,
  enzymeList,
  cutsiteLabelColors,
  editorSize = 1
) {
  const cachedResult = getCachedResult({
    sequence,
    circular,
    enzymeList,
    cutsiteLabelColors
  });
  if (cachedResult) {
    return cachedResult;
  }
  //get the cutsites grouped by enzyme
  const cutsitesByName = getLowerCaseObj(
    getCutsitesFromSequence(sequence, circular, map(enzymeList))
  );
  //tag each cutsite with a unique id
  const cutsitesById = {};
  Object.keys(cutsitesByName).forEach(function (enzymeName) {
    const cutsitesForEnzyme = cutsitesByName[enzymeName];
    cutsitesForEnzyme.forEach(function (cutsite) {
      const numberOfCuts = cutsitesByName[enzymeName].length;
      const uniqueId = shortid();
      cutsite.id = uniqueId;
      cutsite.numberOfCuts = numberOfCuts;
      cutsite.annotationType = "cutsite";
      cutsitesById[uniqueId] = cutsite;
      const mergedCutsiteColors = Object.assign(
        { single: "salmon", double: "lightblue", multi: "lightgrey" },
        cutsiteLabelColors
      );
      if (numberOfCuts === 1) {
        cutsite.labelColor = mergedCutsiteColors.single;
        cutsite.labelClassname = "singleCutter";
      } else if (numberOfCuts === 2) {
        cutsite.labelColor = mergedCutsiteColors.double;
        cutsite.labelClassname = "doubleCutter";
      } else {
        cutsite.labelColor = mergedCutsiteColors.multi;
        cutsite.labelClassname = "multiCutter";
      }
    });
  });
  // create an array of the cutsites
  const cutsitesArray = flatmap(cutsitesByName, function (cutsitesForEnzyme) {
    return cutsitesForEnzyme;
  });
  const result = {
    cutsitesByName,
    cutsitesById,
    cutsitesArray
  };
  setCachedResult(
    {
      sequence,
      circular,
      enzymeList,
      cutsiteLabelColors
    },
    result,
    editorSize
  );
  return result;
}

export default createSelector(
  sequenceSelector,
  circularSelector,
  restrictionEnzymesSelector,
  cutsiteLabelColorSelector,
  editorState => editorState.editorSize,
  cutsitesSelector
);

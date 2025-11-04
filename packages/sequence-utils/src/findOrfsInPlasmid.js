import getOrfsFromSequence from "./getOrfsFromSequence.js";
import { isEqual } from "lodash-es";

const orfsCache = [];

function getCachedResult(argsObj) {
  const idx = orfsCache.findIndex(
    entry =>
      entry &&
      isEqual(entry.args, argsObj)
  );
  if (idx === -1) return;
  const hit = orfsCache[idx];
  return hit.result;
}

function setCachedResult(
  argsObj,
  result,
  cacheSize = 1
) {
  orfsCache.push({
    args: argsObj,
    result
  });
  //keep cache size manageable
  if (orfsCache.length > cacheSize) orfsCache.shift();
}

export default function findOrfsInPlasmid(
  sequence,
  circular,
  minimumOrfSize,
  useAdditionalOrfStartCodons,
  editorSize = 1
) {
  const cachedResult = getCachedResult(
    {
    sequence,
    circular,
    minimumOrfSize,
    useAdditionalOrfStartCodons
  }
  );
  if (cachedResult) {
    return cachedResult;
  }
  //tnr, we should do the parsing down of the orfs immediately after they're returned from this sequence
  // const orfs1Forward = eliminateCircularOrfsThatOverlapWithNonCircularOrfs(getOrfsFromSequence(0, doubleForwardSequence, minimumOrfSize, true), maxLength);
  const forwardOrfs = getOrfsFromSequence({
    sequence: sequence,
    minimumOrfSize: minimumOrfSize,
    forward: true,
    circular: circular,
    useAdditionalOrfStartCodons
  });
  const reverseOrfs = getOrfsFromSequence({
    sequence: sequence,
    minimumOrfSize: minimumOrfSize,
    forward: false,
    circular: circular,
    useAdditionalOrfStartCodons
  });

  const allOrfs = forwardOrfs.concat(reverseOrfs);

  setCachedResult(
    {
      sequence,
      circular,
      minimumOrfSize,
      useAdditionalOrfStartCodons
    },
    allOrfs,
    editorSize
  );
  return allOrfs;
}

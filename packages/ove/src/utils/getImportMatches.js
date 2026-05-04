import {
  findApproxMatches,
  getSequenceDataBetweenRange
} from "@teselagen/sequence-utils";
import { forEach } from "lodash-es";
import shortid from "shortid";
import { MAX_MATCHES_DISPLAYED } from "../constants/findToolConstants";

export default function getImportMatches({
  sourceSequences,
  destinationSequenceData,
  isFlexible,
  matchThreshold,
  minImportSize
}) {
  const newAnnotations = [];
  const duplicateAnnotations = [];
  if (!sourceSequences.length || !destinationSequenceData)
    return { newAnnotations, duplicateAnnotations };

  const typesToImport = ["features", "parts", "primers"];
  const destSeq = destinationSequenceData.sequence;
  const destIsCircular = destinationSequenceData.circular;

  // Pre-calculate existing annotations to check for duplicates
  const existingAnnotations = {};
  forEach(typesToImport, type => {
    existingAnnotations[type] = [];
    forEach(destinationSequenceData[type], ann => {
      existingAnnotations[type].push({
        start: ann.start,
        end: ann.end,
        type: ann.type
      });
    });
  });

  for (const sourceSequenceData of sourceSequences) {
    for (const type of typesToImport) {
      const annotations = sourceSequenceData[type] || [];
      for (const ann of annotations) {
        if (
          newAnnotations.length + duplicateAnnotations.length >=
          MAX_MATCHES_DISPLAYED
        )
          break;
        // Extract sequence for this annotation from source
        const annSeqData = getSequenceDataBetweenRange(sourceSequenceData, ann);
        const annSeq = annSeqData.sequence;

        if (!annSeq || annSeq.length < minImportSize) continue;

        const maxMismatches = isFlexible
          ? Math.floor(annSeq.length * (1 - matchThreshold / 100))
          : 0;

        // Find matches in destination
        const matches = findApproxMatches(
          annSeq,
          destSeq,
          maxMismatches,
          destIsCircular,
          MAX_MATCHES_DISPLAYED -
            (newAnnotations.length + duplicateAnnotations.length)
        );

        forEach(matches, match => {
          if (
            newAnnotations.length + duplicateAnnotations.length >=
            MAX_MATCHES_DISPLAYED
          )
            return;
          // Filter out features < 5 bps in length (and as mismatches increases, < 5bps - # mismatches)
          // We want at least 5 base pairs to match
          if (annSeq.length - match.numMismatches < 5) return;

          const start = match.index;
          const end = (match.index + annSeq.length - 1) % destSeq.length;

          // Check for duplicates
          const isDuplicate = existingAnnotations[type].some(
            existing =>
              existing.start === start &&
              existing.end === end &&
              (type !== "features" || existing.type === ann.type)
          );

          const result = {
            ...ann,
            id: shortid(),
            sourceId: ann.id,
            sourceName: sourceSequenceData.name,
            start,
            end,
            annotationType: type.slice(0, -1), // singular: feature, part, primer
            numMismatches: match.numMismatches,
            matchPercent: Math.round(
              ((annSeq.length - match.numMismatches) / annSeq.length) * 100
            )
          };

          if (isDuplicate) {
            duplicateAnnotations.push(result);
          } else {
            newAnnotations.push(result);
          }
        });
      }
      if (
        newAnnotations.length + duplicateAnnotations.length >=
        MAX_MATCHES_DISPLAYED
      )
        break;
    }
    if (
      newAnnotations.length + duplicateAnnotations.length >=
      MAX_MATCHES_DISPLAYED
    )
      break;
  }

  return { newAnnotations, duplicateAnnotations };
}

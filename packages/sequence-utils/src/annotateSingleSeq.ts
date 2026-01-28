import { autoAnnotate } from "./autoAnnotate";
import { SequenceData } from "./types";

function annotateSingleSeq({
  fullSeq,
  searchSeq
}: {
  fullSeq: SequenceData;
  searchSeq: SequenceData;
}) {
  const fullSeqId = fullSeq.id || "fullSeqId";
  const searchSeqId = searchSeq.id || "searchSeqId";
  const results = autoAnnotate({
    seqsToAnnotateById: {
      [fullSeqId]: {
        sequence: fullSeq.sequence,
        circular: fullSeq.circular,
        annotations: fullSeq.features || []
      }
    },
    annotationsToCheckById: {
      [searchSeqId]: {
        ...searchSeq,
        id: searchSeqId
      }
    },
    compareName: false
  });
  if (results && results[fullSeqId]) {
    return {
      matches: results[fullSeqId]
    };
  } else {
    return { matches: [] };
  }
}
export default annotateSingleSeq;

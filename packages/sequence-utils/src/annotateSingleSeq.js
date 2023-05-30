const { autoAnnotate } = require("./autoAnnotate");

function annotateSingleSeq({ fullSeq, searchSeq }) {
  const fullSeqId = fullSeq.id || "fullSeqId";
  const searchSeqId = searchSeq.id || "searchSeqId";
  const results = autoAnnotate({
    seqsToAnnotateById: {
      [fullSeqId]: {
        ...fullSeq,
        id: fullSeqId
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
module.exports = annotateSingleSeq;

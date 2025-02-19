// export default {
//   sequence: 'aaa',
//   parts: [{name: 'hello there', start: 0,end:3, id: '1241i'}],
//   features: [{name: 'oh hi', start: 0,end:3, id: '12kkoo'}],
// }

import { convertBasePosTraceToPerBpTrace } from "@teselagen/bio-parsers";

const exampleSequenceData = {
  name: "example",
  sequence: "ACGGTT",
  circular: false,
  extraLines: [],
  type: "DNA",
  size: 5299,
  id: "jdosjio81",
  chromatogramData: {
    //       |  A     |  C     |  G     |  G     |  T     |  T     |
    aTrace: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    cTrace: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    gTrace: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    tTrace: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    basePos: [1, 4, 7, 10, 13, 16],
    baseCalls: ["A", "C", "G", "G", "T", "T"],
    qualNums: [0.1, 0.2, 0.3, 0.3, 0.4, 0.4]
  }
};

const scaleFactor = 200;
// Here we scale the peaks to be more pronounced
exampleSequenceData.chromatogramData.aTrace =
  exampleSequenceData.chromatogramData.aTrace.map(peak => peak * scaleFactor);
exampleSequenceData.chromatogramData.cTrace =
  exampleSequenceData.chromatogramData.cTrace.map(peak => peak * scaleFactor);
exampleSequenceData.chromatogramData.gTrace =
  exampleSequenceData.chromatogramData.gTrace.map(peak => peak * scaleFactor);
exampleSequenceData.chromatogramData.tTrace =
  exampleSequenceData.chromatogramData.tTrace.map(peak => peak * scaleFactor);

exampleSequenceData.chromatogramData = convertBasePosTraceToPerBpTrace(
  exampleSequenceData.chromatogramData
);

export default exampleSequenceData;

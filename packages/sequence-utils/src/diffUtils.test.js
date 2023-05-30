const chai = require("chai");
const assert = require("assert");
const { map } = require("lodash");
const tidyUpSequenceData = require("./tidyUpSequenceData");
const {
  getDiffFromSeqs,
  patchSeqWithDiff,
  reverseSeqDiff
} = require("./diffUtils");

chai.should();
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);

describe("getDiffFromSeqs patchSeqWithDiff reverseSeqDiff", function() {
  it("ignores translation amino acids, cutsites, orfs, filteredFeatures, and works as expected", function() {
    let originalSeq = tidyUpSequenceData(
      {
        sequence: "atagatagatagatagatagatagatagatagatagatagatagatagatagatag",
        translations: [{ id: 10, start: 10, end: 24 }],
        features: [],
        cutsites: [{ name: "fakeSite" }],
        orfs: [{ name: "fakeOrf", start: 10, end: 20 }],
        filteredFeatures: [{ name: "filteredFeat1" }]
      },
      { annotationsAsObjects: true }
    );

    let alteredSeq = tidyUpSequenceData(
      {
        sequence: "agatagatagatagatagatagatagatagatagatagatagatagatagatag",
        translations: [
          { id: 10, start: 13, end: 24 },
          { id: "awgwtwt", start: 3, end: 20, translationType: "CDS Feature" }
        ],
        cutsites: [{ name: "fakeSite" }],
        orfs: [],
        features: [{ name: "I'm new!", start: 30, end: 35 }],
        filteredFeatures: [{ name: "filteredFeat1" }]
      },
      { annotationsAsObjects: true }
    );

    const diff = getDiffFromSeqs(originalSeq, alteredSeq);
    assert(
      !JSON.stringify(diff, null, 4).includes("aminoAcids"),
      "Diffs should not include aminoAcids!"
    );
    assert(
      !JSON.stringify(diff, null, 4).includes("cutsites"),
      "Diffs should not include cutsites!"
    );
    assert(
      !JSON.stringify(diff, null, 4).includes("translationType"),
      "Diffs should not include non-user-created translations!"
    );
    //get the altered seq from the original by applying the diff between the two
    const alteredSeqFromOriginalPatchedWithDiff = patchSeqWithDiff(
      originalSeq,
      diff
    );
    //the altered seq should have the expected features
    map(alteredSeqFromOriginalPatchedWithDiff.features).should.containSubset([
      {
        name: "I'm new!",
        start: 30,
        end: 35
      }
    ]);
    //get the original back from the altered by using the reversed diff
    const originalSeqFromAlteredAndReversedDiff = patchSeqWithDiff(
      alteredSeq,
      reverseSeqDiff(diff)
    );
    //it should have no features!
    map(originalSeqFromAlteredAndReversedDiff.features).length.should.equal(0);
  });
});

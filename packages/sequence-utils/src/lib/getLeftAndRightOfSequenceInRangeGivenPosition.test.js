

import chai from "chai";

chai.should();
import cutSequenceByRestrictionEnzyme from "./cutSequenceByRestrictionEnzyme.js";
import enzymeList from "./aliasedEnzymesByName";
import getLeftAndRightOfSequenceInRangeGivenPosition from "./getLeftAndRightOfSequenceInRangeGivenPosition";
describe("getLeftAndRightOfSequenceInRangeGivenPosition", () => {
  it("gets the left and right of the range correctly given a position inside the range", () => {
    const sequence = "aaaaaaaaaattttttttttgggggggggg";
    const result = getLeftAndRightOfSequenceInRangeGivenPosition(
      { start: 9, end: 20 },
      10,
      sequence
    );
    result.leftHandSide.should.equal("a");
    result.rightHandSide.should.equal("ttttttttttg");
  });

  it("gets the left and right of the range correctly given a position outside the range", () => {
    const sequence = "aaaaaaaaaattttttttttgggggggggg";
    const result = getLeftAndRightOfSequenceInRangeGivenPosition(
      { start: 9, end: 20 },
      6,
      sequence
    );
    result.leftHandSide.should.equal("");
    result.rightHandSide.should.equal("attttttttttg");
  });

  it("gets the left and right of the range correctly given a position outside the range", () => {
    const sequence = "aaaaaaaaaattttttttttgggggggggg";
    const result = getLeftAndRightOfSequenceInRangeGivenPosition(
      { start: 9, end: 20 },
      24,
      sequence
    );
    result.leftHandSide.should.equal("attttttttttg");
    result.rightHandSide.should.equal("");
  });

  //bamhi
  // "bamhi": {
  //     "name": "bamhi",
  //     "site": "ggatcc",
  //     "forwardRegex": "g{2}atc{2}",
  //     "reverseRegex": "g{2}atc{2}",
  //     "topSnipOffset": 1,
  //     "bottomSnipOffset": 5
  // },
  it("cuts a single circular cutsite", () => {
    const sequence = "ccrrrrggat";
    const cutsites = cutSequenceByRestrictionEnzyme(
      sequence,
      true,
      enzymeList["bamhi"]
    );
    const cutsite = cutsites[0];
    const result = getLeftAndRightOfSequenceInRangeGivenPosition(
      cutsite.recognitionSiteRange,
      cutsite.topSnipPosition,
      sequence
    );
    result.leftHandSide.should.equal("g");
    result.rightHandSide.should.equal("gatcc");
    //
    // //
    // cutsites.should.be.an("array");
    // cutsites.length.should.equal(1);
    // cutsites[0].start.should.equal(6);
    // cutsites[0].end.should.equal(1);
    // cutsites[0].recognitionSiteRange.start.should.equal(6);
    // cutsites[0].recognitionSiteRange.end.should.equal(1);
    // cutsites[0].topSnipPosition.should.equal(7);
    // cutsites[0].bottomSnipPosition.should.equal(1);
    // should.not.exist(cutsites[0].upstreamTopSnip);
    // should.not.exist(cutsites[0].upstreamBottomSnip);
  });
});

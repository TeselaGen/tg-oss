/* eslint-disable no-unused-expressions */
import chai from "chai";

chai.should();
import getDigestFragmentsForRestrictionEnzymes from "./getDigestFragmentsForRestrictionEnzymes.js";
import enzymeList from "./aliasedEnzymesByName";
describe("getDigestFragmentsForRestrictionEnzymes", () => {
  //bamhi
  // "bamhi": {
  //     "name": "bamhi",
  //     "site": "ggatcdc",
  //     "forwardRegex": "g{2}atc{2}",
  //     "reverseRegex": "g{2}atc{2}",
  //     "topSnipOffset": 1,
  //     "bottomSnipOffset": 5
  // },
  // ATGATCAGA
  // 012345678
  it("returns 0 digestFragments for a linear seq with no cutsites", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "rrrrrrrrr",
      false,
      enzymeList["bsai"]
    );
    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(0);
  });
  it("returns 0 digestFragments for a circular seq with no cutsites", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "rrrrrrrrrrrr",
      false,
      enzymeList["bsai"]
    );
    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(0);
  });
  it("gets digestFragments for a single type 2s cutsite cutting in a linear sequence", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "tagagtagagtagaGGTCTCgtagagtagagtagag",
      false,
      enzymeList["bsai"]
    );
    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(2);
    digestFragments[0].start.should.equal(0);
    digestFragments[0].end.should.equal(20);

    digestFragments[0].cut1.overhangSize.should.equal(0);
    digestFragments[0].cut1.isOverhangIncludedInFragmentSize.should.equal(
      false
    );
    digestFragments[0].cut2.overhangSize.should.equal(4);
    digestFragments[0].cut2.isOverhangIncludedInFragmentSize.should.equal(
      false
    );

    digestFragments[1].start.should.equal(21);
    digestFragments[1].end.should.equal(35);
    digestFragments[1].cut1.overhangSize.should.equal(4);
    digestFragments[1].cut1.isOverhangIncludedInFragmentSize.should.equal(true);
    digestFragments[1].cut2.overhangSize.should.equal(0);
    digestFragments[1].cut2.isOverhangIncludedInFragmentSize.should.equal(
      false
    );
  });
  it("gets digestFragments for a single cutsite cutting in a circular sequence", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "GGATCC",
      //
      true,
      enzymeList["bamhi"]
    );
    //  v
    // G G A T C C
    // C C T A G G
    //          ^
    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(1);
    digestFragments[0].start.should.equal(1);
    digestFragments[0].end.should.equal(0);
    // I don't think we can determine containsFive/ThreePrimeRecognitionSite until the inclusion/exclusion of the overhangs is done
    // digestFragments[0].containsFivePrimeRecognitionSite.should.equal(false)
    // digestFragments[0].containsThreePrimeRecognitionSite.should.equal(false)
    digestFragments[0].cut1.overhangSize.should.equal(4);
    digestFragments[0].cut1.isOverhangIncludedInFragmentSize.should.equal(true);
    digestFragments[0].cut2.overhangSize.should.equal(4);
    digestFragments[0].cut2.isOverhangIncludedInFragmentSize.should.equal(
      false
    );
  });
  it("gets digestFragments for a single cutsite cutting in a linear sequence", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "ggatcc",
      false,
      enzymeList["bamhi"]
    );
    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(2);
    digestFragments[0].cut1.overhangSize.should.equal(0);
    digestFragments[0].cut1.isOverhangIncludedInFragmentSize.should.equal(
      false
    );
    digestFragments[0].cut2.overhangSize.should.equal(4);
    digestFragments[0].cut2.isOverhangIncludedInFragmentSize.should.equal(
      false
    );
    digestFragments[0].start.should.equal(0);
    digestFragments[0].end.should.equal(0);
    digestFragments[1].cut1.overhangSize.should.equal(4);
    digestFragments[1].cut1.isOverhangIncludedInFragmentSize.should.equal(true);
    digestFragments[1].cut2.overhangSize.should.equal(0);
    digestFragments[1].cut2.isOverhangIncludedInFragmentSize.should.equal(
      false
    );
    digestFragments[1].start.should.equal(1);
    digestFragments[1].end.should.equal(5);
  });

  it("gets digestFragments for multiple cutsites cutting in a linear sequence", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "ggatcctttttttggatcc",
      false,
      enzymeList["bamhi"]
    );
    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(3);
    digestFragments[0].cut1.type.should.equal("START_OR_END_OF_SEQ");
    digestFragments[2].cut2.type.should.equal("START_OR_END_OF_SEQ");
    digestFragments[0].start.should.equal(0);
    digestFragments[0].end.should.equal(0);
    digestFragments[1].start.should.equal(1);
    digestFragments[1].end.should.equal(13);
    digestFragments[2].start.should.equal(14);
    digestFragments[2].end.should.equal(18);
  });
  it("gets digestFragments for multiple cutsites cutting in a circular sequence", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "ggatcctttttttggatcc",
      true,
      enzymeList["bamhi"]
    );
    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(2);
    digestFragments[0].start.should.equal(1);
    digestFragments[0].end.should.equal(13);
    digestFragments[0].size.should.equal(13);
    digestFragments[1].start.should.equal(14);
    digestFragments[1].end.should.equal(0);
    digestFragments[1].size.should.equal(6);
  });
  it("gets digestFragments for multiple type 2s cutsites cutting in a circular sequence", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "GGTCTCttttttttttttGGTCTCttttttttttttttt",
      //         ------------------
      //  -------                  --------------

      //             --------------
      //  -------                      ----------
      true,
      enzymeList["bsai"]
    );
    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(2);
    digestFragments[0].cut1.overhangSize.should.equal(4);
    digestFragments[0].cut1.isOverhangIncludedInFragmentSize.should.equal(true);
    digestFragments[0].cut2.overhangSize.should.equal(4);
    digestFragments[0].cut2.isOverhangIncludedInFragmentSize.should.equal(
      false
    );
    digestFragments[0].start.should.equal(7);
    digestFragments[0].end.should.equal(24);
    digestFragments[0].size.should.equal(18);

    digestFragments[1].cut1.overhangSize.should.equal(4);
    digestFragments[1].cut1.isOverhangIncludedInFragmentSize.should.equal(true);
    digestFragments[1].cut2.overhangSize.should.equal(4);
    digestFragments[1].cut2.isOverhangIncludedInFragmentSize.should.equal(
      false
    );
    digestFragments[1].start.should.equal(25);
    digestFragments[1].end.should.equal(6);
    digestFragments[1].size.should.equal(21);
  });
  it("gets digestFragments for multiple cutsites cutting in a circular sequence when computePartialDigests=true", () => {
    const digestFragments = getDigestFragmentsForRestrictionEnzymes(
      "ggatcctttttttggatcc",
      true,
      enzymeList["bamhi"],
      { computePartialDigests: true }
    );

    digestFragments.should.be.an("array");
    digestFragments.length.should.equal(3);
    digestFragments[0].start.should.equal(1);
    digestFragments[0].end.should.equal(13);
    digestFragments[0].size.should.equal(13);

    digestFragments[1].start.should.equal(14);
    digestFragments[1].end.should.equal(13);
    digestFragments[1].size.should.equal(19);

    digestFragments[2].start.should.equal(14);
    digestFragments[2].end.should.equal(0);
    digestFragments[2].size.should.equal(6);
  });
  //tnrtodo: this test should be enabled and checked for correctness
  //   it("gets digestFragments for multiple cutsites cutting in a linear sequence when computePartialDigests=true", function() {
  //     const digestFragments = getDigestFragmentsForRestrictionEnzymes(
  //       "ggatcctttttttggatcc",
  //       false,
  //       enzymeList["bamhi"],
  //       { computePartialDigests: true }
  //     );
  //     digestFragments.should.be.an("array");
  //     digestFragments.length.should.equal(9);
  //     digestFragments[0].start.should.equal(1);
  //     digestFragments[0].end.should.equal(13);
  //     digestFragments[0].size.should.equal(13);

  //     digestFragments[1].start.should.equal(14);
  //     digestFragments[1].end.should.equal(13);
  //     digestFragments[1].size.should.equal(19);

  //     digestFragments[2].start.should.equal(14);
  //     digestFragments[2].end.should.equal(0);
  //     digestFragments[2].size.should.equal(6);
  //   });
});

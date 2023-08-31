import chai from "chai";
import doesEnzymeChopOutsideOfRecognitionSite from "./doesEnzymeChopOutsideOfRecognitionSite.js";
import enzymeList from "./aliasedEnzymesByName";

chai.should();

describe("doesEnzymeChopOutsideOfRecognitionSite", () => {
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
  it("should return a result for every enzyme", () => {
    Object.keys(enzymeList).forEach(key => {
      doesEnzymeChopOutsideOfRecognitionSite(enzymeList[key]);
    });
  });
  it("knows which enzymes chop within the recognition site", () => {
    doesEnzymeChopOutsideOfRecognitionSite(enzymeList["bamhi"]).should.equal(
      false
    );
    doesEnzymeChopOutsideOfRecognitionSite(enzymeList["xhoi"]).should.equal(
      false
    );

    doesEnzymeChopOutsideOfRecognitionSite(enzymeList["bsmbi"]).should.equal(
      true
    );
    doesEnzymeChopOutsideOfRecognitionSite(enzymeList["bsai"]).should.equal(
      true
    );
  });
});

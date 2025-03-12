import * as chai from "chai";
import chaiSubset from "chai-subset";
import getPossiblePartsFromSequenceAndEnzymes from "./getPossiblePartsFromSequenceAndEnzymes";
import enzymeList from "./aliasedEnzymesByName";
chai.should();
chai.use(chaiSubset);
describe("getPossiblePartsFromSequenceAndEnzymes", () => {
  //bamhi
  // "bamhi": {
  //     "name": "bamhi",
  //     "site": "ggatcc",
  //     "forwardRegex": "g{2}atc{2}",
  //     "reverseRegex": "g{2}atc{2}",
  //     "topSnipOffset": 1,
  //     "bottomSnipOffset": 5,
  //     "usForward": 0,
  //     "usReverse": 0
  // },
  it("cuts using a single palindromic enzyme", () => {
    const sequence = {
      sequence:
        "tggttgtagtagttagttgatgttatagggatcctgtagtatttatgtagtagtatgatgtagagtagtagtggatcctattatatata",
      circular: true
    };
    const parts = getPossiblePartsFromSequenceAndEnzymes(sequence, [
      enzymeList["bamhi"]
    ]);
    // eslint-disable-next-line no-unused-expressions
    parts.should.be.an("array");
    parts.length.should.equal(2);
    parts[0].start.should.equal(29);
    parts[0].end.should.equal(76);
    parts[0].firstCutOffset.should.equal(4);
    parts[0].firstCutOverhang.should.equal("gatc");
    parts[0].firstCutOverhangTop.should.equal("gatc");
    parts[0].secondCutOffset.should.equal(4);
    parts[0].secondCutOverhang.should.equal("gatc");
    parts[0].secondCutOverhangTop.should.equal("");

    parts[1].start.should.equal(73);
    parts[1].end.should.equal(32);
    parts.should.containSubset([
      {
        start: 29,
        end: 76,
        start1Based: 30,
        end1Based: 77,
        firstCut: {
          start: 28,
          end: 33,
          topSnipPosition: 29,
          bottomSnipPosition: 33,
          topSnipBeforeBottom: true,
          overhangBps: "gatc",
          forward: true
        },
        firstCutOffset: 4,
        firstCutOverhang: "gatc",
        firstCutOverhangTop: "gatc",
        firstCutOverhangBottom: "",
        secondCut: {
          start: 72,
          end: 77,
          topSnipPosition: 73,
          bottomSnipPosition: 77,
          topSnipBeforeBottom: true,
          overhangBps: "gatc",
          forward: true
        },
        secondCutOffset: 4,
        secondCutOverhang: "gatc",
        secondCutOverhangTop: "",
        secondCutOverhangBottom: "ctag"
      },
      {
        start: 73,
        end: 32,
        start1Based: 74,
        end1Based: 33,
        firstCut: {
          start: 72,
          end: 77,
          topSnipPosition: 73,
          bottomSnipPosition: 77,
          topSnipBeforeBottom: true,
          overhangBps: "gatc",
          upstreamTopBeforeBottom: false,
          upstreamTopSnip: null,
          upstreamBottomSnip: null,
          forward: true
        },
        firstCutOffset: 4,
        firstCutOverhang: "gatc",
        firstCutOverhangTop: "gatc",
        firstCutOverhangBottom: "",
        secondCut: {
          start: 28,
          end: 33,
          topSnipPosition: 29,
          bottomSnipPosition: 33,
          topSnipBeforeBottom: true,
          overhangBps: "gatc",
          upstreamTopBeforeBottom: false,
          upstreamTopSnip: null,
          upstreamBottomSnip: null,
          forward: true
        },
        secondCutOffset: 4,
        secondCutOverhang: "gatc",
        secondCutOverhangTop: "",
        secondCutOverhangBottom: "ctag"
      }
    ]);
  });
  it("cuts using two golden gate enzymes", () => {
    const sequence = {
      //                sapi ->
      sequence:
        "tggttgtagtGCTCTTCagttagttgatgttatagggatcctgtagtatttatgtagtaGGAGACCtatgatgtagggtcatcagtagtagtggatcctattatatata",
      //     accaacatcacgagaagtcaatcaactacaatatccctaggacatcataaatacatcatcctctggatactacatcCCAGAGtcatcatcacctaggataatatatat
      //                                                                 <- bsai
      circular: true
    };
    const parts = getPossiblePartsFromSequenceAndEnzymes(sequence, [
      enzymeList["sapi"],
      enzymeList["bsai"]
    ]);
    parts.length.should.equal(2);
    parts.should.containSubset([
      {
        start: 18,
        end: 58,
        start1Based: 19,
        end1Based: 59,
        firstCut: {
          start: 10,
          end: 20,
          topSnipPosition: 18,
          bottomSnipPosition: 21,
          topSnipBeforeBottom: true,
          overhangBps: "gtt",
          upstreamTopBeforeBottom: false,
          upstreamTopSnip: null,
          upstreamBottomSnip: null,
          forward: true
        },
        firstCutOffset: 3,
        firstCutOverhang: "gtt",
        firstCutOverhangTop: "gtt",
        firstCutOverhangBottom: "",
        secondCut: {
          start: 55,
          end: 65,
          topSnipPosition: 55,
          bottomSnipPosition: 59,
          topSnipBeforeBottom: true,
          overhangBps: "agta",
          upstreamTopBeforeBottom: false,
          upstreamTopSnip: null,
          upstreamBottomSnip: null,
          forward: false
        },
        secondCutOffset: 4,
        secondCutOverhang: "agta",
        secondCutOverhangTop: "",
        secondCutOverhangBottom: "tcat"
      },
      {
        start: 55,
        end: 20,
        start1Based: 56,
        end1Based: 21,
        firstCut: {
          start: 55,
          end: 65,
          topSnipPosition: 55,
          bottomSnipPosition: 59,
          topSnipBeforeBottom: true,
          overhangBps: "agta",
          upstreamTopBeforeBottom: false,
          upstreamTopSnip: null,
          upstreamBottomSnip: null,
          forward: false
        },
        firstCutOffset: 4,
        firstCutOverhang: "agta",
        firstCutOverhangTop: "agta",
        firstCutOverhangBottom: "",
        secondCut: {
          start: 10,
          end: 20,
          topSnipPosition: 18,
          bottomSnipPosition: 21,
          topSnipBeforeBottom: true,
          overhangBps: "gtt",
          upstreamTopBeforeBottom: false,
          upstreamTopSnip: null,
          upstreamBottomSnip: null,
          forward: true
        },
        secondCutOffset: 3,
        secondCutOverhang: "gtt",
        secondCutOverhangTop: "",
        secondCutOverhangBottom: "caa"
      }
    ]);
  });
});

import chai from "chai";
import jsonToBed from "../src/jsonToBed";

chai.should();
describe("json to bed parser", function () {
  it("should convert json seq to bed format", function () {
    const jsonInfo = {
      name: "testseq",
      sequence: "agagtagacgattgaccaggtttagag",
      features: [
        {
          id: "id1",
          start: 2,
          end: 6
        },
        {
          id: "id2",
          start: 8,
          end: 20
        }
      ]
    };
    const bedInfo = jsonToBed(jsonInfo);
    //strip all whitespace
    bedInfo
      .replace(/\s/g, "")
      .should.equal(
        `trackname="testseq||27|linear"description="testseqAnnotations"itemRgb="On"testseq||27|linear27Untitledannotation-testseq||27|linear821Untitledannotation-`
      );
  });
  it("should convert json seq (without sequence, features only) to bed format", function () {
    const jsonInfo = {
      name: "testseq",
      features: [
        {
          id: "id1",
          start: 2,
          end: 6,
          type: "misc_feature",
          strand: 1
        },
        {
          id: "id2",
          start: 8,
          end: 20,
          type: "misc_feature",
          strand: -1
        }
      ]
    };
    const options = { sequenceName: "testseq", featuresOnly: true };
    const bedInfo = jsonToBed(jsonInfo, options);
    bedInfo
      .replace(/\s/g, "")
      .should.equal(
        `trackname="testseq"description="testseqAnnotations"itemRgb="On"testseq27misc_feature+testseq821misc_feature-`
      );
  });
});

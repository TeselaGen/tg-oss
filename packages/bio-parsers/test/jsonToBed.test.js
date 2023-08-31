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
    console.log(`bedInfo:`, bedInfo);
    // bedInfo.should.equal("track name="testseq||27|linear" description="testseq Annotations" itemRgb="On"
    // testseq||27|linear	2	7	misc_feature	1000	-	2	7	65,105,225
    // testseq||27|linear	8	21	misc_feature	1000	-	8	21	65,105,225");
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
    console.log(`bedInfo:`, bedInfo);
    // bedInfo.should.equal("track name="testseq" description="testseq Annotations" itemRgb="On"
    // testseq	2	7	misc_feature	1000	+	2	7	65,105,225
    // testseq	8	21	misc_feature	1000	-	8	21	65,105,225");
  });
});

import getRangeLength from "./getRangeLength";
import generateRandomRange from "./generateRandomRange";
import * as chai from "chai";
chai.should();

describe("generateRandomRange", function () {
  it("should generate random ranges between a start and end", function () {
    const range = generateRandomRange(0, 10, 100);
    chai.expect(range.start).to.be.below(11);
    chai.expect(range.end).to.be.below(11);
  });

  it("should generate random ranges between a start and end and with length less than maxLength", function () {
    for (let i = 0; i < 1000; i++) {
      const range = generateRandomRange(0, 10, 5);
      const length = getRangeLength(range, 10);
      if (length > -1) {
        chai.expect(length).to.be.below(6);
      }
    }
  });
});

import trimAnnStartEndToFitSeqLength from "./trimAnnStartEndToFitSeqLength";
import { expect } from "chai";

describe("trimAnnStartEndToFitSeqLength", () => {
  test("should return 0 if annStartOrEnd is undefined", () => {
    expect(
      trimAnnStartEndToFitSeqLength(undefined as unknown as number, 10)
    ).to.equal(0);
  });

  test("should return 0 if annStartOrEnd is null", () => {
    expect(
      trimAnnStartEndToFitSeqLength(null as unknown as number, 10)
    ).to.equal(0);
  });

  test("should return 0 if annStartOrEnd is < 0", () => {
    expect(trimAnnStartEndToFitSeqLength(-1, 10)).to.equal(0);
  });

  test("should return annStartOrEnd if it is within the sequence length", () => {
    expect(trimAnnStartEndToFitSeqLength(5, 10)).to.equal(5);
  });

  test("should return sequenceLength - 1 if annStartOrEnd is > sequenceLength", () => {
    expect(trimAnnStartEndToFitSeqLength(11, 10)).to.equal(9);
  });

  test("should return sequenceLength - 1 if annStartOrEnd is == sequenceLength", () => {
    expect(trimAnnStartEndToFitSeqLength(10, 10)).to.equal(9);
  });

  test("should return 0 if annStartOrEnd is == 0", () => {
    expect(trimAnnStartEndToFitSeqLength(0, 10)).to.equal(0);
  });

  test("should return 0 if annStartOrEnd is < 0", () => {
    expect(trimAnnStartEndToFitSeqLength(-10, 10)).to.equal(0);
  });
});

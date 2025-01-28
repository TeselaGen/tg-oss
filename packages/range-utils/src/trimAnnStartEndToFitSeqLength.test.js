import trimAnnStartEndToFitSeqLength from "./trimAnnStartEndToFitSeqLength";

describe("trimAnnStartEndToFitSeqLength", () => {
  test("should return 0 if annStartOrEnd is undefined", () => {
    expect(trimAnnStartEndToFitSeqLength(undefined, 10)).toBe(0);
  });

  test("should return 0 if annStartOrEnd is null", () => {
    expect(trimAnnStartEndToFitSeqLength(null, 10)).toBe(0);
  });

  test("should return 0 if annStartOrEnd is less than 0", () => {
    expect(trimAnnStartEndToFitSeqLength(-5, 10)).toBe(0);
  });

  test("should return annStartOrEnd if it is within the sequence length", () => {
    expect(trimAnnStartEndToFitSeqLength(5, 10)).toBe(5);
  });

  test("should return sequenceLength - 1 if annStartOrEnd is greater than sequenceLength", () => {
    expect(trimAnnStartEndToFitSeqLength(15, 10)).toBe(9);
  });

  test("should return 0 if sequenceLength is 0", () => {
    expect(trimAnnStartEndToFitSeqLength(5, 0)).toBe(0);
  });

  test("should return 0 if sequenceLength is negative", () => {
    expect(trimAnnStartEndToFitSeqLength(5, -10)).toBe(0);
  });

  test("should return 0 if annStartOrEnd is 0", () => {
    expect(trimAnnStartEndToFitSeqLength(0, 10)).toBe(0);
  });
});

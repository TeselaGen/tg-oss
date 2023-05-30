import filterSequenceString from "./filterSequenceString";

describe("filterSequenceString", () => {
  it("should filter out unwanted chars", () => {
    expect(filterSequenceString("tatag--a")).toBe("tataga");
  });
  it("should handle additional chars option", () => {
    expect(filterSequenceString("tatag--a", "-")).toBe("tatag--a");
  });
  it("should handle additional chars option", () => {
    expect(filterSequenceString("tatag--a", "f-q")).toBe("tatag--a");
  });
});

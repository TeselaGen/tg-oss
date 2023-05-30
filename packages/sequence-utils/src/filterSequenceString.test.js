const filterSequenceString = require("./filterSequenceString");

describe("filterSequenceString", function() {
  it("should filter out unwanted chars", function() {
    expect(filterSequenceString("tatag--a")).toBe("tataga");
  });
  it("should handle additional chars option", function() {
    expect(filterSequenceString("tatag--a", "-")).toBe("tatag--a");
  });
  it("should handle additional chars option", function() {
    expect(filterSequenceString("tatag--a", "f-q")).toBe("tatag--a");
  });
});

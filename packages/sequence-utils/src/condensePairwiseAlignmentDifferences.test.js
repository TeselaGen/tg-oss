const condensePairwiseAlignmentDifferences = require("./condensePairwiseAlignmentDifferences.js");
describe("pairwise alignment differences", function() {
  it("it should ignore start and end where dashes are ", function() {
    const result = condensePairwiseAlignmentDifferences(
      "cccccccGCTAG--Tccc",
      "-------GCTAGAAT---"
    );
    expect(result).toBe("WWWWWWWGGGGGRWWW");
  });
  it("1 insertion of >1 bp", function() {
    const result = condensePairwiseAlignmentDifferences("GCTAG--T", "GCTAGAAT");
    expect(result).toBe("GGGGGR");
  });
  it("should be case insensitive", function() {
    const result = condensePairwiseAlignmentDifferences("GctAG-T", "GCTAGAT");
    expect(result).toBe("GGGGGR");
  });
  it("insertion of one bp in the middle of the sequence", function() {
    const result = condensePairwiseAlignmentDifferences("GCTAG-T", "GCTAGAT");
    expect(result).toBe("GGGGGR");
  });
  it("1 deletion", function() {
    const result = condensePairwiseAlignmentDifferences("GCTAGAAT", "GC--GAAT");
    expect(result).toBe("GGRRGGGG");
  });
  it("2 insertions", function() {
    const result = condensePairwiseAlignmentDifferences("G--AG--T", "GCTAGAAT");
    expect(result).toBe("GRGR");
  });
  it("insertion at the 3' end", function() {
    const result = condensePairwiseAlignmentDifferences("GCTAGA--", "GCTAGAAT");
    expect(result).toBe("GGGGGR");
  });
  it("insertion of one bp at the 3' end", function() {
    const result = condensePairwiseAlignmentDifferences("GCTAGAA-", "GCTAGAAT");
    expect(result).toBe("GGGGGGR");
  });
  it("insertion of three bp at the 3' end", function() {
    const result = condensePairwiseAlignmentDifferences("GCTAG---", "GCTAGAAT");
    expect(result).toBe("GGGGR");
  });
  it("insertion at the 5' end", function() {
    const result = condensePairwiseAlignmentDifferences("--TAGAAT", "GCTAGAAT");
    expect(result).toBe("RGGGGG");
  });
  it("insertion of one bp at the 5' end", function() {
    const result = condensePairwiseAlignmentDifferences("-TAGAAT", "CTAGAAT");
    expect(result).toBe("RGGGGG");
  });
  it("1 insertion & 1 deletion in the middle", function() {
    const result = condensePairwiseAlignmentDifferences("GCTAG--T", "GC--GAAT");
    expect(result).toBe("GGRRGR");
  });
  it("1 insertion & 1 deletion that are adjacent in the middle", function() {
    const result = condensePairwiseAlignmentDifferences("GCTA--T", "GC--AAT");
    expect(result).toBe("GGRRR");
  });
  it("1 insertion then 1 deletion that are adjacent at the 5' end", function() {
    const result = condensePairwiseAlignmentDifferences("--TAGAAT", "GC--GAAT");
    expect(result).toBe("RRGGGG");
  });
  it("1 insertion then 1 deletion that are adjacent at the 3' end", function() {
    const result = condensePairwiseAlignmentDifferences("GCTAGA--", "GCTA--AT");
    expect(result).toBe("GGGGRR");
  });
});

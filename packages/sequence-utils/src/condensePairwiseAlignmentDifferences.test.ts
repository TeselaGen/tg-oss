import condensePairwiseAlignmentDifferences from "./condensePairwiseAlignmentDifferences";
describe("pairwise alignment differences", () => {
  it("it should ignore start and end where dashes are ", () => {
    const result = condensePairwiseAlignmentDifferences(
      "cccccccGCTAG--Tccc",
      "-------GCTAGAAT---"
    );
    expect(result).toBe("WWWWWWWGGGGGRWWW");
  });
  it("1 insertion of >1 bp", () => {
    const result = condensePairwiseAlignmentDifferences("GCTAG--T", "GCTAGAAT");
    expect(result).toBe("GGGGGR");
  });
  it("should be case insensitive", () => {
    const result = condensePairwiseAlignmentDifferences("GctAG-T", "GCTAGAT");
    expect(result).toBe("GGGGGR");
  });
  it("insertion of one bp in the middle of the sequence", () => {
    const result = condensePairwiseAlignmentDifferences("GCTAG-T", "GCTAGAT");
    expect(result).toBe("GGGGGR");
  });
  it("1 deletion", () => {
    const result = condensePairwiseAlignmentDifferences("GCTAGAAT", "GC--GAAT");
    expect(result).toBe("GGRRGGGG");
  });
  it("2 insertions", () => {
    const result = condensePairwiseAlignmentDifferences("G--AG--T", "GCTAGAAT");
    expect(result).toBe("GRGR");
  });
  it("insertion at the 3' end", () => {
    const result = condensePairwiseAlignmentDifferences("GCTAGA--", "GCTAGAAT");
    expect(result).toBe("GGGGGR");
  });
  it("insertion of one bp at the 3' end", () => {
    const result = condensePairwiseAlignmentDifferences("GCTAGAA-", "GCTAGAAT");
    expect(result).toBe("GGGGGGR");
  });
  it("insertion of three bp at the 3' end", () => {
    const result = condensePairwiseAlignmentDifferences("GCTAG---", "GCTAGAAT");
    expect(result).toBe("GGGGR");
  });
  it("insertion at the 5' end", () => {
    const result = condensePairwiseAlignmentDifferences("--TAGAAT", "GCTAGAAT");
    expect(result).toBe("RGGGGG");
  });
  it("insertion of one bp at the 5' end", () => {
    const result = condensePairwiseAlignmentDifferences("-TAGAAT", "CTAGAAT");
    expect(result).toBe("RGGGGG");
  });
  it("1 insertion & 1 deletion in the middle", () => {
    const result = condensePairwiseAlignmentDifferences("GCTAG--T", "GC--GAAT");
    expect(result).toBe("GGRRGR");
  });
  it("1 insertion & 1 deletion that are adjacent in the middle", () => {
    const result = condensePairwiseAlignmentDifferences("GCTA--T", "GC--AAT");
    expect(result).toBe("GGRRR");
  });
  it("1 insertion then 1 deletion that are adjacent at the 5' end", () => {
    const result = condensePairwiseAlignmentDifferences("--TAGAAT", "GC--GAAT");
    expect(result).toBe("RRGGGG");
  });
  it("1 insertion then 1 deletion that are adjacent at the 3' end", () => {
    const result = condensePairwiseAlignmentDifferences("GCTAGA--", "GCTA--AT");
    expect(result).toBe("GGGGRR");
  });
});

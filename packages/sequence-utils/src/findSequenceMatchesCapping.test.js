import findSequenceMatches from "./findSequenceMatches";
import findApproxMatches from "./findApproxMatches";
import { autoAnnotate } from "./autoAnnotate";

describe("findSequenceMatches and findApproxMatches Capping", () => {
  it("findSequenceMatches caps results at 1000 by default", () => {
    // Searching for 'a' in a long sequence of 'a's will produce many matches
    const sequence = "a".repeat(2000);
    const matches = findSequenceMatches(sequence, "a");
    expect(matches.length).toBeLessThanOrEqual(1000);
  });

  it("findSequenceMatches caps results at 1000 across both strands", () => {
    const sequence = "at".repeat(1000);
    const matches = findSequenceMatches(sequence, "a", {
      searchReverseStrand: true
    });
    expect(matches.length).toBe(1000);
  });

  it("findSequenceMatches caps results at a custom limit", () => {
    const sequence = "a".repeat(100);
    const matches = findSequenceMatches(sequence, "a", { maxMatches: 10 });
    expect(matches.length).toBe(10);
  });

  it("findApproxMatches caps results at 1000 by default", () => {
    const sequence = "a".repeat(2000);
    const matches = findApproxMatches("a", sequence, 0);
    expect(matches.length).toBeLessThanOrEqual(1000);
  });

  it("findApproxMatches caps results at a custom limit", () => {
    const sequence = "a".repeat(100);
    const matches = findApproxMatches("a", sequence, 0, false, 10);
    expect(matches.length).toBe(10);
  });

  it("autoAnnotate caps results at 1000 by default", () => {
    const sequence = "a".repeat(2000);
    const annotationsToCheckById = {
      ann1: { sequence: "a", id: "ann1" }
    };
    const seqsToAnnotateById = {
      seq1: { sequence, id: "seq1" }
    };
    const result = autoAnnotate({
      seqsToAnnotateById,
      annotationsToCheckById
    });
    expect(result.seq1.length).toBeLessThanOrEqual(1000);
  });
  it("findApproxMatches caps results even with many mismatches", () => {
    const sequence = "atgc".repeat(500); // 2000 bp
    // Searching for 'aaaa' with 4 mismatches (matches everything)
    const matches = findApproxMatches("aaaa", sequence, 4);
    expect(matches.length).toBe(1000);
  });
});

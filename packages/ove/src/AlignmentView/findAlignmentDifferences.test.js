/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import * as chai from "chai";
import {
  findAlignmentDifferences,
  groupConsecutiveDifferences
} from "./findAlignmentDifferences";

chai.should();
const { expect } = chai;

describe("findAlignmentDifferences", () => {
  it("returns empty array when fewer than 2 tracks", () => {
    expect(findAlignmentDifferences([])).to.deep.equal([]);
    expect(findAlignmentDifferences(["ACGT"])).to.deep.equal([]);
  });

  it("returns empty array when template is empty", () => {
    expect(findAlignmentDifferences(["", ""])).to.deep.equal([]);
  });

  it("returns empty array when sequences are identical", () => {
    expect(findAlignmentDifferences(["ACGT", "ACGT"])).to.deep.equal([]);
  });

  it("detects a single mismatch", () => {
    // pos 1: A vs T
    const diffs = findAlignmentDifferences(["ACGT", "ATGT"]);
    expect(diffs).to.have.lengthOf(1);
    expect(diffs[0]).to.deep.include({ position: 1, type: "mismatch" });
  });

  it("detects multiple mismatches", () => {
    const diffs = findAlignmentDifferences(["AAAA", "TATA"]);
    expect(diffs).to.have.lengthOf(2);
    expect(diffs.map(d => d.position)).to.deep.equal([0, 2]);
    diffs.forEach(d => expect(d.type).to.equal("mismatch"));
  });

  it("detects mismatches in protein sequences (amino acids)", () => {
    const diffs = findAlignmentDifferences(["MAST", "MAST"]);
    expect(diffs).to.have.lengthOf(0);

    const diffs2 = findAlignmentDifferences(["MAST", "MVST"]);
    expect(diffs2).to.have.lengthOf(1);
    expect(diffs2[0]).to.deep.include({ position: 1, type: "mismatch" });
  });

  it("is case-insensitive", () => {
    const diffs = findAlignmentDifferences(["ACGT", "acgt"]);
    expect(diffs).to.have.lengthOf(0);
  });

  it("detects a single-base insertion (gap in template)", () => {
    // template: A-GT, query: ACGT → position 1 is an insertion
    const diffs = findAlignmentDifferences(["A-GT", "ACGT"]);
    const insertions = diffs.filter(d => d.type === "insertion");
    expect(insertions).to.have.lengthOf(1);
    expect(insertions[0].position).to.equal(1);
  });

  it("detects a multi-base insertion", () => {
    // template: A---GT, query: ACCCGT
    const diffs = findAlignmentDifferences(["A---GT", "ACCCGT"]);
    const insertions = diffs.filter(d => d.type === "insertion");
    expect(insertions).to.have.lengthOf(3);
    expect(insertions.map(d => d.position)).to.deep.equal([1, 2, 3]);
  });

  it("detects a single-base deletion (gap in non-template)", () => {
    // template: ACGT, query: A-GT → position 1 is a deletion
    const diffs = findAlignmentDifferences(["ACGT", "A-GT"]);
    const deletions = diffs.filter(d => d.type === "deletion");
    expect(deletions).to.have.lengthOf(1);
    expect(deletions[0].position).to.equal(1);
  });

  it("detects a multi-base deletion", () => {
    // template: ACCCGT, query: A---GT
    const diffs = findAlignmentDifferences(["ACCCGT", "A---GT"]);
    const deletions = diffs.filter(d => d.type === "deletion");
    expect(deletions).to.have.lengthOf(3);
    expect(deletions.map(d => d.position)).to.deep.equal([1, 2, 3]);
  });

  it("detects leading non-aligned region", () => {
    // query hasn't started yet at position 0-1
    const diffs = findAlignmentDifferences(["ACGT", "--GT"]);
    const gaps = diffs.filter(d => d.type === "gap");
    expect(gaps).to.have.lengthOf(2);
    expect(gaps.map(d => d.position)).to.deep.equal([0, 1]);
  });

  it("detects trailing non-aligned region", () => {
    // query has ended after position 1
    const diffs = findAlignmentDifferences(["ACGT", "AC--"]);
    const gaps = diffs.filter(d => d.type === "gap");
    expect(gaps).to.have.lengthOf(2);
    expect(gaps.map(d => d.position)).to.deep.equal([2, 3]);
  });

  it("detects both leading and trailing non-aligned regions", () => {
    const diffs = findAlignmentDifferences(["ACGTAC", "-CGTA-"]);
    const gaps = diffs.filter(d => d.type === "gap");
    expect(gaps.map(d => d.position)).to.deep.equal([0, 5]);
  });

  it("fully-gapped query returns all positions as gap", () => {
    const diffs = findAlignmentDifferences(["ACGT", "----"]);
    expect(diffs).to.have.lengthOf(4);
    diffs.forEach(d => expect(d.type).to.equal("gap"));
  });

  it("handles mixed difference types in one alignment", () => {
    // template: AACGT
    // query:    -ACGG
    // pos 0: gap (leading '-' in query), pos 4: mismatch (T vs G)
    const diffs = findAlignmentDifferences(["AACGT", "-ACGG"]);
    expect(diffs.find(d => d.position === 0)?.type).to.equal("gap");
    expect(diffs.find(d => d.position === 4)?.type).to.equal("mismatch");
  });

  it("handles multiple non-template tracks", () => {
    // template: ACGT
    // track1:   ATGT  → mismatch at pos 1
    // track2:   AC-T  → deletion at pos 2
    const diffs = findAlignmentDifferences(["ACGT", "ATGT", "AC-T"]);
    expect(diffs.find(d => d.position === 1)?.type).to.equal("mismatch");
    expect(diffs.find(d => d.position === 2)?.type).to.equal("deletion");
  });

  it("includes all track bases in returned diff object", () => {
    // mismatch at position 1: template 'C' vs non-template 'T'
    const diffs = findAlignmentDifferences(["ACGT", "ATGT"]);
    expect(diffs[0].bases).to.have.lengthOf(2);
    expect(diffs[0].bases[0]).to.equal("c"); // template at pos 1 (lowercased)
    expect(diffs[0].bases[1]).to.equal("t"); // non-template at pos 1 (lowercased)
  });
});

describe("groupConsecutiveDifferences", () => {
  it("returns empty array for empty input", () => {
    expect(groupConsecutiveDifferences([])).to.deep.equal([]);
  });

  it("does not group mismatches — each stays individual", () => {
    // 4 consecutive mismatches → 4 separate entries
    const diffs = findAlignmentDifferences(["AAAA", "TTTT"]);
    const grouped = groupConsecutiveDifferences(diffs);
    expect(grouped).to.have.lengthOf(4);
    grouped.forEach((g, i) => {
      expect(g.type).to.equal("mismatch");
      expect(g.start).to.equal(i);
      expect(g.end).to.equal(i);
    });
  });

  it("groups consecutive deletions into one region", () => {
    // template: ACCCGT, query: A---GT → 3 consecutive deletions
    const diffs = findAlignmentDifferences(["ACCCGT", "A---GT"]);
    const grouped = groupConsecutiveDifferences(diffs);
    expect(grouped).to.have.lengthOf(1);
    expect(grouped[0]).to.deep.include({ type: "deletion", start: 1, end: 3 });
  });

  it("groups consecutive insertions into one region", () => {
    // template: A---GT, query: ACCCGT → 3 consecutive insertions
    const diffs = findAlignmentDifferences(["A---GT", "ACCCGT"]);
    const grouped = groupConsecutiveDifferences(diffs);
    expect(grouped).to.have.lengthOf(1);
    expect(grouped[0]).to.deep.include({ type: "insertion", start: 1, end: 3 });
  });

  it("groups consecutive gaps into one region", () => {
    // leading 2-base gap + trailing 2-base gap
    const diffs = findAlignmentDifferences(["ACGTAC", "--GT--"]);
    const grouped = groupConsecutiveDifferences(diffs);
    expect(grouped).to.have.lengthOf(2);
    expect(grouped[0]).to.deep.include({ type: "gap", start: 0, end: 1 });
    expect(grouped[1]).to.deep.include({ type: "gap", start: 4, end: 5 });
  });

  it("keeps non-consecutive same-type differences separate", () => {
    // two deletions separated by a match; ends with base so trailing '-' is still aligned
    // template: ACACA, query: A-A-A → deletions at pos 1 and 3, matches elsewhere
    const diffs = findAlignmentDifferences(["ACACA", "A-A-A"]);
    const grouped = groupConsecutiveDifferences(diffs);
    expect(grouped).to.have.lengthOf(2);
    expect(grouped[0]).to.deep.include({ type: "deletion", start: 1, end: 1 });
    expect(grouped[1]).to.deep.include({ type: "deletion", start: 3, end: 3 });
  });

  it("handles mixed types — groups each type's runs independently", () => {
    // template: A--CGT, query: ACCC-T
    // pos 0: A vs A → match
    // pos 1,2: template '-', query 'C','C' → insertions
    // pos 3: C vs C → match
    // pos 4: G vs '-' → deletion
    // pos 5: T vs T → match
    const diffs = findAlignmentDifferences(["A--CGT", "ACCC-T"]);
    const grouped = groupConsecutiveDifferences(diffs);
    const insertionGroups = grouped.filter(g => g.type === "insertion");
    const deletionGroups = grouped.filter(g => g.type === "deletion");
    expect(insertionGroups).to.have.lengthOf(1);
    expect(insertionGroups[0]).to.deep.include({ start: 1, end: 2 });
    expect(deletionGroups).to.have.lengthOf(1);
    expect(deletionGroups[0]).to.deep.include({ start: 4, end: 4 });
  });
});

import { expect } from "chai";
import getDegenerateDnaStringFromAAString from "./getDegenerateDnaStringFromAAString";
import getDegenerateRnaStringFromAAString from "./getDegenerateRnaStringFromAAString";

describe("amino acid to RNA or DNA should be correct", () => {
  it('should return a string with no "u/U" in it when parse AA sequence to DNA sequence.', () => {
    const aaStr = "AQRSTFFVCL";
    const DNASeq = getDegenerateDnaStringFromAAString(aaStr);
    const RNASeq = getDegenerateRnaStringFromAAString(aaStr);
    expect(DNASeq.length)
      .equal(RNASeq.length)
      .equal(aaStr.length * 3);
    expect(DNASeq.toLowerCase().includes("u")).equal(false);
    expect(DNASeq.toLowerCase().includes("t")).equal(true);

    expect(RNASeq.toLowerCase().includes("t")).equal(false);
    expect(RNASeq.toLowerCase().includes("u")).equal(true);

    expect(RNASeq.toLowerCase().replace(/u/gi, "t")).equal(
      DNASeq.toLowerCase()
    );

    expect(DNASeq.toLowerCase().replace(/t/gi, "u")).equal(
      RNASeq.toLowerCase()
    );
  });
});

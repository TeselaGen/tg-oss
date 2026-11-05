import * as chai from "chai";
import anyToJson from "../src/anyToJson.js";
import genbankToJson from "../src/genbankToJson";

chai.should();

// Each record of a multi-record GenBank file declares its own molecule type on
// its LOCUS line, so the flags derived from it must not carry over from one
// record to the next.
const mrna = `LOCUS       TEST_MRNA                 40 bp    mRNA    linear   SYN 01-JAN-2020
FEATURES             Location/Qualifiers
ORIGIN
        1 atgacgtttg ggtaccaatt tggatcctaa aaaaaaaaaa
//
`;

const dna = `LOCUS       TEST_PLASMID              36 bp    DNA     circular SYN 01-JAN-2020
FEATURES             Location/Qualifiers
ORIGIN
        1 gaattcggat ccgaattcgg atccgaattc ggatcc
//
`;

const protein = `LOCUS       TEST_PROTEIN              10 aa            linear   SYN 01-JAN-2020
FEATURES             Location/Qualifiers
ORIGIN
        1 mgvklwppqr
//
`;

const ssDna = `LOCUS       TEST_SSDNA                20 bp    ss-DNA  linear   SYN 01-JAN-2020
FEATURES             Location/Qualifiers
ORIGIN
        1 gaattcggat ccgaattcgg
//
`;

const flagsOf = ({ parsedSequence: s }) => ({
  name: s.name,
  sequenceTypeFromLocus: s.sequenceTypeFromLocus,
  isRna: !!s.isRna,
  isDoubleStrandedRNA: !!s.isDoubleStrandedRNA,
  isDNA: !!s.isDNA,
  isSingleStrandedDNA: !!s.isSingleStrandedDNA,
  isProtein: !!s.isProtein,
  circular: !!s.circular
});

const mrnaFlags = {
  name: "TEST_MRNA",
  sequenceTypeFromLocus: "mRNA",
  isRna: true,
  isDoubleStrandedRNA: true,
  isDNA: false,
  isSingleStrandedDNA: false,
  isProtein: false,
  circular: false
};

const dnaFlags = {
  name: "TEST_PLASMID",
  sequenceTypeFromLocus: "DNA",
  isRna: false,
  isDoubleStrandedRNA: false,
  isDNA: true,
  isSingleStrandedDNA: false,
  isProtein: false,
  circular: true
};

const proteinFlags = {
  name: "TEST_PROTEIN",
  sequenceTypeFromLocus: "aa",
  isRna: false,
  isDoubleStrandedRNA: false,
  isDNA: false,
  isSingleStrandedDNA: false,
  isProtein: true,
  circular: false
};

const ssDnaFlags = {
  name: "TEST_SSDNA",
  sequenceTypeFromLocus: "ss-DNA",
  isRna: false,
  isDoubleStrandedRNA: false,
  isDNA: true,
  isSingleStrandedDNA: true,
  isProtein: false,
  circular: false
};

describe("multi-record molecule types", () => {
  it("keeps per-record molecule types when an mRNA record comes first", () => {
    const results = genbankToJson(mrna + dna);
    results.map(flagsOf).should.deep.equal([mrnaFlags, dnaFlags]);
  });

  it("keeps per-record molecule types when the DNA record comes first", () => {
    const results = genbankToJson(dna + mrna);
    results.map(flagsOf).should.deep.equal([dnaFlags, mrnaFlags]);
  });

  it("keeps per-record molecule types across mRNA, DNA, protein and ss-DNA records", () => {
    const results = genbankToJson(mrna + protein + dna + ssDna);
    results
      .map(flagsOf)
      .should.deep.equal([mrnaFlags, proteinFlags, dnaFlags, ssDnaFlags]);
  });

  it("keeps per-record molecule types through anyToJson", async () => {
    const results = await anyToJson(mrna + dna, { fileName: "multi.gb" });
    results
      .map(r => ({
        name: r.parsedSequence.name,
        isRna: !!r.parsedSequence.isRna,
        isProtein: !!r.parsedSequence.isProtein
      }))
      .should.deep.equal([
        { name: "TEST_MRNA", isRna: true, isProtein: false },
        { name: "TEST_PLASMID", isRna: false, isProtein: false }
      ]);
  });

  it("does not mutate the options object it is given", () => {
    const options = { fileName: "multi.gb" };
    genbankToJson(mrna + dna, options);
    options.should.deep.equal({ fileName: "multi.gb" });
  });
});

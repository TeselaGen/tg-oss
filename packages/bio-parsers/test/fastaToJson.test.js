/**
 * testing file for the FASTA parser, which should be able to handle multiple sequences in the same file, comments, and any other sort of vaild FASTA format
 * @author Joshua P Nixon
 */
import fastaToJson from "../src/fastaToJson";

import path from "path";
import fs from "fs";
import chai from "chai";
import { proteinFasta3 } from "./resultStrings";
chai.use(require("chai-things"));
chai.should();

describe("FASTA tests", function () {
  it("should automatically treat .faa files as protein", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/proteinFasta.faa"),
      "utf8"
    );
    const result = await fastaToJson(string, { fileName: "proteinFasta.faa" });
    result[0].parsedSequence.name.should.equal("gi");
    result[0].parsedSequence.description.should.equal(
      "359950697|gb|AEV91138.1| Rfp (plasmid) [synthetic construct]"
    );
    result[0].parsedSequence.sequence.should.equal(
      "MRSSKNVIKEFMRFKVRMEGTVNGHEFEIEGEGEGRPYEGHNTVKLKVTKGGPLPFAWDILSPQFQYGSKVYVKHPADIPDYKKLSFPEGFKWERVMNFEDGGVVTVTQDSSLQDGCFIYKVKFIGVNFPSDGPVMQKKTMGWEASTERLYPRDGVLKGEIHKALKLKDGGHYLVEFKSIYMAKKPVQLPGYYYVDSKLDITSHNEDYTIVEQYERTEGRHHLFL"
    );
    result[0].parsedSequence.isProtein.should.equal(true);
  });
  it("import protein fasta file without replacing spaces to underscore in name", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/proteinFasta.fas"),
      "utf8"
    );
    const result = await fastaToJson(string, {
      isProtein: true
    });
    result[0].parsedSequence.name.should.equal("gi");
    result[0].parsedSequence.description.should.equal(
      "359950697|gb|AEV91138.1| Rfp (plasmid) [synthetic construct]"
    );
    result[0].parsedSequence.sequence.should.equal(
      "MRSSKNVIKEFMRFKVRMEGTVNGHEFEIEGEGEGRPYEGHNTVKLKVTKGGPLPFAWDILSPQFQYGSKVYVKHPADIPDYKKLSFPEGFKWERVMNFEDGGVVTVTQDSSLQDGCFIYKVKFIGVNFPSDGPVMQKKTMGWEASTERLYPRDGVLKGEIHKALKLKDGGHYLVEFKSIYMAKKPVQLPGYYYVDSKLDITSHNEDYTIVEQYERTEGRHHLFL"
    );
  });
  it("should respect the additionalValidChars option!", async function () {
    const res = await fastaToJson(
      `>thomasFastaWithDashes
gacta --- asdf-c-a
`,
      { additionalValidChars: "f-" }
    );
    res[0].parsedSequence.sequence.should.equal("gacta---asdf-c-a");
  });
  it("tests a basic fasta file", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/example.fas"),
      "utf8"
    );
    const result = await fastaToJson(string);
    result[0].parsedSequence.name.should.equal("ssrA_tag_enhance");
    result[0].parsedSequence.sequence.should.equal("GTAAGT");
  });
  it("test a multiFASTA", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/multi_test.fas"),
      "utf8"
    );
    const result = await fastaToJson(string);
    result.length.should.equal(7);
    result.should.include.something.that.deep.equals({
      parsedSequence: {
        sequence: "GTCA",
        features: [],
        name: "Sequence_5",
        extraLines: [],
        size: 4,
        circular: false,
        comments: [],
        type: "DNA"
      },
      success: true,
      messages: []
    });
    result.should.include.something.that.deep.equals({
      parsedSequence: {
        name: "Sequence_1",
        sequence: "ACTG",
        size: 4,
        circular: false,
        extraLines: [],
        features: [],
        comments: [],
        type: "DNA"
      },
      success: true,
      messages: []
    });
    result.should.include.something.that.deep.equals({
      parsedSequence: {
        name: "Sequence_7",
        sequence: "GTCA",
        size: 4,
        extraLines: [],
        circular: false,
        features: [],
        comments: [],
        type: "DNA"
      },
      success: true,
      messages: []
    });
  });
  it("tests an old-style FASTA", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/oldstyle.fas"),
      "utf8"
    );
    const result = await fastaToJson(string);
    result[0].parsedSequence.sequence.should.equal("actGacgata");
    // result[0].parsedSequence.name.should.equal('my_NAME'); // TODO: should bars be allowed? they have meaning (though the meaning is not consistent across all FASTA files)
  });
  it("tests FASTA with a large single line", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/pBbS8c_RFP.fas"),
      "utf8"
    );
    const result = await fastaToJson(string);
    result[0].parsedSequence.sequence.length.should.equal(5213);
  });
  it("tests protein FASTA and checks for correctness", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/proteinFasta3.fasta"),
      "utf8"
    );
    const result = await fastaToJson(string, {
      isProtein: true
    });
    result[0].parsedSequence.sequence.should.equal(proteinFasta3);
  });
  it("handles the option to guessIfProtein correctly", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/proteinFasta2.fasta"),
      "utf8"
    );
    const result = await fastaToJson(string, { guessIfProtein: true });
    result[0].parsedSequence.type.should.equal("PROTEIN");
  });
  it("handles the parseFastaAsCircular option correctly", async function () {
    const result = await fastaToJson(
      `>mySeq1
gtagagtagagagagg
      `,
      { parseFastaAsCircular: true }
    );
    result[0].parsedSequence.circular.should.equal(true);
  });

  it("keeps input casing", async function () {
    const result = await fastaToJson(
      `>mySeq1
ggagagguagagagagg
      `,
      {
        isDNA: true
      }
    );
    expect(result[0].parsedSequence.sequence[7]).toEqual("u");
    const result2 = await fastaToJson(
      `>mySeq1
GGAGAGGUAGAGAGAGG
      `,
      { isDNA: true }
    );
    expect(result2[0].parsedSequence.sequence[7]).toEqual("U");
  });
  it("handles parseName  option correctly", async function () {
    const fastaStr = `>gb|M73307|AGMA13GT
gtagagtagagagagg
      `;

    // passing parseName as true directly results in old behavior
    const result = await fastaToJson(fastaStr, { parseName: true });
    expect(result[0].parsedSequence.name).toEqual("gb");

    // no options passed at all preserves old behavior
    result.should.include.something.that.deep.equals(
      await fastaToJson(fastaStr)[0]
    );

    // setting parseName to false means that the name doesn't get modfied at all
    const result2 = await fastaToJson(fastaStr, { parseName: false });
    expect(result2[0].parsedSequence.name).toEqual("gb|M73307|AGMA13GT");
  });
});

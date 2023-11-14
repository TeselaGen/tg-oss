//this test takes a sequence represented in several different file types and
//makes sure that they give the same results regardless (for fields that make sense)
import anyToJson from "../src/anyToJson.js";

import fs from "fs";
import path from "path";
import assert from "assert";
import chai from "chai";
import example1OutputChromatogram from "./testData/ab1/example1_output_chromatogram.json";
import ab1ToJson from "../src/ab1ToJson";
import chaiSubset from "chai-subset";
chai.use(require("chai-things"));

chai.use(chaiSubset);
chai.should();

describe("anyToJsonPromise", function () {
  it("should do the same thing as anyToJson but have a standard promise interface", async function () {
    const results = await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/pBbS0c-RFP_no_name.txt"),
        "utf8"
      ),
      { fileName: "pBbS0c-RFP_no_name.txt", isProtein: false }
    );
    results[0].parsedSequence.sequence.length.should.equal(4224);
    results[0].parsedSequence.name.should.equal("pBbS0c-RFP_no_name");
  });
});
describe("anyToJson", function () {
  // @XingGao-PKI - I think the following genbank should still be able to be parsed correctly
  // it("should handle this gbs with lots of start spacing correctly", async function () {
  //   const results = await anyToJson(
  //     `LOCUS       zoink                        20 bp    DNA     linear  15-NOV-2019
  //         ORIGIN
  //                 1 acccuuuuaacccggggcccuuuu
  //         //
  //         `,
  //     {
  //       acceptParts: true,
  //       isRNA: false,
  //       isOligo: false,
  //       primersAsFeatures: true,
  //       fileName: "sequence1.gb"
  //     }
  //   );
  //   console.log(`results:`, results)
  // });
  it("should not break on LQNKMVSDKGRAHKPAWYMGMVNNAYNLSIISTMIL parsed with isProtein=true", async function () {
    const results = await anyToJson("LQNKMVSDKGRAHKPAWYMGMVNNAYNLSIISTMIL", {
      fileName: "randomString.txt",
      isProtein: true,
      emulateBrowser: true //this shouldn't make it to the getFileString fn
    });
    results[0].parsedSequence.sequence.length.should.equal(36);
    results[0].parsedSequence.name.should.equal("randomString");
  });
  it(`snapgene protein file should parse correctly`, async () => {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/prot/3DHZ_B.prot")
    );

    const result = await anyToJson(fileObj, {
      fileName: "3DHZ_B.prot"
    });

    result[0].parsedSequence.isProtein.should.equal(true);
    result[0].parsedSequence.sequence.should.equal(
      `msneydeyianhtdpvkainwnvipdekdlevwdrltgnfwlpekipvsndiqswnkmtpqeqlatmrvftgltlldtiqgtvgaisllpdaetmheeavytniafmesvhaksysnifmtlastpqineafrwseenenlqrkakiimsyyngddplkkkvastllesflfysgfylpmylssrakltntadiirliirdesvhgyyigykyqqgvkklseaeqeeykaytfdlmydlyeneieytediyddlgwtedvkrflrynankalnnlgyeglfptdetkvspailsslspnadenhdffsgsgssyvigkaedttdddwdf`
    );
    // result[0].parsedSequence.description.should.equal("");
  });
  it("addgene-plasmid.dna file should parse correctly", async function () {
    const results = await anyToJson(
      // src/test/testData/dna/addgene-plasmid.dna
      fs.readFileSync(
        path.join(__dirname, "./testData/dna/addgene-plasmid.dna")
      ),
      { fileName: "addgene-plasmid.dna" }
    );
    results[0].parsedSequence.sequence.should.equal(
      "tgttaacttgtttattgcagcttataatggttacaaataaagcaatagcatcacaaatttcacaaataaagcatttttttcactgcattctagttgtggtttgtccaaactcatcaatgtatcttaacgcggaggtttatcgacgatctgctagtgattaatagtaatcaattacggggtcattagttcatagcccatatatggagttccgcgttacataacttacggtaaatggcccgcctggctgaccgcccaacgacccccgcccattgacgtcaataatgacgtatgttcccatagtaacgccaatagggactttccattgacgtcaatgggtggagtatttacggtaaactgcccacttggcagtacatcaagtgtatcatatgccaagtacgccccctattgacgtcaatgacggtaaatggcccgcctggcattatgcccagtacatgaccttatgggactttcctacttggcagtacatctacgtattagtcatcgctattaccatggtgatgcggttttggcagtacatcaatgggcgtggatagcggtttgactcacggggatttccaagtctccaccccattgacgtcaatgggagtttgttttggcaccaaaatcaacgggactttccaaaatgtcgtaacaactccgccccattgacgcaaatgggcggtaggcgtgtacggtgggaggtctatataagcagagctggtttagtgaaccgtcagatccgctagcgctaccggtcgccaccatggtgagcaagggcgaggagctgttcaccggggtggtgcccatcctggtcgagctggacggcgacgtaaacggccacaagttcagcgtgtccggcgagggcgagggcgatgccacctacggcaagctgaccctgaagttcatctgcaccaccggcaagctgcccgtgccctggcccaccctcgtgaccaccctgacctacggcgtgcagtgcttcagccgctaccccgaccacatgaagcagcacgacttcttcaagtccgccatgcccgaaggctacgtccaggagcgcaccatcttcttcaaggacgacggcaactacaagacccgcgccgaggtgaagttcgagggcgacaccctggtgaaccgcatcgagctgaagggcatcgacttcaaggaggacggcaacatcctggggcacaagctggagtacaactacaacagccacaacgtctatatcatggccgacaagcagaagaacggcatcaaggtgaacttcaagatccgccacaacatcgaggacggcagcgtgcagctcgccgaccactaccagcagaacacccccatcggcgacggccccgtgctgctgcccgacaaccactacctgagcacccagtccgccctgagcaaagaccccaacgagaagcgcgatcacatggtcctgctggagttcgtgaccgccgccgggatcactctcggcatggacgagctgtacaagtccggactcagatccaccggatctagataactgatcataatcagccataccacatttgtagaggttttacttgctttaaaaaacctcccacacctccccctgaacctgaaacataaaatgaatgcaattgttgttgttaacttgtttattgcagcttataatggttacaaataaagcaatagcatcacaaatttcacaaataaagcatttttttcactgcattctagttgtggtttgtccaaactcatcaatgtatcttaacgcgatcaagctagcttgctagactcgactgactataataataaaacgccaactttgacccggaacgcggaaaacacctgagaaaaacacctgggcgagtctccacgtaaacggtcaaagtccccgcggccctagacaaatattacgcgctatgagtaacacaaaattattcagatttcacttcctcttattcagttttcccgcgaaaatggccaaatcttactcggttacgcccaaatttactacaacatccgcctaaaaccgcgcgaaaattgtcacttcctgtgtacaccggcgcacaccaaaaacgtcacttttgccacatccgtcgcttacatgtgttccgccacacttgcaacatcacacttccgccacactactacgtcacccgccccgttcccacgccccgcgccacgtcacaaactccaccccctcattatcatattggcttcaatccaaaataaggtatattattgatgatgttaattaagaattaattcgatcctgaatggcgaatggacgcgccctgtagcggcgcattaagcgcggcgggtgtggtggttacgcgcagcgtgaccgctacacttgccagcgccctagcgcccgctcctttcgctttcttcccttcctttctcgccacgttcgccggctttccccgtcaagctctaaatcgggggctccctttagggttccgatttagtgctttacggcacctcgaccccaaaaaacttgattagggtgatggttcacgtagtgggccatcgccctgatagacggtttttcgccctttgacgttggagtccacgttctttaatagtggactcttgttccaaactggaacaacactcaaccctatctcggtctattcttttgatttataagggattttgccgatttcggcctattggttaaaaaatgagctgatttaacaaaaattttaacaaaattcagaagaactcgtcaagaaggcgatagaaggcgatgcgctgcgaatcgggagcggcgataccgtaaagcacgaggaagcggtcagcccattcgccgccaagctcttcagcaatatcacgggtagccaacgctatgtcctgatagcggtccgccacacccagccggccacagtcgatgaatccagaaaagcggccattttccaccatgatattcggcaagcaggcatcgccatgggtcacgacgagatcctcgccgtcgggcatgctcgccttgagcctggcgaacagttcggctggcgcgagcccctgatgctcttcgtccagatcatcctgatcgacaagaccggcttccatccgagtacgtgctcgctcgatgcgatgtttcgcttggtggtcgaatgggcaggtagccggatcaagcgtatgcagccgccgcattgcatcagccatgatggatactttctcggcaggagcaaggtgagatgacaggagatcctgccccggcacttcgcccaatagcagccagtcccttcccgcttcagtgacaacgtcgagcacagctgcgcaaggaacgcccgtcgtggccagccacgatagccgcgctgcctcgtcttgcagttcattcagggcaccggacaggtcggtcttgacaaaaagaaccgggcgcccctgcgctgacagccggaacacggcggcatcagagcagccgattgtctgttgtgcccagtcatagccgaatagcctctccacccaagcggccggagaacctgcgtgcaatccatcttgttcaatcatgcgaaacgatcctcatcctgtctcttgatcagagcttgatcccctgcgccatcagatccttggcggcaagaaagccatccagtttactttgcagggcttcccaaccttaccagagggcgccccagctggcaattccggttcgcttgctgtccataaaaccgcccagtctagctatcgccatgtaagcccactgcaagctacctgctttctctttgcgcttgcgttttcccttgtccagatagcccagtagctgacattcatccggggtcagcaccgtttctgcggactggctttctacgtgaaaaggatctaggtgaagatcctttttgataatctcatggctgcagcaatggcaacaacgttgcgcaaactattaactggcgaactacttactctagcttcccggcaacaattaatagactggatggaggcggataaagttgcaggaccacttctgcgctcggcccttccggctggctggtttattgctgataaatctggagccggtgagcgtgggtctcgcggtatcattgcagcactggggccagatggtaagccctcccgtatcgtagttatctacacgacggggagtcaggcaactatggatgaacgaaatagacagatcgctgagataggtgcctcactgattaagcattggtaactgtcagaccaagtttactcatatatactttagattgatttaaaacttcatttttaatttaaaaggatctaggtgaagatcctttttgataatctcatgaccaaaatcccttaacgtgagttttcgttccactgagcgtcagaccccgtagaaaagatcaaaggatcttcttgagatcctttttttctgcgcgtaatctgctgcttgcaaacaaaaaaaccaccgctaccagcggtggtttgtttgccggatcaagagctaccaactctttttccgaaggtaactggcttcagcagagcgcagataccaaatactgtccttctagtgtagccgtagttaggccaccacttcaagaactctgtagcaccgcctacatacctcgctctgctaatcctgttaccagtggctgctgccagtggcgataagtcgtgtcttaccgggttggactcaagacgatagttaccggataaggcgcagcggtcgggctgaacggggggttcgtgcacacagcccagcttggagcgaacgacctacaccgaactgagatacctacagcgtgagctatgagaaagcgccacgcttcccgaagggagaaaggcggacaggtatccggtaagcggcagggtcggaacaggagagcgcacgagggagcttccagggggaaacgcctggtatctttatagtcctgtcgggtttcgccacctctgacttgagcgtcgatttttgtgatgctcgtcaggggggcggagcctatggaaaaacgccagcaacgcggcctttttacggttcctggccttttgctggccttttgctcacatgttctttcctgcgttatcccctgattctgtggataaccgtattaccgcctttgagtgagctgataccgctcgccgcagccgaacgaccgagcgcagcgagtcagtgagcgaggaagcggaagagcgcctgatgcggtattttctccttacgcatctgtgcggtatttcacaccgcatatggatccatgcatgttaattaacatcatcaataatataccttattttggattgaagccaatatgataatgagggggtggagtttgtgacgtggcgcggggcgtgggaacggggcgggtgacgtaggttttagggcggagtaacttgtatgtgttgggaattgtagttttcttaaaatgggaagtgacgtaacgtgggaaaacggaagtgacgatttgaggaagttgtgggttttttggctttcgtttctgggcgtaggttcgcgtgcggttttctgggtgttttttgtggactttaaccgttacgtcattttttagtcctatatatactcgctctgcacttggcccttttttacactgtgactgattgagctggtgccgtgtcgagtggtgtttttttaataggttttcttttttactggtaaggctgactgttatggctgccgctgtggaagcgctgtatgttgttctggagcgggagggtgctattttgcctaggcaggagggtttttcaggtgtttatgtgtttttctctcctattaattttgttatacctcctatgggggctgtaatgttgtctctacgcctgcgggtatgtattcccccgggctatttcggtcgctttttagcactgaccgatgtgaatcaacctgatgtgtttaccgagtcttacattatgactccggacatgaccgaggagctgtcggtggtgctttttaatcacggtgaccagtttttttacggtcacgccggcatggccgtagtccgtcttatgcttataagggttgtttttcctgttgtaagacaggcttctaatgtttaaatgtttttttgttattttattttgtgtttatgcagaaacccgcagacatgtttgagagaaaaatggtgtctttttctgtggtggttccggagcttacctgcctttatctgcatgagcatgactacgatgtgctttcttttttgcgcgaggctttgcctgattttttgagcagcaccttgcattttatatcgccgcccatgcaacaagctattgaattcgtttaaactccctctcaagtctgtatacggggacacggacagccttttcgtcaccgagcgtggacaccggctcatggaaaccagaggtaagaaacgcatcaaaaagcatgggggaaacctggtttttgaccccgaacggccagagctcacctggctcgtggaatgcgagaccgtctgcggggcctgcggcgcggatgcctactccccggaatcggtatttctcgcgcccaagctctacgccctcaaaagtctgcactgcccctcgtgcggcgcctcctccaagggcaagctgcgcgccaagggccacgccgcggaggggctggactatgacaccatggtcaaatgctacctggccgacgcgcagggcgaagaccggcagcgcttcagcaccagcaggaccagcctcaagcgcaccctggccagcgcgcagcccggagcgcaccccttcaccgtgacccagactacgctgacgaggaccctgcgcccgtggaaagacatgaccctggcccgtctggacgagcaccgactactgccgtacagcgaaagccgccccaacccgcgaaacgaggagatatgctggatcgagatgccgtagagcaggtgaccgagctgtgggaccgcctggaactgcttggtcaaacgctcaaaagcatgcctacggcggacggtctcaaaccgttgaaaaactttgcttccttgcaagaactgctatcgctgggcggcgagcgccttctggcggatttggtcagggaaaacatgcgagtcagggacatgcttaacgaagtggcccccctgctcagggatgacggcagctgcagctctcttaactaccagttgcagccggtaataggtgtgatttacgggcccaccggctgcggtaagtcgcagctgctcaggaacctgctttcttcccagctgatctcccctaccccggaaaccgttttcttcatcgccccgcaggtagacatgatccccccatctgaactcaaagcgtgggaaatgcaaatctgtgagggtaactacgcccctgggccggatggaaccattataccgcagtctggcaccctccgcccgcgctttgtaaaaatggcctatgacgatctcatcctggaacacaactatgacgttagtgatcccagaaatatcttcgcccaggccgccgcccgtgggcccattgccatcattatggacgaatgcatggaaaatcttggaggtcacaagggcgtctccaagttcttccacgcatttccttctaagctacatgacaaatttcccaagtgcaccggatacactgtgctggtggttctgcacaacatgaatccccggagggatatggctgggaacatagccaacctaaaaatacagtccaagatgcatctcatatccccacgtatgcacccatcccagcttaaccgctttgtaaacacttacaccaagggcctgcccctggcaatcagcttgctactgaaagacatttttaggcaccacgcccagcgctcctgctacgactggatcatctacaacaccaccccgcagcatgaagctctgcagtggtgctacctccaccccagagacgggcttatgcccatgtatctgaacatccagagtcacctttaccacgtcctggaaaaaatacacaggaccctcaacgaccgagaccgctggtcccgggcctaccgcgcgcgcaaaacccctaaataaagacagcaagacacttgcttgatccaaatccaaacagagtctggttttttatttatgttttaaaccgcattgggaggggaggaagccttcagggcagaaacctgctggcgcagatccaacagctgctgagaaacgacattaagttcccgggtcaaagaatccaattgtgccaaaagagccgtcaacttgtcatcgcgggcggatgaacgggaagctgcactgcttgcaagcgggctcaggaaagcaaagtcagtcacaatcccgcgggcggtggctgcagcggctgaagcggcggcggaggctgcagtctccaacggcgttccagacacggtctcgtaggtcaaggtagtagagtttgcgggcaggacggggcgaccatcaatgctggagcccatcacattctgacgcaccccggcccatgggggcatgcgcgttgtcaaatatgagctcacaatgcttccatcaaacgagttggtgctcatggcggcggcggctgctgcaaaacagatacaaaactacataagacccccaccttatatattctttcccacccttaaccacgcccagatcctctagcagtgataaacgtctaatagtaatcaattacggggtcattagttcatagcccatatatggagttccgcgttacataacttacggtaaatggcccgcctggctgaccgcccaacgacccccgcccattgacgtcaataatgacgtatgttcccatagtaacgccaatagggactttccattgacgtcaatgggtggagtatttacggtaaactgcccacttggcagtacatcaagtgtatcatatgccaagtacgccccctattgacgtcaatgacggtaaatggcccgcctggcattatgcccagtacatgaccttatgggactttcctacttggcagtacatctacgtattagtcatcgctattaccatggtgatgcggttttggcagtacatcaatgggcgtggatagcggtttgactcacggggatttccaagtctccaccccattgacgtcaatgggagtttgttttggcaccaaaatcaacgggactttccaaaatgtcgtaacaactccgccccattgacgcaaatgggcggtaggcgtgtacggtgggaggtctatataagcagagctggtttagtgaaccgtcagatccgctagagatctggtaccgtcgacgcggccgctcgagcctaagcttctagataagatatccgatccaccggatctagataactgatcataatcagccataccacatttgtagaggttttacttgctttaaaaaacctcccacacctccccctgaacctgaaacataaaatgaatgcaattgttgt"
    );
    results[0].parsedSequence.sequence.length.should.equal(9237);
    results[0].parsedSequence.name.should.equal("pAdTrack-CMV");
    results[0].parsedSequence.description.should.equal(
      "Shuttle vector for us in AdEasy System. For expression of transgenes under a CMV promoter when a GFP tracer is desired."
    );
    // results[0].parsedSequence.name.should.equal("randomString");
  });
  it("parses a simple .txt file as fasta", async function () {
    const result = await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/pBbS0c-RFP_no_name.txt"),
        "utf8"
      ),
      {
        fileName: "pBbS0c-RFP_no_name.txt",
        parseFastaAsCircular: true,
        isProtein: false
      }
    );

    result[0].parsedSequence.sequence.length.should.equal(4224);
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.name.should.equal("pBbS0c-RFP_no_name");
  });
  it("should automatically treat .faa files as protein", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/fasta/proteinFasta.faa"),
      "utf8"
    );
    const result = await anyToJson(string, { fileName: "proteinFasta.faa" });
    result[0].parsedSequence.name.should.equal("gi");
    result[0].parsedSequence.description.should.equal(
      "359950697|gb|AEV91138.1| Rfp (plasmid) [synthetic construct]"
    );
    result[0].parsedSequence.sequence.should.equal(
      "MRSSKNVIKEFMRFKVRMEGTVNGHEFEIEGEGEGRPYEGHNTVKLKVTKGGPLPFAWDILSPQFQYGSKVYVKHPADIPDYKKLSFPEGFKWERVMNFEDGGVVTVTQDSSLQDGCFIYKVKFIGVNFPSDGPVMQKKTMGWEASTERLYPRDGVLKGEIHKALKLKDGGHYLVEFKSIYMAKKPVQLPGYYYVDSKLDITSHNEDYTIVEQYERTEGRHHLFL"
    );
    result[0].parsedSequence.isProtein.should.equal(true);
  });
  it("handles parseFastaAsCircular=true", async function () {
    const result = await anyToJson(
      ">simpleFasta \n gatggagagag",

      { parseFastaAsCircular: true, isProtein: false }
    );
    result[0].parsedSequence.sequence.length.should.equal(11);
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.name.should.equal("simpleFasta");
  });
  it("allows in JSON files", async function () {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/json/1.json")
    );
    const result = await anyToJson(fileObj, { fileName: "1.json" });
    result[0].parsedSequence.sequence.length.should.equal(5901);
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.name.should.equal("pRS414__modified");
    result[0].parsedSequence.features.should.containSubset([
      { name: "Ampicillin", type: "CDS", start: 714 }
    ]);
    result[0].parsedSequence.features[0].notes.gene[0].should.equal(
      "Ampicillin"
    );
  });
  it("parse in an ab1 file without failing :)", async function () {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/ab1/example1.ab1")
    );
    const result = await ab1ToJson(fileObj, { fileName: "example1.ab1" });

    result[0].parsedSequence.name.should.equal("example1");
    result[0].parsedSequence.chromatogramData.should.deep.equal(
      example1OutputChromatogram
    );
    result[0].parsedSequence.sequence.should.equal(
      "NANTCTATAGGCGAATTCGAGCTCGGTACCCGGGGATCCTCTAGAGTCGACCTGCAGGCATGCAAGCTTGAGTATTCTATAGTGTCACCTAAATAGCTTGGCGTAATCATGGTCATAGCTGTTTCCTGTGTGAAATTGTTATCCGCTCACAATTCCACACAACATACGAGCCGGAAGCATAAAGTGTAAAGCCTGGGGTGCCTAATGAGTGAGCTAACTCACATTAATTGCGTTGCGCTCACTGCCCGCTTTCCAGTCGGGAAACCTGTCGTGCCAGCTGCATTAATGAATCGGCCAACGCGCGGGGAGAGGCGGTTTGCGTATTGGGCGCTCTTCCGCTTCCTCGCTCACTGACTCGCTGCGCTCGGTCGTTCGGCTGCGGCGAGCGGTATCAGCTCACTCAAAGGCGGTAATACGGTTATCCACAGAATCAGGGGATAACGCAGGAAAGAACATGTGAGCAAAAGGCCAGCAAAAGGCCAGGAACCGTAAAAAGGCCGCGTTGCTGGCGTTTTTCCATAGGCTCCGCCCCCCTGACGAGCATCACAAAAATCGACGCTCAAGTCAGAGGTGGCGAAACCCGACAGGACTATAAAGATACCAGGCGTTTCCCCCTGGAAGCTCCCTCGTGCGCTCTCCTGTTCCGACCCTGCCGCTTACCGGATACCTGTCCGCCTTTCTCCCTTCGGGAAGCGTGGCGCTTTCTCATAGCTCACGCTGTAGGTATCTCAGTTCGGTGTAGGTCGTTCGCTCCAAGCTGGGCTGTGTGCACGAACCCCCCGTTCAGCCCGACCGCTGCGCCTTATCCGGTAACTATCGTCTTGAGTCCAACCCGGTAAGACACGACTTATCGCCACTGGCAGCAGCCACTGGTAACAGGATTAGCAGAGCGAGGTATGTAGGCGGTGCTACAGAGTTCTTGAAGTGGTGGCCTAACTACGGCTACACTAGAAGAACAGTATTTGGTATCTGCGCTCTGCTGAAGCCAGTTACCTTCGGAAAAAGAGTTGGTAGCTCTNGATCCGGCAACAACCACCGCTGGTAGCGGNGGTTTTTTGTTNGCAAGCAGCANATTACNCNCAAAAAAAAANGATCTCAANAAAATCCTTNGATNTTTTNNACGGGGNCTGACNCTNAGGGNAAAAAAACTCCCNTTAAGGGATTTNGNCNTGAANTTTNAAAAAGANNTTNCCCNAAAACNNTTNAATTAAAAAAANNTTTAAACNNCCNAAAAATTTNNAAAAAATTGNGGGGAANNNCCAGGNTTTNNTNGGGGGGCCCTNCCCCNNNGGGGTTTTTTTNCCCAAANGNGGCCCCCCCCCNGGNAAAAAAAANAANNGGGGNN"
    );
  });
  it("parses a .fasta file without a name and use the file name", async function () {
    const result = await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/pBbS0c-RFP_no_name.fasta"),
        "utf8"
      ),
      { fileName: "pBbS0c-RFP_no_name.fasta", isProtein: false }
    );

    result[0].parsedSequence.name.should.equal("pBbS0c-RFP_no_name");
  });

  it("should call the success callback for an ambiguously named file only once (it shouldn't break parsing the file)", async function () {
    await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/pBbS0c-RFP_no_name.gb"),
        "utf8"
      ),
      { fileName: "pBbS0c-RFP", isProtein: false }
    );
  });

  it("should parse a jbei .xml file correctly (not requiring the .seq extension)", async function () {
    const res = await anyToJson(
      fs.readFileSync(path.join(__dirname, "./testData/P2A_3.xml"), "utf8"),
      { fileName: "P2A_3.xml", isProtein: false }
    );
    assert(res[0].success);
    assert(res[0].parsedSequence.name === "P2A_3");
    assert(
      res[0].parsedSequence.sequence ===
        "ggttctggtgctactaatttttctttgttgaaacaagctggtgatgttgaagaaaatccaggtcca"
    );
  });

  it("parses the pBbE0c-RFP plasmid represented in various filetypes to the same end result", async function () {
    const options = {
      fastaFilePath: "pBbE0c-RFP.fasta",
      genbankFilePath: "pBbE0c-RFP.gb",
      sbolFilePath: "pBbE0c-RFP.xml",
      jbeiFilePath: "pBbE0c-RFP.seq"
    };

    const fastaResult = await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/", options.fastaFilePath),
        "utf8"
      ),
      {
        fileName: options.fastaFilePath,
        isProtein: false
      }
    );

    const genbankResult = await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/", options.genbankFilePath),
        "utf8"
      ),
      {
        fileName: options.genbankFilePath,
        isProtein: false
      }
    );

    const sbolXMLResult = await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/", options.sbolFilePath),
        "utf8"
      ),
      {
        fileName: options.sbolFilePath,
        isProtein: false
      }
    );
    const jbeiXMLResult = await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/", options.jbeiFilePath),
        "utf8"
      ),
      {
        fileName: options.jbeiFilePath,
        isProtein: false
      }
    );

    //fasta to genbank check
    fastaResult[0].parsedSequence.sequence.should.equal(
      genbankResult[0].parsedSequence.sequence
    );
    sbolXMLResult[0].parsedSequence.features.length.should.equal(
      genbankResult[0].parsedSequence.features.length
    );
    jbeiXMLResult[0].parsedSequence.features.length.should.equal(
      genbankResult[0].parsedSequence.features.length
    );
    // sbolXMLResult[0].parsedSequence.circular.should.equal(genbankResult[0].parsedSequence.circular);
    sbolXMLResult[0].parsedSequence.sequence
      .toLowerCase()
      .should.equal(genbankResult[0].parsedSequence.sequence.toLowerCase());
    jbeiXMLResult[0].parsedSequence.sequence
      .toLowerCase()
      .should.equal(genbankResult[0].parsedSequence.sequence.toLowerCase());
    //sbolXml to genbank check
    //can't make checks for circularity because sbol sequences are assumed to be linear
    // assert(sbolXMLResult[0].parsedSequence.circular === genbankResult[0].parsedSequence.circular);
    sbolXMLResult[0].parsedSequence.features.forEach(function (feat1) {
      assert(
        genbankResult[0].parsedSequence.features.filter(function (feat2) {
          //can't make checks for start or end because features are split on the origin in sbol
          if (feat1.name === feat2.name) {
            if (feat1.name === "RFP cassette") return true; //this feature is not specified in SBOL
            if (feat1.start === 0 && feat1.end === 0) {
              return true;
            }
            if (feat1.start === feat2.start && feat1.end === feat2.end) {
              return true;
            }
          }
          return false;
        }).length
      );
    });
    //jbeiXml to genbank check
    jbeiXMLResult[0].parsedSequence.features.forEach(function (feat1) {
      assert(
        genbankResult[0].parsedSequence.features.filter(function (feat2) {
          if (feat1.name === feat2.name) {
            if (feat1.start === feat2.start && feat1.end === feat2.end) {
              return true;
            }
          }
          return false;
        }).length
      );
    });
  });
  it("parses a gff file", async function () {
    const result = await anyToJson(
      fs.readFileSync(
        path.join(__dirname, "./testData/gff/example.gff3"),
        "utf8"
      ),
      { fileName: "./testData/gff/example.gff3" }
    );

    result[0].parsedSequence.name.should.equal("P1:B01");
  });
});

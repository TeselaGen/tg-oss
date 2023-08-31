/**
 * testing file for the snapgene parser, which should be able to handle multiple sequences in the same file, comments, and any other sort of vaild snapgene format
 */
import snapgeneToJson from "../src/snapgeneToJson";

import path from "path";
import fs from "fs";
import chai from "chai";
import chaiSubset from "chai-subset";
chai.use(require("chai-things"));
chai.use(chaiSubset);
chai.should();

describe("snapgene file parser", function () {
  it(`snapgene protein file should parse correctly`, async () => {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/prot/3DHZ_B.prot")
    );

    const result = await snapgeneToJson(fileObj, {
      fileName: "3DHZ_B.prot"
    });
    result[0].parsedSequence.isProtein.should.equal(true);
    result[0].parsedSequence.features.should.containSubset([
      {
        name: "source",
        type: "source",
        strand: 1,
        start: 0,
        end: 986
      },
      {
        name: "helix 14",
        type: "SecStr",
        strand: 1,
        start: 12,
        end: 35
      },
      {
        name: "dimer interface [polypeptide binding]",
        type: "Site",
        locations: [
          {
            start: 54,
            end: 56
          },
          {
            start: 87,
            end: 89
          },
          {
            start: 108,
            end: 110
          },
          {
            start: 303,
            end: 308
          },
          {
            start: 315,
            end: 317
          },
          {
            start: 324,
            end: 329
          },
          {
            start: 336,
            end: 338
          },
          {
            start: 345,
            end: 347
          },
          {
            start: 393,
            end: 398
          },
          {
            start: 405,
            end: 407
          }
        ],
        strand: 1,
        start: 54,
        end: 407
      }
    ]);
    result[0].parsedSequence.sequence.should.equal(
      `msneydeyianhtdpvkainwnvipdekdlevwdrltgnfwlpekipvsndiqswnkmtpqeqlatmrvftgltlldtiqgtvgaisllpdaetmheeavytniafmesvhaksysnifmtlastpqineafrwseenenlqrkakiimsyyngddplkkkvastllesflfysgfylpmylssrakltntadiirliirdesvhgyyigykyqqgvkklseaeqeeykaytfdlmydlyeneieytediyddlgwtedvkrflrynankalnnlgyeglfptdetkvspailsslspnadenhdffsgsgssyvigkaedttdddwdf`
    );
    // result[0].parsedSequence.description.should.equal("");
  });
  it(`snapgene protein file should parse correctly`, async () => {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/prot/ADH67109.prot")
    );

    const result = await snapgeneToJson(fileObj, {
      fileName: "ADH67109.prot"
    });
    result[0].parsedSequence.isProtein.should.equal(true);
    result[0].parsedSequence.sequence.should.equal(
      `msapiaarsartafrplpagtrhlvrlslrrdrvlvtvwlavtvgialggavsadatyptpearqerweqlqsvpmfalfqsrafaasaealvaqqafaaatmcaalgavllvvrgtrteeasgrsellggaplgrhaglagaltvalgsaavlaaviaagllalglpvagsvalalvtaaaagvgaglaavsvqctarpgaaaglalgafyvmhmvrgtgaaagggalwltwavpngwlenvrpfaderwwallpvlawialtvgaafalaerrdlgfalfsrrggpvraarwlrsvpalvwrlhrgsvlvwaaalavmglamgrtgaqamaeyadmpwvramaaelgvepadtffvyvvfafvfpvaahavltalcvraeenagtgelllagptgrtawalahaataftapvvllaalgvavglgaglggervwfdvgrftaltlslapavwvvvavtllaygtvpracaavgwgflalgilteiavkvnlvpdavftlvspfahvnpyyrrtwasypllaalaavltavglwalrrrdlpa`
    );
    // result[0].parsedSequence.description.should.equal("");
  });
  it(`the description should not include <html><body> text (we should remove it if we see it)`, async () => {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/T7 promoter.dna")
    );

    const result = await snapgeneToJson(fileObj, {
      fileName: "T7 promoter.dna"
    });

    result[0].parsedSequence.description.should.equal(
      "Promoter for bacteriophage T7 RNA polymerase."
    );
  });
  it(`an invalid file should return an unsuccessful response`, async () => {
    console.info(
      `^^^^^^^^^^^^^^^^^^^^^^^THIS SHOULD FAIL!! ^^^^^^^^^^^^^^^^^^^^^^^`
    );
    const results = await snapgeneToJson(
      { zoink: "berg" },
      {
        fileName: "GFPuv_025_fwdfeature_linear.dna"
      }
    );
    results[0].success.should.equal(false);
    console.info(
      `^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`
    );
  });
  it("linear dna w/feature on forward strand", async function () {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/GFPuv_025_fwdfeature_linear.dna")
      // path.join(__dirname, "./testData/dna/GFPuv_025_fwdfeature_linear.dna"),
    );
    const result = await snapgeneToJson(fileObj, {
      fileName: "GFPuv_025_fwdfeature_linear.dna"
    });

    result[0].parsedSequence.name.should.equal("GFPuv_025_fwdfeature_linear");
    result[0].parsedSequence.circular.should.equal(false);
    result[0].parsedSequence.sequence
      .toLowerCase()
      .should.equal(
        "cagaaagcgtcacaaaagatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgttttgccgtggagcaatgagaacgagccattgagatcatacttacctttgcatgtcactcaaaattttgcctcaaaactgggtgagctgaatttttgcagtaggcatcgtgtaagtttttctagtcggaatgatgatagatcgtaagttatggatggttggcatttgtccagttcatgttatctggggtgttcgtcagtcggtcagcagatccacatagtggttcatctagatcacac"
      );
    result[0].parsedSequence.features.should.containSubset([
      {
        // we're returning 0-based
        start: 399,
        end: 499,
        name: "fwdFeature"
      }
    ]);
  });
  it("circular dna w/feature on forward strand", async function () {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/GFPuv_025_fwdfeature_circular.dna")
    );
    const result = await snapgeneToJson(fileObj, {
      fileName: "GFPuv_025_fwdfeature_circular.dna"
    });

    result[0].parsedSequence.name.should.equal("GFPuv_025_fwdfeature_circular");
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.sequence
      .toLowerCase()
      .should.equal(
        "cagaaagcgtcacaaaagatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgttttgccgtggagcaatgagaacgagccattgagatcatacttacctttgcatgtcactcaaaattttgcctcaaaactgggtgagctgaatttttgcagtaggcatcgtgtaagtttttctagtcggaatgatgatagatcgtaagttatggatggttggcatttgtccagttcatgttatctggggtgttcgtcagtcggtcagcagatccacatagtggttcatctagatcacac"
      );
    result[0].parsedSequence.features.should.containSubset([
      {
        start: 299,
        end: 399,
        name: "fwdFeature"
      }
    ]);
  });
  it("linear dna w/feature on reverse strand", async function () {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/GFPuv_025_revfeature_linear.dna")
    );
    const result = await snapgeneToJson(fileObj, {
      fileName: "GFPuv_025_revfeature_linear.dna"
    });

    result[0].parsedSequence.name.should.equal("GFPuv_025_revfeature_linear");
    result[0].parsedSequence.circular.should.equal(false);
    result[0].parsedSequence.sequence
      .toLowerCase()
      .should.equal(
        "cagaaagcgtcacaaaagatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgttttgccgtggagcaatgagaacgagccattgagatcatacttacctttgcatgtcactcaaaattttgcctcaaaactgggtgagctgaatttttgcagtaggcatcgtgtaagtttttctagtcggaatgatgatagatcgtaagttatggatggttggcatttgtccagttcatgttatctggggtgttcgtcagtcggtcagcagatccacatagtggttcatctagatcacac"
      );
    result[0].parsedSequence.features.should.containSubset([
      {
        // complement(600..700)
        start: 599,
        end: 699,
        name: "revFeature"
      }
    ]);
  });
  it("circular dna w/feature on reverse strand", async function () {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/GFPuv_025_revfeature_circular.dna")
    );
    const result = await snapgeneToJson(fileObj, {
      fileName: "GFPuv_025_revfeature_circular.dna"
    });

    result[0].parsedSequence.name.should.equal("GFPuv_025_revfeature_circular");
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.sequence
      .toLowerCase()
      .should.equal(
        "cagaaagcgtcacaaaagatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgttttgccgtggagcaatgagaacgagccattgagatcatacttacctttgcatgtcactcaaaattttgcctcaaaactgggtgagctgaatttttgcagtaggcatcgtgtaagtttttctagtcggaatgatgatagatcgtaagttatggatggttggcatttgtccagttcatgttatctggggtgttcgtcagtcggtcagcagatccacatagtggttcatctagatcacac"
      );
    result[0].parsedSequence.features.should.containSubset([
      {
        // complement(500..600)
        start: 499,
        end: 599,
        name: "revFeature",
        arrowheadType: "BOTTOM",
        strand: -1
      }
    ]);
  });
  it("circular dna w/feature on both strands and ", async function () {
    const fileObj = fs.readFileSync(
      path.join(
        __dirname,
        "./testData/dna/addgene-plasmid-50004-sequence-74675.dna"
      )
    );
    const result = await snapgeneToJson(fileObj, {
      fileName: "addgene-plasmid-50004-sequence-74675.dna"
    });
    result[0].parsedSequence.name.should.equal("pUC18");
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.sequence
      .toLowerCase()
      .should.equal(
        "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgcagctcccggagacggtcacagcttgtctgtaagcggatgccgggagcagacaagcccgtcagggcgcgtcagcgggtgttggcgggtgtcggggctggcttaactatgcggcatcagagcagattgtactgagagtgcaccatatgcggtgtgaaataccgcacagatgcgtaaggagaaaataccgcatcaggcgccattcgccattcaggctgcgcaactgttgggaagggcgatcggtgcgggcctcttcgctattacgccagctggcgaaagggggatgtgctgcaaggcgattaagttgggtaacgccagggttttcccagtcacgacgttgtaaaacgacggccagtgccaagcttgcatgcctgcaggtcgactctagaggatccccgggtaccgagctcgaattcgtaatcatggtcatagctgtttcctgtgtgaaattgttatccgctcacaattccacacaacatacgagccggaagcataaagtgtaaagcctggggtgcctaatgagtgagctaactcacattaattgcgttgcgctcactgcccgctttccagtcgggaaacctgtcgtgccagctgcattaatgaatcggccaacgcgcggggagaggcggtttgcgtattgggcgctcttccgcttcctcgctcactgactcgctgcgctcggtcgttcggctgcggcgagcggtatcagctcactcaaaggcggtaatacggttatccacagaatcaggggataacgcaggaaagaacatgtgagcaaaaggccagcaaaaggccaggaaccgtaaaaaggccgcgttgctggcgtttttccataggctccgcccccctgacgagcatcacaaaaatcgacgctcaagtcagaggtggcgaaacccgacaggactataaagataccaggcgtttccccctggaagctccctcgtgcgctctcctgttccgaccctgccgcttaccggatacctgtccgcctttctcccttcgggaagcgtggcgctttctcaaagctcacgctgtaggtatctcagttcggtgtaggtcgttcgctccaagctgggctgtgtgcacgaaccccccgttcagcccgaccgctgcgccttatccggtaactatcgtcttgagtccaacccggtaagacacgacttatcgccactggcagcagccactggtaacaggattagcagagcgaggtatgtaggcggtgctacagagttcttgaagtggtggcctaactacggctacactagaagaacagtatttggtatctgcgctctgctgaagccagttaccttcggaaaaagagttggtagctcttgatccggcaaacaaaccaccgctggtagcggtggtttttttgtttgcaagcagcagattacgcgcagaaaaaaaggatctcaagaagatcctttgatcttttctacggggtctgacgctcagtggaacgaaaactcacgttaagggattttggtcatgagattatcaaaaaggatcttcacctagatccttttaaattaaaaatgaagttttaaatcaatctaaagtatatatgagtaaacttggtctgacagttaccaatgcttaatcagtgaggcacctatctcagcgatctgtctatttcgttcatccatagttgcctgactccccgtcgtgtagataactacgatacgggagggcttaccatctggccccagtgctgcaatgataccgcgagacccacgctcaccggctccagatttatcagcaataaaccagccagccggaagggccgagcgcagaagtggtcctgcaactttatccgcctccatccagtctattaattgttgccgggaagctagagtaagtagttcgccagttaatagtttgcgcaacgttgttgccattgctacaggcatcgtggtgtcacgctcgtcgtttggtatggcttcattcagctccggttcccaacgatcaaggcgagttacatgatcccccatgttgtgcaaaaaagcggttagctccttcggtcctccgatcgttgtcagaagtaagttggccgcagtgttatcactcatggttatggcagcactgcataattctcttactgtcatgccatccgtaagatgcttttctgtgactggtgagtactcaaccaagtcattctgagaatagtgtatgcggcgaccgagttgctcttgcccggcgtcaatacgggataataccgcgccacatagcagaactttaaaagtgctcatcattggaaaacgttcttcggggcgaaaactctcaaggatcttaccgctgttgagatccagttcgatgtaacccactcgtgcacccaactgatcttcagcatcttttactttcaccagcgtttctgggtgagcaaaaacaggaaggcaaaatgccgcaaaaaagggaataagggcgacacggaaatgttgaatactcatactcttcctttttcaatattattgaagcatttatcagggttattgtctcatgagcggatacatatttgaatgtatttagaaaaataaacaaataggggttccgcgcacatttccccgaaaagtgccacctgacgtctaagaaaccattattatcatgacattaacctataaaaataggcgtatcacgaggccctttcgtc"
      );
    result[0].parsedSequence.features.should.containSubset([
      {
        end: 2590,
        name: "AmpR promoter",
        start: 2486,
        strand: -1,
        type: "promoter",
        arrowheadType: "BOTTOM"
      },
      {
        end: 578,
        name: "CAP binding site",
        start: 557,
        strand: 1,
        type: "protein_bind",
        arrowheadType: "NONE"
      },
      {
        end: 454,
        name: "MCS",
        start: 398,
        strand: 1,
        type: "misc_feature",
        arrowheadType: "NONE"
      }
    ]);
  });
});

/* eslint-disable no-unused-expressions*/
import assert from "assert";

import parseGenbank from "../src/genbankToJson";
import jsonToGenbank from "../src/jsonToGenbank";
import path from "path";
import fs from "fs";
import * as chai from "chai";
import chaiSubset from "chai-subset";
chai.use(chaiSubset);
chai.use(require("chai-things"));
chai.should();
describe("genbank exporter/parser conversion", function () {
  it(`should convert a protein sequence into a genpept`, () => {
    const proteinSequence = "MTCAGRRAYL";
    const sequence = "augacnugygcnggnmngmnggcnuayyun";
    const string = jsonToGenbank({
      isProtein: true,
      proteinSequence,
      sequence,
      features: [
        {
          name: "testFeat",
          start: 3, //by default features are dna-indexed when in tgen json form
          end: 29
        }
      ]
    });

    assert(string.indexOf(proteinSequence) !== -1);
    assert(string.indexOf("10 aa            linear") !== -1);
    assert(string.indexOf("misc_feature    2..10") !== -1);
    const result = parseGenbank(string);

    result[0].parsedSequence.proteinSequence.should.equal(proteinSequence);
    // result[0].parsedSequence.sequence.should.equal(sequence) //todo maybe the underlying sequence should be preserved somehow?
    result[0].parsedSequence.isProtein.should.equal(true);

    result[0].parsedSequence.features[0].start.should.equal(3);
    result[0].parsedSequence.features[0].end.should.equal(29);
  });

  it(`should has ss-RNA/RNA/ss-DNA/DNA in the LOCUS line`, () => {
    const dnaSequence = "agctttgggttt";
    const rnaSequence = "agcuuuggguuu";
    const dsDNAString1 = jsonToGenbank({
      sequence: dnaSequence,
      type: "DNA"
    });
    const dsDNAString2 = jsonToGenbank({
      sequence: dnaSequence,
      doubleStranded: true,
      type: "DNA"
    });
    const ssDNAString = jsonToGenbank({
      sequence: dnaSequence,
      sequenceTypeFromLocus: "ss-DNA",
      type: "DNA"
    });

    assert(dsDNAString1.indexOf("DNA") !== -1);
    assert(dsDNAString1.indexOf("ss-DNA") === -1);
    assert(dsDNAString2.indexOf("DNA") !== -1);
    assert(dsDNAString2.indexOf("ss-DNA") === -1);
    assert(ssDNAString.indexOf("ss-DNA") !== -1);

    const dsRNAString1 = jsonToGenbank({
      sequence: rnaSequence,
      doubleStranded: true,
      type: "RNA"
    });
    const dsRNAString2 = jsonToGenbank({
      sequence: rnaSequence,
      sequenceTypeFromLocus: "RNA",
      type: "RNA"
    });
    const ssRNAString = jsonToGenbank({
      sequence: rnaSequence,
      sequenceTypeFromLocus: "ss-RNA",
      type: "RNA"
    });

    assert(dsRNAString1.indexOf("RNA") !== -1);
    assert(dsRNAString1.indexOf("ss-RNA") === -1);
    assert(dsRNAString2.indexOf("RNA") !== -1);
    assert(dsRNAString2.indexOf("ss-RNA") === -1);
    assert(ssRNAString.indexOf("ss-RNA") !== -1);
  });

  it(`should have a space at the 68 position in the genbank locus `, () => {
    const string = jsonToGenbank({
      sequence: "agagagagagag"
    });
    assert(string.indexOf("SYN ") === 65);
  });
  it(`should convert the .description field into a //DEFINITION block in
  the genbank and then have it be parsed back out as a .description again`, () => {
    const description = "Hey I am a test description";
    const string = jsonToGenbank({
      sequence: "agagagagagag",
      description
    });
    assert(string.indexOf("DEFINITION  " + description) !== -1);
    const result = parseGenbank(string);

    result[0].parsedSequence.description.should.equal(description);
  });
  it(`should by convert "sequenceData.primers" into genbank features of type primer_bind with additional primer info of primerBindsOn and bases`, function () {
    const string = jsonToGenbank({
      sequence: "agagagagagag",
      primers: [
        {
          id: "id1",
          name: "prima1",
          start: 2,
          end: 6,
          bases: "gTaaCCCC",
          primerBindsOn: "3prime"
        }
      ]
    });
    const result = parseGenbank(string);
    assert(string.includes(`sequence: gTaaCCCC`));
    assert(string.includes(`/primerBindsOn="3prime"`));
    result[0].parsedSequence.primers[0].start.should.equal(2);
    result[0].parsedSequence.primers[0].end.should.equal(6);
    assert(
      result[0].parsedSequence.primers[0].notes.primerBindsOn === undefined
    );
    assert(result[0].parsedSequence.primers[0].notes.note === undefined);
    result[0].parsedSequence.primers[0].primerBindsOn.should.equal("3prime");
    result[0].parsedSequence.primers[0].bases.should.equal("gTaaCCCC");
  });
  it(`
    should by default convert "sequenceData.parts" into genbank features
    with a note of pragma: ['Teselagen_Part'] on it, and by default convert those features back into parts  `, function () {
    // const breakingJSON = require('./testData/json/breakingJSON_stringified')
    const string = jsonToGenbank({
      sequence: "agagagagagag",
      parts: [
        {
          id: "id1",
          start: 2,
          end: 6
        }
      ]
    });
    const result = parseGenbank(string);

    result[0].parsedSequence.parts[0].start.should.equal(2);
    result[0].parsedSequence.parts[0].end.should.equal(6);
  });

  it(`
    should handle j5_propagated_part and j5_assembly_piece feature types
    when converting into genbank`, function () {
    // const breakingJSON = require('./testData/json/breakingJSON_stringified')
    const string = jsonToGenbank({
      sequence: "agagagagagag",
      features: [
        {
          id: "j5feat1",
          type: "j5_propagated_part",
          start: 2,
          end: 6
        },
        {
          id: "j5id1",
          type: "j5_assembly_piece",
          start: 3,
          end: 9
        }
      ]
    });
    // tnr: the old string used to look like:
    //  j5_propagated_part2046..2063
    //                  /label="ssrA_tag_3prime"
    //                  /pragma="j5_lineage_annotation"
    // now it looks like (note the correct spacing!):
    //  j5_propagated_part 2046..2063
    //              /label="ssrA_tag_3prime"
    //              /pragma="j5_lineage_annotation"

    const result = parseGenbank(string);

    result[0].parsedSequence.features[0].start.should.equal(2);
    result[0].parsedSequence.features[1].start.should.equal(3);
  });
  it(`should add a pragma="overlapsSelf" flag to parts/features where overlapsSelf=true`, function () {
    // const breakingJSON = require('./testData/json/breakingJSON_stringified')
    const string = jsonToGenbank({
      sequence: "agagagagagag",
      features: [
        {
          id: "feat1",
          name: "overlapdog",
          type: "CDS",
          overlapsSelf: true,
          start: 2,
          end: 6
        }
      ],
      parts: [
        {
          id: "part1",
          name: "overlapper",
          overlapsSelf: true,
          start: 2,
          end: 6
        }
      ]
    });

    const result = parseGenbank(string);
    result[0].parsedSequence.features[0].overlapsSelf.should.equal(true);
    result[0].parsedSequence.parts[0].overlapsSelf.should.equal(true);
  });
  it("should parse notes that come in as a JSON stringified object correctly", function () {
    // const breakingJSON = require('./testData/json/breakingJSON_stringified')
    const breakingJSON = require("./testData/json/1.json");
    const string = jsonToGenbank(breakingJSON);
    const result = parseGenbank(string);
    result[0].parsedSequence.features[0].notes.should.to.not.be.null;
  });

  it("should mangle URLs correctly mangleUrls=true", function () {
    const feat1 = {
      notes: {
        someNote: [
          "I include a URL https://github.com/TeselaGen/microbyre-support/issues/70"
        ]
      },
      name: "araC",
      start: 6,
      end: 11,
      type: "CDS",
      strand: -1
    };
    const description =
      "I include multiple URLs https://github.com/TeselaGen/fake/url and anotha one https://github.com/TeselaGen/fake/url/the/2nd";
    const string = jsonToGenbank(
      {
        sequence: "agagagagagag",
        features: [feat1],
        description,
        parts: [
          {
            id: "part1",
            name: "overlapper",
            overlapsSelf: true,
            start: 2,
            end: 6
          }
        ]
      },
      {
        mangleUrls: true
      }
    );

    string.should.not.include("https://github.com/TeselaGen/fake/url");
    string.should.not.include(
      "https://github.com/TeselaGen/microbyre-support/issues/70"
    );

    const result = parseGenbank(string);
    result[0].parsedSequence.features.should.include.something.that.deep.equals(
      { ...feat1, forward: false }
    );
    result[0].parsedSequence.description.should.equal(description);
  });
  it("should strip URLs by default", function () {
    const feat1 = {
      notes: {
        someNote: [
          "I include a URL https://github.com/TeselaGen/microbyre-support/issues/70"
        ]
      },
      name: "araC",
      start: 6,
      end: 11,
      type: "CDS",
      strand: -1
    };
    const description =
      "I include multiple URLs https://github.com/TeselaGen/fake/url and anotha one https://github.com/TeselaGen/fake/url/the/2nd";
    const string = jsonToGenbank({
      sequence: "agagagagagag",
      features: [feat1],
      description,
      parts: [
        {
          id: "part1",
          name: "overlapper",
          overlapsSelf: true,
          start: 2,
          end: 6
        }
      ]
    });

    string.should.not.include("https://github.com/TeselaGen/fake/url");
    string.should.not.include(
      "https://github.com/TeselaGen/microbyre-support/issues/70"
    );

    const result = parseGenbank(string);
    result[0].parsedSequence.features.should.include.something.that.deep.equals(
      {
        ...feat1,
        forward: false,
        notes: {
          someNote: ["I include a URL "]
        }
      }
    );
    result[0].parsedSequence.description.should.include(
      `I include multiple URL`
    );
  });

  it("can interconvert between our parser and our exporter with a malformed genbank", function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/breakingGenbank.gb"),
      "utf8"
    );
    const result = parseGenbank(string);

    const feat1 = {
      notes: {},
      name: "araC",
      start: 6,
      end: 882,
      type: "CDS",
      forward: false
    };
    const feat2 = {
      notes: {},
      name: "T0",
      start: 4300,
      end: 4403,
      type: "terminator",
      strand: 1
    };
    result.should.be.an("array");
    result[0].success.should.be.true;
    result[0].parsedSequence.features.should.be.length(13);
    result[0].parsedSequence.features.should.include.something.that.deep.equals(
      { ...feat1, strand: -1 }
    );
    result[0].parsedSequence.features.should.include.something.that.deep.equals(
      { ...feat2, forward: true }
    );
    const exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
    const res = parseGenbank(exportedGenbankString);

    res.should.be.an("array");
    res[0].success.should.be.true;
    res[0].parsedSequence.features.should.be.length(13);

    res[0].parsedSequence.features.should.include.something.that.deep.equals({
      ...feat1,
      strand: -1
    });
    res[0].parsedSequence.features.should.include.something.that.deep.equals({
      ...feat2,
      forward: true
    });
  });

  it("parses and converts pj5_00001 (aka testGenbankFile.gb) correctly (handling joined feature spans correctly also)", function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/testGenbankFile.gb"),
      "utf8"
    );
    const result = parseGenbank(string);

    result[0].parsedSequence.name.should.equal("pj5_00001");
    result[0].parsedSequence.definition.should.equal(
      "promoter seq from pBAD33."
    );
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.extraLines.length.should.equal(1);
    result[0].parsedSequence.features.length.should.equal(16);
    result[0].parsedSequence.features.should.containSubset([
      {
        name: "XhoI_silent_mutation",
        start: 100,
        end: 400,
        locations: [
          {
            start: 100,
            end: 200
          },
          {
            start: 300,
            end: 400
          }
        ]
      }
    ]);

    result[0].parsedSequence.parts.should.containSubset([
      {
        notes: {
          preferred3PrimeOverhangs: [""],
          preferred5PrimeOverhangs: [""]
        },
        name: "pS8c-gfpuv_sig_pep_vector_backbone",
        start: 1238,
        end: 1234,
        type: "misc_feature",
        strand: 1
      }
    ]);
    result[0].parsedSequence.sequence.length.should.equal(5299);
    const exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
    const res = parseGenbank(exportedGenbankString);

    res[0].parsedSequence.name.should.equal("pj5_00001");
    res[0].parsedSequence.definition.should.equal("promoter seq from pBAD33.");
    res[0].parsedSequence.circular.should.equal(true);
    res[0].parsedSequence.extraLines.length.should.equal(1);
    res[0].parsedSequence.features.length.should.equal(16);
    res[0].parsedSequence.parts.should.containSubset([
      {
        notes: {
          preferred3PrimeOverhangs: [""],
          preferred5PrimeOverhangs: [""]
        },
        name: "pS8c-gfpuv_sig_pep_vector_backbone",
        start: 1238,
        end: 1234,
        type: "misc_feature",
        strand: 1
      }
    ]);
    res[0].parsedSequence.features.should.containSubset([
      {
        name: "XhoI_silent_mutation",
        start: 100,
        end: 400,
        locations: [
          {
            start: 100,
            end: 200
          },
          {
            start: 300,
            end: 400
          }
        ]
      }
    ]);
    res[0].parsedSequence.sequence.length.should.equal(5299);
  });

  it("parses and converts a genbank with just feature start locations correctly", function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/rhaBp-Pfu-pUN_alt.gb"),
      "utf8"
    );
    const result = parseGenbank(string);

    result.should.be.an("array");
    result[0].success.should.be.true;
    result[0].parsedSequence.features.should.containSubset([
      {
        name: "mutation",
        start: 264,
        end: 264
      },
      {
        name: "TSS",
        start: 291,
        end: 291
      }
    ]);
    const exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
    const res = parseGenbank(exportedGenbankString);

    res.should.be.an("array");
    res[0].success.should.be.true;
    res[0].parsedSequence.features.should.containSubset([
      {
        name: "mutation",
        start: 264,
        end: 264
      },
      {
        name: "TSS",
        start: 291,
        end: 291
      }
    ]);
  });
  it("handles features in an array or a keyed object", function () {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      features: {
        feat1: { start: 2, end: 4 }
      },
      accession: "some thing",
      version: "v12312"
    });
    const result = parseGenbank(exportedGenbankString);
    result[0].parsedSequence.accession = "some thing";
    result[0].parsedSequence.version = "v12312";
    result[0].parsedSequence.features.should.containSubset([
      {
        start: 2,
        end: 4
      }
    ]);
  });
  it("should export warnings, assemblyPieces, and lineageAnnotations, as features with pragmas, preserving color and label color", function () {
    const exportedGenbankString = jsonToGenbank({
      name: "testing_primer_export",
      sequence: "ATGCATTGAGGACCTAACCATATCTAA",
      type: "DNA",
      lineageAnnotations: {
        753: {
          id: "753",
          start: 5,
          end: 23,
          color: "indigo",
          name: "j5_lineage_annotation_to_export",
          strand: 1
        }
      },
      assemblyPieces: {
        6667: {
          id: "6667",
          start: 5,
          end: 23,
          color: "#f0f0f0",
          name: "j5_assembly_piece_to_export",
          strand: 1
        }
      },
      warnings: [
        {
          id: "warning1",
          start: 5,
          end: 23,
          name: "warning1",

          color: "red",
          labelColor: "red",
          strand: 1
        },
        {
          id: "warning2",
          start: 5,
          end: 23,
          name: "warning2",
          strand: 1
        }
      ],
      features: {}
    });
    exportedGenbankString.should.include(`/pragma="j5_lineage_annotation"`);
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.lineageAnnotations.should.containSubset([
      {
        start: 5,
        end: 23,
        notes: {},
        color: "indigo",
        name: "j5_lineage_annotation_to_export",
        strand: 1
      }
    ]);
    result[0].parsedSequence.assemblyPieces.should.containSubset([
      {
        start: 5,
        end: 23,
        notes: {},
        color: "#f0f0f0",
        name: "j5_assembly_piece_to_export",
        strand: 1
      }
    ]);
    result[0].parsedSequence.warnings.should.containSubset([
      {
        start: 5,
        end: 23,
        color: "red",
        labelColor: "red",
        name: "warning1",
        strand: 1
      },
      {
        start: 5,
        end: 23,
        name: "warning2",
        strand: 1
      }
    ]);
  });
  it("should export primers as features with type set as primer", function () {
    const exportedGenbankString = jsonToGenbank({
      name: "testing_primer_export",
      sequence: "ATGCATTGAGGACCTAACCATATCTAA",
      type: "DNA",
      primers: {
        753: {
          id: "753",
          start: 5,
          end: 23,
          type: "primer",
          name: "primer_to_export",
          strand: 1
        }
      },
      features: {}
    });
    exportedGenbankString.should.include("primer_bind");
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.primers.should.containSubset([
      {
        type: "primer_bind",
        strand: 1,
        name: "primer_to_export",
        start: 5,
        end: 23
      }
    ]);
  });
  it("handles inclusive1BasedStart and inclusive1BasedEnd options", function () {
    const exportedGenbankString = jsonToGenbank(
      {
        sequence: "gagagagagga",
        features: {
          feat1: { start: 2, end: 4 }
        }
      },
      {
        inclusive1BasedStart: true,
        inclusive1BasedEnd: true
      }
    );
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.features.should.containSubset([
      {
        start: 1,
        end: 3
      }
    ]);
  });
  it("gives genbank that is linear when circular is falsy", function () {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      circular: false
    });
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.circular.should.be.false;
  });
  it('gives genbank that is linear when sequence.circular="0"', function () {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      circular: "0"
    });
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.circular.should.be.false;
  });
  it("handles reformatSeqName=false option", function () {
    const name = "$%^@#";
    const exportedGenbankString = jsonToGenbank(
      {
        sequence: "gagagagagga",
        name: name
      },
      {
        reformatSeqName: false
      }
    );
    const result = parseGenbank(exportedGenbankString, {
      reformatSeqName: false
    });
    result[0].parsedSequence.name.should.equal(name);
  });
  // it('handles reformatSeqName=true (this is on by default) option', function() {
  //     const name = '$%^@#'
  //     const exportedGenbankString = jsonToGenbank({sequence: 'gagagagagga',
  //       name: name
  //     }, {
  //       reformatSeqName: true
  //     })
  //     parseGenbank(exportedGenbankString,{reformatSeqName: false});

  //         result[0].parsedSequence.name.should.equal('_____')
  //
  // });
  it("does not reformat a name with parens in it", function () {
    const name = "aaa(aaa)";
    const exportedGenbankString = jsonToGenbank(
      {
        sequence: "gagagagagga",
        name: name
      },
      {
        reformatSeqName: true
      }
    );
    const result = parseGenbank(
      exportedGenbankString,

      { reformatSeqName: false }
    );
    result[0].parsedSequence.name.should.equal(name);
  });
  it("provides a default name if none is provided", function () {
    const exportedGenbankString = jsonToGenbank(
      {
        sequence: "gagagagagga"
      },
      {
        reformatSeqName: true
      }
    );
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.name.should.equal("Untitled_Sequence");
    const res = parseGenbank(jsonToGenbank({ sequence: "gagagagagga" }));

    res[0].parsedSequence.name.should.equal("Untitled_Sequence");
  });
  it("adds a comment with the words teselagen_unique_id: XXXX if given a .teselagen_unique_id property", function () {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      teselagen_unique_id: "gaslgawlgiubawg;12312asdf"
    });
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.teselagen_unique_id.should.equal(
      "gaslgawlgiubawg;12312asdf"
    );
  });
  it("adds a comment for the library field if the sequence has one", function () {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      library: "libraryField"
    });
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.library.should.equal("libraryField");
  });
  it("adds a comment for the description if the sequence has one", function () {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      description: "my sequence description"
    });
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.description.should.equal(
      "my sequence description"
    );
  });
  it("handles comments parsing and formatting", function () {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      comments: ["gaslgawlgiubawg;12312asdf", "I am alive!"]
    });
    const result = parseGenbank(exportedGenbankString);

    result[0].parsedSequence.comments.length.should.equal(2);
    result[0].parsedSequence.comments[0].should.equal(
      "gaslgawlgiubawg;12312asdf"
    );
    result[0].parsedSequence.comments[1].should.equal("I am alive!");
  });
});

import geneiousXmlToJson from "../src/geneiousXmlToJson";
import anyToJson from "../src/anyToJson";
import path from "path";
import fs from "fs";
import chai from "chai";
import chaiSubset from "chai-subset";
chai.use(chaiSubset);
chai.use(require("chai-things"));
chai.should();

describe("geneiousXmlToJson", function () {
  it("should parse an geneious xml file to our json representation correctly", async function () {
    // var string = fs.readFileSync(path.join(__dirname, '../ext_tests/data/sequences/pBbE0c-RFP.xml'), "utf8");
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/geneious/pAN7-1.geneious"),
      "utf8"
    );
    const result = await geneiousXmlToJson(string);

    result[0].parsedSequence.name.should.equal("pAN7-1");
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.features.length.should.equal(7);
    result[0].parsedSequence.features.should.containSubset([
      {
        end: 3320,
        name: "HygR",
        start: 2301,
        strand: 1,
        type: "CDS",
      },
      {
        arrowheadType: "NONE",
        end: 4100,
        name: "trpC terminator",
        start: 3338,
        strand: -1,
        type: "terminator",
      },
      {
        start: 4718,
        end: 5578,
        name: "AmpR",
        strand: 1,
        type: "CDS",
        locations: [
          {
            start: 4718,
            end: 4786,
          },
          {
            start: 4787,
            end: 5578,
          },
        ],
      },
    ]);
    result[0].parsedSequence.sequence.length.should.equal(6749);
  });
  it("should parse another geneious xml file, pOM-Express to our json representation correctly", async function () {
    // var string = fs.readFileSync(path.join(__dirname, '../ext_tests/data/sequences/pBbE0c-RFP.xml'), "utf8");
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/geneious/pOM-Express-2u-URA3-BAR_GFP.geneious"),
    );
    const result = await anyToJson(string, {
      fileName: "pOM-Express-2u-URA3-BAR_GFP.geneious",
    });

    result[0].parsedSequence.name.should.equal("pOM-Express-2u-URA3-BAR:GFP Copy");
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.features.length.should.equal(38);
    // result[0].parsedSequence.features.should.containSubset([]);
    result[0].parsedSequence.sequence.length.should.equal(8023);
  });
  it("should parse another geneious xml file, pKW-CA-URA3, to our json representation correctly", async function () {
    // var string = fs.readFileSync(path.join(__dirname, '../ext_tests/data/sequences/pBbE0c-RFP.xml'), "utf8");
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/geneious/pKW-CA-URA3.geneious"),
    );
    const result = await anyToJson(string, {
      fileName: "pOM-Express-2u-URA3-BAR_GFP.geneious",
    });

    result[0].parsedSequence.name.should.equal("pKW-CA-URA3 - template");
    result[0].parsedSequence.circular.should.equal(true);
    result[0].parsedSequence.features.length.should.equal(21);
    // result[0].parsedSequence.features.should.containSubset([]);
    result[0].parsedSequence.sequence.length.should.equal(12489);
  });
  it("should return an error (not throw an error) when trying to parse a genbank string", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/genbankThatBrokeSbolImport.gb"),
      "utf8"
    );
    const results = await geneiousXmlToJson(string);
    results[0].success.should.equal(false);
  });
});

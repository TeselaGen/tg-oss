import jbeiXmlToJson from "../src/jbeiXmlToJson";
import path from "path";
import fs from "fs";
import * as chai from "chai";
import chaiSubset from "chai-subset";
chai.use(chaiSubset);
chai.use(require("chai-things"));
chai.should();

describe("jbeiXmlToJson", function () {
  it("should parse an jbei xml file to our json representation correctly", async function () {
    // var string = fs.readFileSync(path.join(__dirname, '../ext_tests/data/sequences/pBbE0c-RFP.xml'), "utf8");
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/5_flank.xml"),
      "utf8"
    );
    const result = await jbeiXmlToJson(string);

    result[0].parsedSequence.name.should.equal("5_flank");
    result[0].parsedSequence.circular.should.equal(false);
    result[0].parsedSequence.features.length.should.equal(2);
    result[0].parsedSequence.features.should.containSubset([
      {
        end: 999,
        name: "1kb_5_prime_flank",
        start: 0,
        strand: 1,
        type: "misc_feature"
      }
    ]);
    result[0].parsedSequence.sequence.length.should.equal(1000);
  });

  it("should return an error (not throw an error) when trying to parse a genbank string", async function () {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/genbankThatBrokeSbolImport.gb"),
      "utf8"
    );
    const results = await jbeiXmlToJson(string);
    results[0].success.should.equal(false);
  });
});

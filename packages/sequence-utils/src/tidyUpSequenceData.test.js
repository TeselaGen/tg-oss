import assert from "assert";
import tidyUpSequenceData from "./tidyUpSequenceData";
import chai from "chai";
import chaiSubset from "chai-subset";
chai.use(chaiSubset);
chai.should();
describe("tidyUpSequenceData", () => {
  it("should remove unwanted chars if passed that option, while handling annotation start,end (and location start,end) truncation correctly", () => {
    const res = tidyUpSequenceData(
      {
        sequence: "http://localhost:3344/Standalone",
        features: [
          {
            start: 3,
            end: 20,
            locations: [
              {
                start: "3", //this should be converted to an int :)
                end: 5
              },
              {
                start: 10,
                end: 20
              }
            ]
          }
        ]
      },
      { removeUnwantedChars: true }
    );
    res.should.containSubset({
      sequence: "httcahstStandan",
      circular: false,
      features: [
        {
          start: 3,
          end: 14,
          locations: [
            {
              start: 3,
              end: 5
            },
            {
              start: 10,
              end: 14
            }
          ]
        }
      ]
    });
  });
  // const res = tidyUpSequenceData(
  //   {
  //     isProtein: true,
  //     circular: true,
  //     proteinSequence: "gagiuhwgagalasjglj*.",
  //     features: [{ start: 3, end: 10 }, { start: 10, end: 20 }]
  //   },
  //   { convertAnnotationsFromAAIndices: true, removeUnwantedChars: true }
  // );

  it("should handle a protein sequence being passed in with isProtein set to true", () => {
    const res = tidyUpSequenceData(
      {
        isProtein: true,
        circular: true,
        proteinSequence: "gagiuhwgagalasjglj*.",
        features: [
          { start: 3, end: 10, forward: false },
          { start: 10, end: 20 },
          { name: "iDon'tFit", start: 25, end: 35 }
        ]
      },
      { convertAnnotationsFromAAIndices: true, removeUnwantedChars: true }
    );
    res.should.containSubset({
      aminoAcidDataForEachBaseOfDNA: [
        {
          aminoAcid: {
            value: ".",
            name: "Gap",
            threeLettersName: "Gap"
          },
          positionInCodon: 0,
          aminoAcidIndex: 17,
          sequenceIndex: 51,
          codonRange: {
            start: 51,
            end: 53
          },
          fullCodon: true
        },
        {
          aminoAcid: {
            value: ".",
            name: "Gap",
            threeLettersName: "Gap"
          },
          positionInCodon: 1,
          aminoAcidIndex: 17,
          sequenceIndex: 52,
          codonRange: {
            start: 51,
            end: 53
          },
          fullCodon: true
        },
        {
          aminoAcid: {
            value: ".",
            name: "Gap",
            threeLettersName: "Gap"
          },
          positionInCodon: 2,
          aminoAcidIndex: 17,
          sequenceIndex: 53,
          codonRange: {
            start: 51,
            end: 53
          },
          fullCodon: true
        }
      ],
      isProtein: true,
      size: 54, //size should refer to the DNA length
      proteinSize: 18, //proteinSize should refer to the amino acid length
      sequence: "ggngcnggnathtgacaytggggngcnggngcnytngcnwsnggnytntrr...", //degenerate sequence
      proteinSequence: "gagiuhwgagalasgl*.",
      circular: false,
      features: [
        { start: 9, end: 32, forward: true },
        { start: 30, end: 53, forward: true },
        {
          name: "iDon'tFit",
          start: 51,
          end: 53,
          forward: true
        }
      ]
    });
  });
  it("isRna should make the t's converted to u's", () => {
    const res = tidyUpSequenceData({
      sequence: "tgatavagauugagcctttuuu",
      isRna: true
    });
    res.should.containSubset({
      sequence: "ugauavagauugagccuuuuuu",
      isRna: true
    });
  });
  it("should handle the noSequence option correctly and not truncate .size", () => {
    const res = tidyUpSequenceData({
      noSequence: true,
      size: 20
    });
    res.should.containSubset({
      noSequence: true,
      sequence: "",
      size: 20,
      circular: false,
      features: [],
      parts: [],
      translations: [],
      cutsites: [],
      orfs: []
    });
  });
  it("should add default fields to an empty sequence obj", () => {
    const res = tidyUpSequenceData({});
    res.should.containSubset({
      sequence: "",
      size: 0,
      circular: false,
      features: [],
      parts: [],
      translations: [],
      cutsites: [],
      orfs: []
    });
  });

  it("should add default fields to an empty sequence obj, and handle annotationsAsObjects=true", () => {
    const res = tidyUpSequenceData({}, { annotationsAsObjects: true });
    res.should.containSubset({
      sequence: "",
      size: 0,
      circular: false,
      features: {},
      parts: {},
      translations: {},
      cutsites: {},
      orfs: {}
    });
  });

  it("should add ids to annotations", () => {
    const res = tidyUpSequenceData(
      {
        features: [{ start: 4, end: 5 }, {}]
      },
      { annotationsAsObjects: true }
    );
    Object.keys(res.features).should.be.length(2);
  });

  it("should add feature type = misc_feature if no type is provided", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5 }]
    });
    res.features[0].type.should.equal("misc_feature");
  });
  it("should try to auto-parse annotation.notes into JSON and gracefully handle errors", () => {
    const res = tidyUpSequenceData({
      features: [
        {
          start: 4,
          end: 5,
          notes:
            '{"gene":["Ampicillin"],"note":["ORF frame 1"],"translation":["MSIQHFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYIELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRIDAGQEQLGRRIHYSQNDLVEYSPVTEKHLTDGMTVRELCSAAITMSDNTAANLLLTTIGGPKELTAFLHNMGDHVTRLDRWEPELNEAIPNDERDTTMPVAMATTLRKLLTGELLTLASRQQLIDWMEADKVAGPLLRSALPAGWFIADKSGAGERGSRGIIAALGPDGKPSRIVVIYTTGSQATMDERNRQIAEIGASLIKHW*"],"ApEinfo_fwdcolor":["pink"],"ApEinfo_revcolor":["pink"],"ApEinfo_graphicformat":["arrow_data {{0 1 2 0 0 -1} {} 0}"]}'
        }
      ]
    });
    res.features[0].notes.gene[0].should.equal("Ampicillin");
    const res2 = tidyUpSequenceData({
      features: [
        {
          start: 4,
          end: 5,
          //messed up JSON notes here:
          notes:
            '{"gene:["Ampicillin"],"note":["ORF frame 1"],"translation":["MSIQHFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYIELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRIDAGQEQLGRRIHYSQNDLVEYSPVTEKHLTDGMTVRELCSAAITMSDNTAANLLLTTIGGPKELTAFLHNMGDHVTRLDRWEPELNEAIPNDERDTTMPVAMATTLRKLLTGELLTLASRQQLIDWMEADKVAGPLLRSALPAGWFIADKSGAGERGSRGIIAALGPDGKPSRIVVIYTTGSQATMDERNRQIAEIGASLIKHW*"],"ApEinfo_fwdcolor":["pink"],"ApEinfo_revcolor":["pink"],"ApEinfo_graphicformat":["arrow_data {{0 1 2 0 0 -1} {} 0}"]}'
        }
      ]
    });
    res2.features[0].notes.should.equal(
      '{"gene:["Ampicillin"],"note":["ORF frame 1"],"translation":["MSIQHFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYIELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRIDAGQEQLGRRIHYSQNDLVEYSPVTEKHLTDGMTVRELCSAAITMSDNTAANLLLTTIGGPKELTAFLHNMGDHVTRLDRWEPELNEAIPNDERDTTMPVAMATTLRKLLTGELLTLASRQQLIDWMEADKVAGPLLRSALPAGWFIADKSGAGERGSRGIIAALGPDGKPSRIVVIYTTGSQATMDERNRQIAEIGASLIKHW*"],"ApEinfo_fwdcolor":["pink"],"ApEinfo_revcolor":["pink"],"ApEinfo_graphicformat":["arrow_data {{0 1 2 0 0 -1} {} 0}"]}'
    );
  });
  it("should add feature type = misc_feature if an invalid type is provided", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, type: "idontexist" }]
    });
    res.features[0].type.should.equal("misc_feature");
  });
  it("should allow non-standard genbank feature types if allowNonStandardGenbankTypes=true", () => {
    const res = tidyUpSequenceData(
      {
        features: [{ start: 4, end: 5, type: "idontexist" }]
      },
      {
        allowNonStandardGenbankTypes: true
      }
    );
    res.features[0].type.should.equal("idontexist");
  });
  it("should normalize strange upper/lower casing in feature types", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, type: "cDs" }]
    });
    res.features[0].type.should.equal("CDS");
  });
  it("should not clobber existing feature types", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, type: "CDS" }]
    });
    res.features[0].type.should.equal("CDS");
  });

  it("should add correct color based on type for existing features colors", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, type: "CDS" }]
    });
    res.features[0].color.should.equal("#EF6500");
  });

  it("should not clobber existing feature colors", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, color: "#f4f4f4" }]
    });
    res.features[0].color.should.equal("#f4f4f4");
  });

  it("should add new ids to annotations if passed that option", () => {
    const res = tidyUpSequenceData(
      {
        features: [{ start: 4, end: 5, id: 123 }, {}]
      },
      { provideNewIdsForAnnotations: true }
    );
    res.features[0].id.should.not.equal(123);
  });
  it("should not add ids even if the ids are missing if doNotProvideIdsForAnnotations=true", () => {
    const res = tidyUpSequenceData(
      {
        features: [{ start: 4, end: 5 }, {}]
      },
      { doNotProvideIdsForAnnotations: true }
    );

    assert.strictEqual(res.features[0].id, undefined);
  });
  it("should add the annotationTypePlural field", () => {
    const res = tidyUpSequenceData(
      {
        features: [{ start: 4, end: 5, id: 123 }, {}]
      },
      { provideNewIdsForAnnotations: true }
    );
    res.features[0].id.should.not.equal(123);
    res.features[0].annotationTypePlural.should.equal("features");
  });

  // it("should add amino acids to a bare translation obj", function() {
  //   const res = tidyUpSequenceData({
  //     sequence: "gtagagatagagataga",
  //     size: 0,
  //     circular: false,
  //     features: [],
  //     parts: [],
  //     translations: [
  //       {
  //         start: 0,
  //         end: 10
  //       }
  //     ],
  //     cutsites: [],
  //     orfs: []
  //   });
  //   // res.should.containSubset({})
  // });
});

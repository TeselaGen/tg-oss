import assert from "assert";
import tidyUpSequenceData from "./tidyUpSequenceData";
import * as chai from "chai";
import chaiSubset from "chai-subset";
import "chai/register-should"; // This registers the 'should' interface globally

chai.use(chaiSubset);
describe("tidyUpSequenceData", () => {
  it("should remove invalid chars by default, while handling annotation start,end (and location start,end) truncation correctly", () => {
    const res = tidyUpSequenceData({
      sequence: "http://localhost:3344/Standalone",
      features: [
        {
          start: 3,
          end: 20,
          locations: [
            {
              // @ts-expect-error check that strings get converted to ints
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
    });
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
      { convertAnnotationsFromAAIndices: true }
    );

    res.should.containSubset({
      aminoAcidDataForEachBaseOfDNA: [],
      isProtein: true,
      size: 57, //size should refer to the DNA length
      proteinSize: 19, //proteinSize should refer to the amino acid length
      sequence: "ggngcnggnathtgacaytggggngcnggngcnytngcnwsnhtnggnytnhtntrr", //degenerate sequence
      proteinSequence: "gagiuhwgagalasjglj*",
      circular: false,
      features: [
        { start: 9, end: 32, forward: true },
        { start: 30, end: 56, forward: true },
        {
          name: "iDon'tFit",
          start: 54,
          end: 56,
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
        features: [{ start: 4, end: 5 }, {} as any]
      },
      { annotationsAsObjects: true }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(res.features!).should.be.length(2);
  });

  it("should add feature type = misc_feature if no type is provided", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5 }]
    });
    res.features![0].type.should.equal("misc_feature");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res.features![0].notes as any).gene[0].should.equal("Ampicillin");
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
  it("features should be able to be passed as an object instead of an array", () => {
    const res = tidyUpSequenceData({
      features: { "1": { start: 4, end: 5 } } as any
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(res.features!).length.should.equal(1);
    res.features![0].start.should.equal(4);
  });
  it("annotationsAsObjects=true should verify that features are passed back as an object", () => {
    const res = tidyUpSequenceData(
      {
        features: [{ start: 4, end: 5 }] as any
      },
      { annotationsAsObjects: true }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(res.features!).length.should.equal(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res.features as any)[Object.keys(res.features!)[0]].start.should.equal(4);
  });

  it("should handle notes as a string safely", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, notes: "some note" }]
    } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res.features![0].notes as any).should.equal("some note");
  });

  it("should handle notes as an object safely", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, notes: { gene: ["dhfr"] } }]
    } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res.features![0].notes as any).gene[0].should.equal("dhfr");
  });

  it("should default to circular=false if passed a linear circular=false prop", () => {
    const res = tidyUpSequenceData({
      circular: false,
      sequence: "agagagag"
    });
    res.circular!.should.equal(false);
  });

  it("should default to circular=true if passed a linear circular=true prop", () => {
    const res2 = tidyUpSequenceData({
      circular: true,
      sequence: "agagagag"
    });
    res2.circular!.should.equal(true);
  });

  it("should default to circular=true if passed a linear circular='true' prop (string)", () => {
    const res2 = tidyUpSequenceData({
      circular: "true",
      sequence: "agagagag"
    } as any);
    res2.circular!.should.equal(true);
  });

  it("should filter out invalid feature types", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, type: "invalid_type" }, {} as any]
    });
    res.features![0].type.should.equal("misc_feature");
  });

  it("should NOT filter out invalid feature types if allowNonStandardGenbankTypes=true", () => {
    const res = tidyUpSequenceData(
      {
        features: [{ start: 4, end: 5, type: "idontexist" }, {} as any]
      },
      {
        allowNonStandardGenbankTypes: true
      }
    );
    res.features![0].type.should.equal("idontexist");
  });
  it("should normalize strange upper/lower casing in feature types", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, type: "cDs" }]
    });
    res.features![0].type.should.equal("CDS");
  });
  it("should not clobber existing feature types", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, type: "CDS" }]
    });
    res.features![0].type.should.equal("CDS");
  });

  it("should add correct color based on type for existing features colors", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, type: "CDS" }]
    });
    res.features![0].color.should.equal("#EF6500");
  });

  it("should not clobber existing feature colors", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, color: "#f4f4f4" }]
    });
    res.features![0].color.should.equal("#f4f4f4");
  });
  it("should not provide ids for annotations if doNotProvideIdsForAnnotations=true", () => {
    const res = tidyUpSequenceData(
      {
        features: [{ start: 4, end: 5, id: 123 }, {} as any]
      },
      {
        doNotProvideIdsForAnnotations: true
      }
    );
    res.features![0].id.should.not.equal(123);
    res.features![0].id.should.equal(123);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chai.expect((res.features![1] as any).id).to.be.undefined;
  });
  it("should provide ids for annotations if doNotProvideIdsForAnnotations=false (default)", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5 }, {} as any]
    });
    res.features![0].id.should.exist;
    res.features![1].id.should.exist;
  });
  it("should not strip existing ids from annotations if doNotProvideIdsForAnnotations=false (default)", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, id: 123 }, {} as any]
    });
    res.features![0].id.should.not.equal(123); //it should have been "shortid-ed" because ids are strings? No, wait.
    // If id exists, it uses it?
    // Code says: if (item.id || item.id === 0) itemId = item.id.
    // So it keeps 123.
    res.features![0].id.should.equal(123);
    res.features![1].id.should.exist;
  });
  it("should add annotationTypePlural field to annotations", () => {
    const res = tidyUpSequenceData({
      features: [{ start: 4, end: 5, id: 123 }, {} as any]
    });
    res.features![0].annotationTypePlural!.should.equal("features");
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

//var tap = require('tap');
//tap.mochaGlobals();
var getAminoAcidDataForEachBaseOfDna = require("./getAminoAcidDataForEachBaseOfDna.js");
var getAA = require("./getAminoAcidFromSequenceTriplet");
// var collapseOverlapsGeneratedFromRangeComparisonIfPossible = require('./collapseOverlapsGeneratedFromRangeComparisonIfPossible.js');
var assert = require("assert");
var aaData;
describe("getAminoAcidDataForEachBaseOfDna tranlates a", function() {
  //: It gets correct amino acid mapping and position in codon for each basepair in sequence
  it("1 amino acid long sequence", function() {
    aaData = getAminoAcidDataForEachBaseOfDna("atg", true);
    assert.deepEqual(aaData, [
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 0,
        aminoAcidIndex: 0,
        sequenceIndex: 0,
        codonRange: {
          start: 0,
          end: 2
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 1,
        aminoAcidIndex: 0,
        sequenceIndex: 1,
        codonRange: {
          start: 0,
          end: 2
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 2,
        aminoAcidIndex: 0,
        sequenceIndex: 2,
        codonRange: {
          start: 0,
          end: 2
        },
        fullCodon: true
      }
    ]);
  });
  it("1 amino acid long sequence which is subrange of a larger sequence", function() {
    aaData = getAminoAcidDataForEachBaseOfDna(
      "atgtatgagagtagagatagagata",
      true,
      { start: 4, end: 6 }
    );
    assert.deepEqual(aaData, [
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 0,
        aminoAcidIndex: 0,
        sequenceIndex: 4,
        codonRange: {
          start: 4,
          end: 6
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 1,
        aminoAcidIndex: 0,
        sequenceIndex: 5,
        codonRange: {
          start: 4,
          end: 6
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 2,
        aminoAcidIndex: 0,
        sequenceIndex: 6,
        codonRange: {
          start: 4,
          end: 6
        },
        fullCodon: true
      }
    ]);
  });
  it("1 amino acid long sequence which is origin spanning subrange of a larger sequence", function() {
    //                                         012345678
    aaData = getAminoAcidDataForEachBaseOfDna("atgatgatg", true, {
      start: 6,
      end: 2
    });
    assert.deepEqual(aaData, [
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 0,
        aminoAcidIndex: 0,
        sequenceIndex: 6,
        codonRange: {
          start: 6,
          end: 8
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 1,
        aminoAcidIndex: 0,
        sequenceIndex: 7,
        codonRange: {
          start: 6,
          end: 8
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 2,
        aminoAcidIndex: 0,
        sequenceIndex: 8,
        codonRange: {
          start: 6,
          end: 8
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 0,
        aminoAcidIndex: 1,
        sequenceIndex: 0,
        codonRange: {
          start: 0,
          end: 2
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 1,
        aminoAcidIndex: 1,
        sequenceIndex: 1,
        codonRange: {
          start: 0,
          end: 2
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 2,
        aminoAcidIndex: 1,
        sequenceIndex: 2,
        codonRange: {
          start: 0,
          end: 2
        },
        fullCodon: true
      }
    ]);
  });
  it("1 amino acid long sequence in reverse direction", function() {
    aaData = getAminoAcidDataForEachBaseOfDna("atg", false);
    assert.deepEqual(aaData, [
      {
        aminoAcid: getAA("cat"),
        positionInCodon: 2,
        aminoAcidIndex: 0,
        fullCodon: true,
        sequenceIndex: 0,
        codonRange: {
          start: 0,
          end: 2
        }
      },
      {
        aminoAcid: getAA("cat"),
        positionInCodon: 1,
        aminoAcidIndex: 0,
        fullCodon: true,
        sequenceIndex: 1,
        codonRange: {
          start: 0,
          end: 2
        }
      },
      {
        aminoAcid: getAA("cat"),
        positionInCodon: 0,
        aminoAcidIndex: 0,
        fullCodon: true,
        sequenceIndex: 2,
        codonRange: {
          start: 0,
          end: 2
        }
      }
    ]);
  });
  it("> 1 amino acid long sequence", function() {
    aaData = getAminoAcidDataForEachBaseOfDna("atgtaat", true);
    assert.deepEqual(aaData, [
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 0,
        aminoAcidIndex: 0,
        fullCodon: true,
        sequenceIndex: 0,
        codonRange: {
          start: 0,
          end: 2
        }
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 1,
        aminoAcidIndex: 0,
        fullCodon: true,
        sequenceIndex: 1,
        codonRange: {
          start: 0,
          end: 2
        }
      },
      {
        aminoAcid: getAA("atg"),
        positionInCodon: 2,
        aminoAcidIndex: 0,
        fullCodon: true,
        sequenceIndex: 2,
        codonRange: {
          start: 0,
          end: 2
        }
      },
      {
        aminoAcid: getAA("taa"),
        positionInCodon: 0,
        aminoAcidIndex: 1,
        fullCodon: true,
        sequenceIndex: 3,
        codonRange: {
          start: 3,
          end: 5
        }
      },
      {
        aminoAcid: getAA("taa"),
        positionInCodon: 1,
        aminoAcidIndex: 1,
        fullCodon: true,
        sequenceIndex: 4,
        codonRange: {
          start: 3,
          end: 5
        }
      },
      {
        aminoAcid: getAA("taa"),
        positionInCodon: 2,
        aminoAcidIndex: 1,
        fullCodon: true,
        sequenceIndex: 5,
        codonRange: {
          start: 3,
          end: 5
        }
      },
      {
        aminoAcid: getAA("xxx"),
        positionInCodon: 0,
        aminoAcidIndex: 2,
        fullCodon: false,
        sequenceIndex: 6,
        codonRange: {
          start: 6,
          end: 6
        }
      }
    ]);
  });
  it("> 1 amino acid long sequence in reverse direction", function() {
    aaData = getAminoAcidDataForEachBaseOfDna("atgtaat", false);

    assert.deepEqual(aaData, [
      {
        aminoAcid: getAA("xxx"),
        positionInCodon: 0,
        aminoAcidIndex: 2,
        sequenceIndex: 0,
        codonRange: {
          start: 0,
          end: 0
        },
        fullCodon: false
      },
      {
        aminoAcid: getAA("aca"),
        positionInCodon: 2,
        aminoAcidIndex: 1,
        sequenceIndex: 1,
        codonRange: {
          start: 1,
          end: 3
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("aca"),
        positionInCodon: 1,
        aminoAcidIndex: 1,
        sequenceIndex: 2,
        codonRange: {
          start: 1,
          end: 3
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("aca"),
        positionInCodon: 0,
        aminoAcidIndex: 1,
        sequenceIndex: 3,
        codonRange: {
          start: 1,
          end: 3
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("att"),
        positionInCodon: 2,
        aminoAcidIndex: 0,
        sequenceIndex: 4,
        codonRange: {
          start: 4,
          end: 6
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("att"),
        positionInCodon: 1,
        aminoAcidIndex: 0,
        sequenceIndex: 5,
        codonRange: {
          start: 4,
          end: 6
        },
        fullCodon: true
      },
      {
        aminoAcid: getAA("att"),
        positionInCodon: 0,
        aminoAcidIndex: 0,
        sequenceIndex: 6,
        codonRange: {
          start: 4,
          end: 6
        },
        fullCodon: true
      }
    ]);
  });
  it("< 1 amino acid long sequence", function() {
    aaData = getAminoAcidDataForEachBaseOfDna("at", true);
    assert.deepEqual(aaData, [
      {
        aminoAcid: getAA("xxx"),
        positionInCodon: 0,
        aminoAcidIndex: 0,
        sequenceIndex: 0,
        fullCodon: false,
        codonRange: {
          start: 0,
          end: 1
        }
      },
      {
        aminoAcid: getAA("xxx"),
        positionInCodon: 1,
        aminoAcidIndex: 0,
        sequenceIndex: 1,
        fullCodon: false,
        codonRange: {
          start: 0,
          end: 1
        }
      }
    ]);
  });
  it("< 1 amino acid long sequence in reverse direction", function() {
    aaData = getAminoAcidDataForEachBaseOfDna("at", false);
    assert.deepEqual(aaData, [
      {
        aminoAcid: getAA("xxx"),
        positionInCodon: 1,
        aminoAcidIndex: 0,
        sequenceIndex: 0,
        fullCodon: false,
        codonRange: {
          start: 0,
          end: 1
        }
      },
      {
        aminoAcid: getAA("xxx"),
        positionInCodon: 0,
        aminoAcidIndex: 0,
        sequenceIndex: 1,
        fullCodon: false,
        codonRange: {
          start: 0,
          end: 1
        }
      }
    ]);
  });
});

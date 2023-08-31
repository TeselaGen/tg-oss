import jsonToFasta from "../src/jsonToFasta";
import chai from "chai";
import fastaToJson from "../src/fastaToJson";

chai.should();
describe("fasta exporter/parser conversion", function () {
  it(`should export a protein sequence by default if the sequence isProtein`, () => {
    const string = jsonToFasta({
      sequence: "augaugcayyunmngyunuuy",
      proteinSequence: "MMHLRLF",
      isProtein: true
    });
    string.should.equal(`>Untitled Sequence||7|linear
MMHLRLF`);
  });

  //tnw: I don't think this is possible because fasta does not have a well defined ordering of fields within the header
  // it("the description coming in should be the same as the description coming out", function() {
  //   const description = "Some sort of description"
  //   const string = jsonToFasta({
  //     sequence: "agagagagagag",
  //     description,
  //   });

  //   const result = fastaToJson(string);
  //   result[0].parsedSequence.description.should.equal(description)
  // });

  it("should handle the doNotMangleOrStripUrls option correctly", function () {
    const description =
      "I include multiple URLs https://github.com/TeselaGen/fake/url and anotha one https://github.com/TeselaGen/fake/url/the/2nd";
    const string = jsonToFasta(
      {
        sequence: "agagagagagag",
        description
      },
      {
        doNotMangleOrStripUrls: true
      }
    );
    string.should.include("https://github.com/TeselaGen/fake/url");
    string.should.include("https://github.com/TeselaGen/fake/url/the/2nd");
    const result = fastaToJson(string);
    result[0].parsedSequence.description.should.include(description);
  });
  it("should strip URLs by default correctly", function () {
    const description =
      "I include multiple URLs https://github.com/TeselaGen/fake/url and anotha one https://github.com/TeselaGen/fake/url/the/2nd";
    const string = jsonToFasta({
      sequence: "agagagagagag",
      description
    });
    string.should.not.include("https://github.com/TeselaGen/fake/url");
    string.should.not.include("https://github.com/TeselaGen/fake/url/the/2nd");
    const result = fastaToJson(string);
    result[0].parsedSequence.description.should.not.include(description);
    result[0].parsedSequence.description.should.include(
      `I include multiple URLs`
    );
    result[0].parsedSequence.description.should.include(`and anotha one`);
  });
  it("should mangle and unmangle URLs correctly", function () {
    const description =
      "I include multiple URLs https://github.com/TeselaGen/fake/url and anotha one https://github.com/TeselaGen/fake/url/the/2nd";
    const string = jsonToFasta(
      {
        sequence: "agagagagagag",
        description
      },
      {
        mangleUrls: true
      }
    );
    string.should.not.include("https://github.com/TeselaGen/fake/url");
    string.should.not.include("https://github.com/TeselaGen/fake/url/the/2nd");
    const result = fastaToJson(string);
    result[0].parsedSequence.description.should.include(description);
  });

  it("should correctly make a fasta file", function () {
    // const breakingJSON = require('./testData/json/breakingJSON_stringified')
    const breakingJSON = require("./testData/json/1.json");
    const string = jsonToFasta(breakingJSON);
    string.should.equal(
      `>pRS414__modified||5901|circular
gacgaaagggcctcgtgatacgcctatttttataggttaatgtcatgataataatggtttcttaggacggatcgcttgcc
tgtaacttacacgcgcctcgtatcttttaatgatggaataatttgggaatttactctgtgtttatttatttttatgtttt
gtatttggattttagaaagtaaataaagaaggtagaagagttacggaatgaagaaaaaaaaataaacaaaggtttaaaaa
atttcaacaaaaagcgtactttacatatatatttattagacaagaaaagcagattaaatagatatacattcgattaacga
taagtaaaatgtaaaatcacaggattttcgtgtgtggtcttctacacagacaagatgaaacaattcggcattaatacctg
agagcaggaagagcaagataaaaggtagtatttgttggcgatccccctagagtcttttacatcttcggaaaacaaaaact
attttttctttaatttctttttttactttctatttttaatttatatatttatattaaaaaatttaaattataattatttt
tatagcacgtgatgaaaaggacccaggtggcacttttcggggaaatgtgcgcggaacccctatttgtttatttttctaaa
tacattcaaatatgtatccgctcatgagacaataaccctgataaatgcttcaataatattgaaaaaggaagagtatgagt
attcaacatttccgtgtcgcccttattcccttttttgcggcattttgccttcctgtttttgctcacccagaaacgctggt
gaaagtaaaagatgctgaagatcagttgggtgcacgagtgggttacatcgaactggatctcaacagcggtaagatccttg
agagttttcgccccgaagaacgttttccaatgatgagcacttttaaagttctgctatgtggcgcggtattatcccgtatt
gacgccgggcaagagcaactcggtcgccgcatacactattctcagaatgacttggttgagtactcaccagtcacagaaaa
gcatcttacggatggcatgacagtaagagaattatgcagtgctgccataaccatgagtgataacactgcggccaacttac
ttctgacaacgatcggaggaccgaaggagctaaccgcttttttgcacaacatgggggatcatgtaactcgccttgatcgt
tgggaaccggagctgaatgaagccataccaaacgacgagcgtgacaccacgatgcctgtagcaatggcaacaacgttgcg
caaactattaactggcgaactacttactctagcttcccggcaacaattaatagactggatggaggcggataaagttgcag
gaccacttctgcgctcggcccttccggctggctggtttattgctgataaatctggagccggtgagcgtgggtctcgcggt
atcattgcagcactggggccagatggtaagccctcccgtatcgtagttatctacacgacggggagtcaggcaactatgga
tgaacgaaatagacagatcgctgagataggtgcctcactgattaagcattggtaactgtcagaccaagtttactcatata
tactttagattgatttaaaacttcatttttaatttaaaaggatctaggtgaagatcctttttgataatctcatgaccaaa
atcccttaacgtgagttttcgttccactgagcgtcagaccccgtagaaaagatcaaaggatcttcttgagatcctttttt
tctgcgcgtaatctgctgcttgcaaacaaaaaaaccaccgctaccagcggtggtttgtttgccggatcaagagctaccaa
ctctttttccgaaggtaactggcttcagcagagcgcagataccaaatactgtccttctagtgtagccgtagttaggccac
cacttcaagaactctgtagcaccgcctacatacctcgctctgctaatcctgttaccagtggctgctgccagtggcgataa
gtcgtgtcttaccgggttggactcaagacgatagttaccggataaggcgcagcggtcgggctgaacggggggttcgtgca
cacagcccagcttggagcgaacgacctacaccgaactgagatacctacagcgtgagctatgagaaagcgccacgcttccc
gaagggagaaaggcggacaggtatccggtaagcggcagggtcggaacaggagagcgcacgagggagcttccagggggaaa
cgcctggtatctttatagtcctgtcgggtttcgccacctctgacttgagcgtcgatttttgtgatgctcgtcaggggggc
ggagcctatggaaaaacgccagcaacgcggcctttttacggttcctggccttttgctggccttttgctcacatgttcttt
cctgcgttatcccctgattctgtggataaccgtattaccgcctttgagtgagctgataccgctcgccgcagccgaacgac
cgagcgcagcgagtcagtgagcgaggaagcggaagagcgcccaatacgcaaaccgcctctccccgcgcgttggccgattc
attaatgcagctggcacgacaggtttcccgactggaaagcgggcagtgagcgcaacgcaattaatgtgagttacctcact
cattaggcaccccaggctttacactttatgcttccggctcctatgttgtgtggaattgtgagcggataacaatttcacac
aggaaacagctatgaccatgattacgccaagcgcgcaattaaccctcactaaagggaacaaaagctggagctcactagtg
tttaaacctgagagtgcaccataccacagcttttcaattcaattcatcattttttttttattcttttttttgatttcggt
ttctttgaaatttttttgattcggtaatctccgaacagaaggaagaacgaaggaaggagcacagacttagattggtatat
atacgcatatgtagtgttgaagaaacatgaaattgcccagtattcttaacccaactgcacagaacaaaaacctgcaggaa
acgaagataaatcatgtcgaaagctacatataaggaacgtgctgctactcatcctagtcctgttgctgccaagctattta
atatcatgcacgaaaagcaaacaaacttgtgtgcttcattggatgttcgtaccaccaaggaattactggagttagttgaa
gcattaggtcccaaaatttgtttactaaaaacacatgtggatatcttgactgatttttccatggagggcacagttaagcc
gctaaaggcattatccgccaagtacaattttttactcttcgaagacagaaaatttgctgacattggtaatacagtcaaat
tgcagtactctgcgggtgtatacagaatagcagaatgggcagacattacgaatgcacacggtgtggtgggcccaggtatt
gttagcggtttgaagcaggcggcagaagaagtaacaaaggaacctagaggccttttgatgttagcagaattgtcatgcaa
gggctccctatctactggagaatatactaagggtactgttgacattgcgaagagcgacaaagattttgttatcggcttta
ttgctcaaagagacatgggtggaagagatgaaggttacgattggttgattatgacacccggtgtgggtttagatgacaag
ggagacgcattgggtcaacagtatagaaccgtggatgatgtggtctctacaggatctgacattattattgttggaagagg
actatttgcaaagggaagggatgctaaggtagagggtgaacgttacagaaaagcaggctgggaagcatatttgagaagat
gcggccagcaaaactaaaaaactgtattataagtaaatgcatgtatactaaactcacaaattagagcttcaatttaatta
tatcagttattacgtttaaacttaataactgcaggaattcgatatcaagcttatcgataccgtcgacctcgagggggggc
ccggtacccaattcgccctatagtgagtcgtattacgcgcgctcactggccgtcgttttacaacgtcgtgactgggaaaa
ccctggcgttacccaacttaatcgccttgcagcacatccccctttcgccagctggcgtaatagcgaagaggcccgcaccg
atcgcccttcccaacagttgcgcagcctgaatggcgaatggcgcgacgcgccctgtagcggcgcattaagcgcggcgggt
gtggtggttacgcgcagcgtgaccgctacacttgccagcgccctagcgcccgctcctttcgctttcttcccttcctttct
cgccacgttcgccggctttccccgtcaagctctaaatcgggggctccctttagggttccgatttagtgctttacggcacc
tcgaccccaaaaaacttgattagggtgatggttcacgtagtgggccatcgccctgatagacggtttttcgccctttgacg
ttggagtccacgttctttaatagtggactcttgttccaaactggaacaacactcaaccctatctcggtctattcttttga
tttataagggattttgccgatttcggcctattggttaaaaaatgagctgatttaacaaaaatttaacgcgaattttaaca
aaatattaacgtttacaatttcctgatgcggtattttctccttacgcatctgtgcggtatttcacaccgcataggcaagt
gcacaaacaatacttaaataaatactactcagtaataacctatttcttagcatttttgacgaaatttgctattttgttag
agtcttttacaccatttgtctccacacctccgcttacatcaacaccaataacgccatttaatctaagcgcatcaccaaca
ttttctggcgtcagtccaccagctaacataaaatgtaagctttcggggctctcttgccttccaacccagtcagaaatcga
gttccaatccaaaagttcacctgtcccacctgcttctgaatcaaacaagggaataaacgaatgaggtttctgtgaagctg
cactgagtagtatgttgcagtcttttggaaatacgagtcttttaataactggcaaaccgaggaactcttggtattcttgc
cacgactcatctccatgcagttggacgatatcaatgccgtaatcattgaccagagccaaaacatcctccttaggttgatt
acgaaacacgccaaccaagtatttcggagtgcctgaactatttttatatgcttttacaagacttgaaattttccttgcaa
taaccgggtcaattgttctctttctattgggcacacatataatacccagcaagtcagcatcggaatctagagcacattct
gcggcctctgtgctctgcaagccgcaaactttcaccaatggaccagaactacctgtgaaattaataacagacatactcca
agctgcctttgtgtgcttaatcacgtatactcacgtgctcaatagtcaccaatgccctccctcttggccctctccttttc
ttttttcgaccgaattaattcttaatcggcaaaaaaagaaaagctccggatcaagattgtacgtaaggtgacaagctatt
tttcaataaagaatatcttccactactgccatctggcgtcataactgcaaagtacacatatattacgatgctgtctatta
aatgcttcctatattatatatatagtaatgtcgtttatggtgcactctcagtacaatctgctctgatgccgcatagttaa
gccagccccgacacccgccaacacccgctgacgcgccctgacgggcttgtctgctcccggcatccgcttacagacaagct
gtgaccgtctccgggagctgcatgtgtcagaggttttcaccgtcatcaccgaaacgcgcga`
    );
  });
});

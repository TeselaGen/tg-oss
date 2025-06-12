import assert from "assert";
import { idtAllawi1997Tm, rnaXia1998Tm } from "./calculateMeltingTempUtils";

// eatodo - add tests for the two tm functions we're keeping here

describe("calculate Tm based on Xia et al (1998) & Allawi and SantaLucia (1997)", () => {
  it("should return the melting temperature of a given sequence", () => {
    const primers = [
      "TCAGGCCAAGCCGCCCAACC",
      "GAGCGTTCGCACTTATCCTG",
      "GCGTAGTTGATGTAGGTATA",
      "ACCATAAAAGCAAGCCTGCA",
      "ATCTTTGCTCACATCTTCTT",
      "ATCATTCCCTCTAGGGCGAA",
      "GCGACGCCTTCAACGGCCAG",
      "TGTTATAGATATCTCCGGTA",
      "GGTGCTTAGTCTGTCTCGCA",
      "TCCAAATCATTTAGCTCACG",
      "AAATAGTGCCTTCTATAATT",
      "AGACTAAATAGGATACAGAG",
      "ATATACCTTAAGTCTAAACT",
      "CAGCTGTTTGAATGCAGTTT"
    ];

    //Output Xia et al. (1998):
    assert.equal(rnaXia1998Tm(primers[0]), 80.48014888031054);
    assert.equal(rnaXia1998Tm(primers[1]), 69.48128023746551);
    assert.equal(rnaXia1998Tm(primers[2]), 63.829055268681486);
    assert.equal(rnaXia1998Tm(primers[3]), 67.7799640995575);
    assert.equal(rnaXia1998Tm(primers[4]), 60.367545075528824);
    assert.equal(rnaXia1998Tm(primers[5]), 70.01852537077997);
    assert.equal(rnaXia1998Tm(primers[6]), 77.09836531263488);
    assert.equal(rnaXia1998Tm(primers[7]), 61.65750845125672);
    assert.equal(rnaXia1998Tm(primers[8]), 72.08978679791193);
    assert.equal(rnaXia1998Tm(primers[9]), 61.81662512074416);
    assert.equal(rnaXia1998Tm(primers[10]), 54.181658600023354);
    assert.equal(rnaXia1998Tm(primers[11]), 60.70530596829997);
    assert.equal(rnaXia1998Tm(primers[12]), 54.9628328606824);
    assert.equal(rnaXia1998Tm(primers[13]), 62.28008663901613);

    // Testing primers with Allawi et al. (1997) method:
    assert.equal(idtAllawi1997Tm(primers[0]), 62.00575312744883);
    assert.equal(idtAllawi1997Tm(primers[1]), 53.46882417495283);
    assert.equal(idtAllawi1997Tm(primers[2]), 45.995798861146966);
    assert.equal(idtAllawi1997Tm(primers[3]), 52.49763205047378);
    assert.equal(idtAllawi1997Tm(primers[4]), 46.666618595096736);
    assert.equal(idtAllawi1997Tm(primers[5]), 51.93888090705042);
    assert.equal(idtAllawi1997Tm(primers[6]), 61.25072166383569);
    assert.equal(idtAllawi1997Tm(primers[7]), 43.390431778601226);
    assert.equal(idtAllawi1997Tm(primers[8]), 54.0137358221092);
    assert.equal(idtAllawi1997Tm(primers[9]), 48.02850667052155);
    assert.equal(idtAllawi1997Tm(primers[10]), 41.033058916027585);
    assert.equal(idtAllawi1997Tm(primers[11]), 42.21651941202208);
    assert.equal(idtAllawi1997Tm(primers[12]), 39.319457055269595);
    assert.equal(idtAllawi1997Tm(primers[13]), 49.68314601154168);
  });
});

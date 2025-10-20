import { getAlignedAminoAcidSequenceProps } from "../src/utils/getAlignedAminoAcidSequenceProps";

describe("getAlignedAminoAcidSequenceProps", () => {
  it("it should get identity properties, frequencies and plot values", () => {
    const aaSeqData1 = {
      alignmentData: {
        name: "Consensus",
        sequence: "VLSAADKXNVKAAWGKVGGHAAEYGAEALERMFAS"
      }
    };
    const aaSeqData2 = {
      alignmentData: {
        name: "Chicken Hemoglobin Alpha",
        sequence: "VLSAADKANIKAAWGKIGGHGAEYGAEALERMFAS"
      }
    };
    const aaSeqData3 = {
      alignmentData: {
        name: "Human Hemoglobin Alpha",
        sequence: "VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLS"
      }
    };

    const props = getAlignedAminoAcidSequenceProps([
      aaSeqData1,
      aaSeqData2,
      aaSeqData3
    ]);

    const consensus_identity = props.matrix[0][0];
    const chicken_identity = props.matrix[0][1].toFixed(1);
    const human_identity = props.matrix[0][2].toFixed(1);
    expect(consensus_identity).toEqual(100);
    expect(chicken_identity).toEqual("88.6");
    expect(human_identity).toEqual("85.7");

    const identicalPositions = props.identicalPositions.map(
      ip => ip.identicalPositions
    );
    expect(identicalPositions).toEqual([31, 30, 27]);

    const overallIdentity = props.overallIdentity.toFixed(1);
    expect(overallIdentity).toEqual("88.6");

    const frequencies = props.frequencies;
    expect(frequencies).toEqual([
      100, 100, 100, 50, 100, 100, 100, 50, 100, 50, 100, 100, 100, 100, 100,
      100, 50, 100, 50, 100, 50, 50, 100, 100, 100, 100, 100, 100, 100, 100,
      100, 100, 100, 50, 100
    ]);

    const labileSites = props.labileSites;
    expect(labileSites.totalLabileSites).toEqual(1);
    expect(labileSites.sites[0].position).toEqual(8);

    const propertyAnalysis = props.propertyAnalysis;
    expect(propertyAnalysis[0].group).toEqual("aliphatic");
    expect(propertyAnalysis[3].group).toEqual("small");
    expect(propertyAnalysis[11].group).toEqual("tiny hydrophobic");
    expect(propertyAnalysis[31].group).toEqual("sulphur-containing");
    expect(propertyAnalysis[34].group).toEqual("hydroxylic");
  });
});

export function getLabileSites(alignedSequences: any, threshold?: number): {
    sites: {
        position: number;
        conservationScore: number;
        residueVariation: string[];
        frequencies: {};
    }[];
    conservationScores: (number | null)[];
    totalLabileSites: number;
    percentageLabile: number;
};
export function parseTracks(tracks: any): {};
export function getAlignedAminoAcidSequenceProps(tracks: any): {
    overallIdentity: number;
    frequencies: number[];
    labileSites: {
        sites: {
            position: number;
            conservationScore: number;
            residueVariation: string[];
            frequencies: {};
        }[];
        conservationScores: (number | null)[];
        totalLabileSites: number;
        percentageLabile: number;
    };
    propertyAnalysis: {
        position: number;
        residues: any[];
        group: any;
        color: string;
    }[];
    matrix: any[][];
    sequenceNames: string[];
    identicalPositions: {
        identicalPositions: number;
        seqs: string[];
    }[];
};
export namespace residuePropertyMap {
    let A: string[];
    let C: string[];
    let D: string[];
    let E: string[];
    let F: string[];
    let G: string[];
    let H: string[];
    let I: string[];
    let K: string[];
    let L: string[];
    let M: string[];
    let N: string[];
    let P: string[];
    let Q: string[];
    let R: string[];
    let S: string[];
    let T: string[];
    let V: string[];
    let W: string[];
    let Y: string[];
}

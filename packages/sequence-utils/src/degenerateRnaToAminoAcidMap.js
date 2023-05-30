const { invert } = require("lodash");
const aminoAcidToDegenerateRnaMap = require("./aminoAcidToDegenerateRnaMap");

const degenerateRnaToAminoAcidMap = invert(aminoAcidToDegenerateRnaMap);
module.exports = degenerateRnaToAminoAcidMap;

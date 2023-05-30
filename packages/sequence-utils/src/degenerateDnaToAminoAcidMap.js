const { invert } = require("lodash");
const aminoAcidToDegenerateDnaMap = require("./aminoAcidToDegenerateDnaMap");

const degenerateDnaToAminoAcidMap = invert(aminoAcidToDegenerateDnaMap);
module.exports = degenerateDnaToAminoAcidMap;

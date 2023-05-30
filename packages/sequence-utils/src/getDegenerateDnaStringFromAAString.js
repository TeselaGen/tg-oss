const aminoAcidToDegenerateDnaMap = require("./aminoAcidToDegenerateDnaMap");

module.exports = function getDegenerateDnaStringFromAAString(aaString) {
  return aaString
    .split("")
    .map(char => aminoAcidToDegenerateDnaMap[char.toLowerCase()] || "nnn")
    .join("");
};

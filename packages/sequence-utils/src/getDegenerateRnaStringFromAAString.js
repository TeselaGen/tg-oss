const aminoAcidToDegenerateRnaMap = require("./aminoAcidToDegenerateRnaMap");

module.exports = function getDegenerateRnaStringFromAAString(aaString) {
  return aaString
    .split("")
    .map(char => aminoAcidToDegenerateRnaMap[char.toLowerCase()] || "nnn")
    .join("");
};

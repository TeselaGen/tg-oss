import aminoAcidToDegenerateDnaMap from "./aminoAcidToDegenerateDnaMap";

export default function getDegenerateDnaStringFromAAString(aaString) {
  return aaString
    .split("")
    .map(char => aminoAcidToDegenerateDnaMap[char.toLowerCase()] || "nnn")
    .join("");
};

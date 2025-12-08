import aminoAcidToDegenerateRnaMap from "./aminoAcidToDegenerateRnaMap";

export default function getDegenerateRnaStringFromAAString(aaString) {
  return aaString
    .split("")
    .map(char => aminoAcidToDegenerateRnaMap[char.toLowerCase()] || "nnn")
    .join("");
}

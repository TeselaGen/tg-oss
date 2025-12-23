import aminoAcidToDegenerateDnaMap from "./aminoAcidToDegenerateDnaMap";

export default function getDegenerateDnaStringFromAAString(
  aaString: string
): string {
  return aaString
    .split("")
    .map(
      char =>
        (aminoAcidToDegenerateDnaMap as Record<string, string>)[
          char.toLowerCase()
        ] || "nnn"
    )
    .join("");
}

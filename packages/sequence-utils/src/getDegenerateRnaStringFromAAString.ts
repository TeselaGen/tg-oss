import aminoAcidToDegenerateRnaMap from "./aminoAcidToDegenerateRnaMap";

export default function getDegenerateRnaStringFromAAString(
  aaString: string
): string {
  return aaString
    .split("")
    .map(
      char =>
        (aminoAcidToDegenerateRnaMap as Record<string, string>)[
          char.toLowerCase()
        ] || "nnn"
    )
    .join("");
}

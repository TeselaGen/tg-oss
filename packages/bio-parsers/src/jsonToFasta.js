import { tidyUpSequenceData } from "@teselagen-biotech/sequence-utils";
import { mangleOrStripUrls } from "./utils/unmangleUrls";

export default function jsonToFasta(jsonSequence, options) {
  const cleanedData = tidyUpSequenceData(jsonSequence);
  const {
    name,
    circular,
    description,
    size,
    sequence,
    isProtein,
    proteinSize,
    proteinSequence
  } = cleanedData;

  options = {
    sequence: isProtein && proteinSequence ? proteinSequence : sequence,
    size: isProtein && proteinSequence ? proteinSize : size,
    ...options
  };
  const seqToUse = options.sequence;
  const sizeToUse = options.size;
  // options.reformatSeqName = options.reformatSeqName === false ? false : true;
  let fastaString = "";
  fastaString += `>${name || "Untitled Sequence"}|`;
  fastaString += "|" + sizeToUse;
  fastaString += description
    ? "|" + mangleOrStripUrls(description, options)
    : "";
  fastaString += "|" + (circular ? "circular" : "linear");
  fastaString += "\n";
  fastaString += (seqToUse.match(/.{1,80}/g) || []).join("\n");
  return fastaString;
}

import { tidyUpSequenceData } from "@teselagen/sequence-utils";

function jsonToBed(jsonSequence, options = {}) {
  const sequenceInfo = options.featuresOnly
    ? jsonSequence
    : tidyUpSequenceData(jsonSequence);
  const { name, features, size, description, circular } = sequenceInfo;

  let sequenceNameToMatchFasta = "";
  sequenceNameToMatchFasta += `${name || "Untitled Sequence"}|`;
  sequenceNameToMatchFasta += "|" + size;
  sequenceNameToMatchFasta += description ? "|" + description : "";
  sequenceNameToMatchFasta += "|" + (circular ? "circular" : "linear");
  const sequenceNameToUse = options.sequenceName || sequenceNameToMatchFasta;
  let outString = "";
  outString += `track name="${sequenceNameToUse}" description="${name} Annotations" itemRgb="On"\n`;

  features.forEach(function (feat) {
    const { start, end, name, type, forward, strand } = feat;
    const label = name ? name : type;
    let orientation;
    if (forward || strand === 1) {
      orientation = "+";
    } else if (!forward || strand === -1) {
      orientation = "-";
    } else {
      // "." = no strand
      orientation = ".";
    }
    const color = type === "CDS" ? "230,88,0" : "";
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature
    // when there is no thick part, thickStart and thickEnd are usually set to the chromStart position
    outString += `${sequenceNameToUse}\t${start}\t${
      end + 1
    }\t${label}\t\t${orientation}\t\t\t${color}\n`;
  });
  return outString;
}

export default jsonToBed;

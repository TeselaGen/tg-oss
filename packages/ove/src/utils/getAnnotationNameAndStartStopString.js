import { upperFirst } from "lodash-es";
import { getSingular } from "./annotationTypes";

function formatAutoAnnotationMeta(autoAnnotationMeta) {
  if (!autoAnnotationMeta) return "";

  let metaInfo = "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
  metaInfo += "\n AUTO-ANNOTATION METADATA";
  metaInfo += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

  // Source Information
  if (autoAnnotationMeta.sourceType || autoAnnotationMeta.sourceDescription) {
    metaInfo += "\n\n Source:";
    if (autoAnnotationMeta.sourceType) {
      const formattedSource = autoAnnotationMeta.sourceType
        .replace(/reference_database-/gi, "")
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      metaInfo += `\n   Type: ${formattedSource}`;
    }
    if (autoAnnotationMeta.sourceDescription) {
      metaInfo += `\n   Description: ${autoAnnotationMeta.sourceDescription}`;
    }
  }

  // Match Quality
  if (
    autoAnnotationMeta.identity !== undefined ||
    autoAnnotationMeta.mismatchCount !== undefined ||
    autoAnnotationMeta.referenceCoverage !== undefined
  ) {
    metaInfo += "\n\n Match Quality:";
    if (autoAnnotationMeta.identity !== undefined) {
      metaInfo += `\n   Identity: ${autoAnnotationMeta.identity.toFixed(1)}%`;
    }
    if (autoAnnotationMeta.mismatchCount !== undefined) {
      metaInfo += `\n   Mismatches: ${autoAnnotationMeta.mismatchCount} bp`;
    }
    if (autoAnnotationMeta.referenceCoverage !== undefined) {
      metaInfo += `\n   Coverage: ${autoAnnotationMeta.referenceCoverage.toFixed(1)}%`;
    }
  }

  // Alignment Details
  if (
    autoAnnotationMeta.matchLength ||
    autoAnnotationMeta.referenceStart !== undefined
  ) {
    metaInfo += "\n\n Alignment:";
    if (autoAnnotationMeta.matchLength) {
      metaInfo += `\n   Match Length: ${autoAnnotationMeta.matchLength} bp`;
    }
    if (
      autoAnnotationMeta.referenceStart !== undefined &&
      autoAnnotationMeta.referenceEnd !== undefined
    ) {
      metaInfo += `\n   Reference Position: ${autoAnnotationMeta.referenceStart}-${autoAnnotationMeta.referenceEnd}`;
      if (autoAnnotationMeta.referenceLength) {
        metaInfo += ` (${autoAnnotationMeta.referenceLength} bp total)`;
      }
    }
  }

  return metaInfo;
}

export default function getAnnotationNameAndStartStopString(
  {
    name,
    start,
    end,
    type,
    message,
    annotationTypePlural,
    overlapsSelf,
    isWrappedAddon,
    autoAnnotationMeta
  },
  { startText, isProtein, readOnly } = {}
) {
  const typeToUse = (() => {
    if (annotationTypePlural) {
      const singularKey = getSingular(annotationTypePlural);
      if (singularKey === "cutsite") {
        return (
          "Cut site" + (annotationTypePlural === "features" ? ` (${type})` : "")
        );
      }
      if (singularKey === "orf") {
        return (
          "ORF" + (annotationTypePlural === "features" ? ` (${type})` : "")
        );
      }
      return (
        upperFirst(getSingular(annotationTypePlural)) +
        (annotationTypePlural === "features" ? ` (${type})` : "")
      );
    }
    return "";
  })();

  if (isWrappedAddon) {
    const oldEnd = end;
    end = start - 1;
    start = oldEnd + 1;
  }

  const metadataSection = formatAutoAnnotationMeta(autoAnnotationMeta);

  const interactionInstructions = readOnly
    ? ""
    : annotationTypePlural === "cutsites"
      ? `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  INTERACTIONS:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n   click → top cut position\n   alt/option+click → bottom cut position\n   cmd/ctrl+click → recognition range`
      : `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  INTERACTIONS:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n   alt/option+click → jump row view to start/end\n   double click → edit`;

  return `${startText ? startText : ""} ${typeToUse ? typeToUse + " -" : ""} ${
    name ? name : ""
  } - Start: ${isProtein ? (start + 3) / 3 : start + 1} End: ${
    isProtein ? (end + 1) / 3 : end + 1
  } ${overlapsSelf ? "(Overlaps Self) " : ""}${message ? "\n" + message : ""}${metadataSection}${interactionInstructions}`;
}

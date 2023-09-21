import areNonNegativeIntegers from "validate.io-nonnegative-integer-array";
import { getFeatureTypes } from "@teselagen/sequence-utils";
import {
  filterSequenceString,
  guessIfSequenceIsDnaAndNotProtein
} from "@teselagen/sequence-utils";
import { filter, some, upperFirst } from "lodash";
import pragmasAndTypes from "./pragmasAndTypes.js";
import { forEach } from "lodash";
import { map } from "lodash";
import { unmangleUrls } from "./unmangleUrls";
import { reformatName } from "./NameUtils.js";

//validation checking
/**
 * validation and sanitizing of our teselagen sequence data type
 * @param  {object} sequence Our teselagen sequence data type
 * @return response         {
    validatedAndCleanedSequence: {},
    messages: [],
  };
 */
export default function validateSequence(sequence, options = {}) {
  const {
    guessIfProtein,
    guessIfProteinOptions,
    reformatSeqName,
    inclusive1BasedStart,
    inclusive1BasedEnd,
    additionalValidChars,
    allowOverflowAnnotations,
    coerceFeatureTypes,
    includeStopCodon
  } = options;
  [
    "isDNA",
    "isOligo",
    "isRNA",
    "isDoubleStrandedDNA",
    "isSingleStrandedDNA",
    "isDoubleStrandedRNA",
    "isProtein"
  ].forEach(k => {
    if (options[k] !== undefined && sequence[k] === undefined) {
      sequence[k] = options[k];
    }
  });

  const response = {
    validatedAndCleanedSequence: {},
    messages: []
  };
  if (!sequence || typeof sequence !== "object") {
    throw new Error("Invalid sequence");
  }
  if (!sequence.name) {
    //we'll handle transferring the file name outside of this function
    //for now just set it to a blank string
    sequence.name = "";
  }
  if (!sequence.extraLines) {
    sequence.extraLines = [];
  }
  if (!sequence.comments) {
    sequence.comments = [];
  }
  if (sequence.description) {
    sequence.description = unmangleUrls(sequence.description);
  }
  const oldName = sequence.name;
  if (reformatSeqName) {
    sequence.name = reformatName(sequence.name);
  }
  if (oldName !== sequence.name) {
    response.messages.push(
      "Name (" + oldName + ") reformatted to " + sequence.name
    );
  }

  if (Array.isArray(sequence.sequence)) {
    sequence.sequence = sequence.sequence.join("");
  }
  if (!sequence.sequence) {
    response.messages.push("No sequence detected");
    sequence.sequence = "";
  }

  if (sequence.isProtein === undefined && guessIfProtein) {
    sequence.isProtein = !guessIfSequenceIsDnaAndNotProtein(
      sequence.sequence,
      guessIfProteinOptions
    );
  }
  if (sequence.isProtein) {
    //tnr: add code to strip invalid protein data..
    const [validChars, warnings] = filterSequenceString(sequence.sequence, {
      isProtein: true,
      additionalValidChars,
      includeStopCodon
    });
    if (validChars !== sequence.sequence) {
      sequence.sequence = validChars;
      response.messages.push(...warnings);
    }
    sequence.type = "PROTEIN";
    sequence.isProtein = true;
    if (!sequence.proteinSequence) {
      sequence.proteinSequence = sequence.sequence;
    }
    sequence.proteinSize = sequence.proteinSequence.length;
  } else {
    //todo: this logic won't catch every case of RNA, so we should probably handle RNA conversion at another level..
    const temp = sequence.sequence;
    if (!sequence.isOligo) {
      sequence.sequence = sequence.sequence.replace(/u/gi, u =>
        u === "U" ? "T" : "t"
      );
    }
    if (
      temp !== sequence.sequence &&
      !sequence.isDNA &&
      !sequence.isProtein &&
      sequence.isRNA !== false
    ) {
      sequence.type = "RNA";
      sequence.sequence = temp;
    } else {
      sequence.type = "DNA";
    }

    const [validChars, warnings] = filterSequenceString(sequence.sequence, {
      additionalValidChars,
      ...sequence
    });
    if (validChars !== sequence.sequence) {
      sequence.sequence = validChars;
      response.messages.push(...warnings);
    }
  }

  if (!sequence.size) {
    sequence.size = sequence.isProtein
      ? sequence.proteinSequence.length * 3
      : sequence.sequence.length;
  }
  let circularityExplicitlyDefined;
  if (
    sequence.circular === false ||
    sequence.circular === "false" ||
    sequence.circular === -1
  ) {
    sequence.circular = false;
    circularityExplicitlyDefined = true;
  } else if (!sequence.circular) {
    sequence.circular = false;
    circularityExplicitlyDefined = circularityExplicitlyDefined || false;
  } else {
    sequence.circular = true;
  }

  if (!sequence.features || !Array.isArray(sequence.features)) {
    response.messages.push("No valid features detected");
    sequence.features = [];
  }
  //tnr: maybe this should be wrapped in its own function (in case we want to use it elsewhere)
  sequence.features = sequence.features.filter(function (feature) {
    if (!feature || typeof feature !== "object") {
      response.messages.push("Invalid feature detected and removed");
      return false;
    }
    feature.start = parseInt(feature.start, 10);
    feature.end = parseInt(feature.end, 10);

    if (!feature.name || typeof feature.name !== "string") {
      response.messages.push(
        'Unable to detect valid name for feature, setting name to "Untitled Feature"'
      );
      feature.name = "Untitled Feature";
    }
    if (
      !allowOverflowAnnotations &&
      (!areNonNegativeIntegers([feature.start]) ||
        feature.start > sequence.size - (inclusive1BasedStart ? 0 : 1))
    ) {
      response.messages.push(
        "Invalid feature start: " +
          feature.start +
          " detected for " +
          feature.name +
          " and set to 1"
      ); //setting it to 0 internally, but users will see it as 1
      feature.start = 0;
    }
    if (
      !allowOverflowAnnotations &&
      (!areNonNegativeIntegers([feature.end]) ||
        feature.end > sequence.size - (inclusive1BasedEnd ? 0 : 1))
    ) {
      feature.end = Math.max(sequence.size - 1, inclusive1BasedEnd ? 0 : 1);
      response.messages.push(
        "Invalid feature end:  " +
          feature.end +
          " detected for " +
          feature.name +
          " and set to " +
          (feature.end + 1)
      );
    }

    if (
      feature.start - (inclusive1BasedStart ? 0 : 1) >
        feature.end - (inclusive1BasedEnd ? 0 : 1) &&
      sequence.circular === false
    ) {
      if (circularityExplicitlyDefined) {
        response.messages.push(
          "Invalid circular feature detected in explicitly linear sequence. " +
            feature.name +
            ". start set to 1"
        ); //setting it to 0 internally, but users will see it as 1
        feature.start = 0;
      } else {
        response.messages.push(
          "Circular feature detected in implicitly linear sequence. Setting sequence to be circular."
        );
        sequence.circular = true;
      }
    }

    feature.strand = parseInt(feature.strand, 10);
    if (
      feature.strand === -1 ||
      feature.strand === false ||
      feature.strand === "false" ||
      feature.strand === "-"
    ) {
      feature.strand = -1;
    } else {
      feature.strand = 1;
    }
    let invalidFeatureType;
    if (
      feature.type &&
      typeof feature.type === "string" &&
      feature.type.toLowerCase() === "primer"
    ) {
      feature.type = "primer_bind";
    }
    if (
      !feature.type ||
      typeof feature.type !== "string" ||
      !getFeatureTypes({ includeHidden: true }).some(function (featureType) {
        if (featureType.toLowerCase() === feature.type.toLowerCase()) {
          feature.type = featureType; //this makes sure the feature.type is being set to the exact value of the accepted featureType
          return true;
        }
        return false;
      })
    ) {
      //tnr: commenting this logic out
      if (coerceFeatureTypes || !feature.type) {
        response.messages.push(
          'Invalid feature type detected:  "' +
            feature.type +
            '" within ' +
            feature.name +
            ". set type to misc_feature"
        );
        if (typeof feature.type === "string") {
          invalidFeatureType = feature.type;
        }
        feature.type = "misc_feature";
      }
    }
    if (!feature.notes) {
      feature.notes = {};
    }
    //if the original feature type was invalid, push it onto the notes object under featureType
    if (invalidFeatureType) {
      if (!feature.notes.featureType) {
        feature.notes.featureType = [];
      }
      feature.notes.featureType.push(invalidFeatureType);
    }
    if (feature.notes.label) {
      //we've already used the label as the name by default if both gene and label were present
      delete feature.notes.label;
    } else if (feature.notes.gene) {
      //gene was useds for name (if it existed)
      delete feature.notes.gene;
    } else if (feature.notes.name) {
      //name was used for name (if it existed)
      delete feature.notes.name;
    }
    if (feature.notes.color) {
      feature.color = feature.notes.color[0] || feature.color;
      delete feature.notes.color;
    }
    if (feature.notes.labelColor) {
      feature.labelColor = feature.notes.labelColor[0] || feature.labelColor;
      delete feature.notes.labelColor;
    }
    if (
      feature.notes.pragma &&
      some(feature.notes.pragma, p => p === "overlapsSelf")
    ) {
      feature.overlapsSelf = true;
      feature.notes.pragma = filter(
        feature.notes.pragma,
        p => p !== "overlapsSelf"
      );
    }
    feature.notes.note &&
      some(feature.notes.note, n => {
        if (
          n &&
          typeof n === "string" &&
          n.toLowerCase().includes("sequence:")
        ) {
          //remove it after we're parsed it out
          feature.notes.note = filter(
            feature.notes.note,
            p => p && !p.toLowerCase().includes("sequence:")
          );
          if (feature.notes.note.length === 0) {
            delete feature.notes.note;
          }
          const match = n.match(/sequence:[ \r\n.]*[a-zA-Z]*/i);
          if (match && match[0])
            feature.bases = match[0]
              .replace(/\s/g, "")
              .replace("sequence:", "");

          return true;
        }
      });

    feature.notes.primerBindsOn &&
      some(feature.notes.primerBindsOn, n => {
        if (n) {
          feature.primerBindsOn = n;
          delete feature.notes.primerBindsOn;
        }
      });

    for (const { pragma, type } of pragmasAndTypes) {
      if (
        options[`accept${upperFirst(type)}`] !== false && //acceptParts, acceptWarnings,
        feature.notes.pragma &&
        some(feature.notes.pragma, p => p === pragma)
      ) {
        if (!sequence[type]) {
          sequence[type] = []; //initialize an empty array if necessary
        }
        feature.type = type.slice(0, -1); //set the type before pushing it onto the array
        delete feature.notes.pragma;
        sequence[type].push(feature);
        return false; //don't include the features
      }
    }
    forEach(feature.notes, (noteArray, key) => {
      feature.notes[key] = map(noteArray, note => {
        return unmangleUrls(note);
      });
    });
    return true;
  });
  response.validatedAndCleanedSequence = sequence;
  return response;
}

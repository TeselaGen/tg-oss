/* eslint-disable no-var*/
import { get, cloneDeep, map, each, isObject, flatMap } from "lodash";
import color from "color";

import pragmasAndTypes from "./utils/pragmasAndTypes.js";
import { mangleOrStripUrls } from "./utils/unmangleUrls.js";
import { reformatName } from "./utils/NameUtils.js";
import { getFeatureToColorMap } from "@teselagen/sequence-utils";
const StringUtil = {
  /** Trims white space at beginning and end of string
   * @param {string} line
   * @returns {string} line
   */
  trim: function (line) {
    return line.replace(/^\s+|\s+$/g, "");
  },

  /** Trims white space at beginning string
   * @param {string} line
   * @returns {string} line
   */
  ltrim: function (line) {
    return line.replace(/^\s+/, "");
  },

  /** Trims white space at end of string
   * @param {string} line
   * @returns {string} line
   */
  rtrim: function (line) {
    return line.replace(/\s+$/, "");
  },

  /** Pads white space at beginning of string
   * @param {string} line
   * @returns {string} line
   */
  lpad: function (line, padString, length) {
    let str = line;
    while (str.length < length) str = padString + str;
    return str;
  },

  /** Pads white space at end of string
   * @param {string} line
   * @returns {string} line
   */
  rpad: function (line, padString, length) {
    let str = line;
    while (str.length < length) str = str + padString;
    return str;
  }
};

const DIGEST_PART_EXPORT_FIELD_MAP = {
  isDigestPart: "isDigestPart",
  isDigestValid: "isDigestValid",
  "re5Prime.name": "re5PrimeName",
  "re5Prime.recognitionRegex": "re5PrimePattern",
  re5PrimeOverhang: "re5PrimeOverhang",
  re5PrimeOverhangStrand: "re5PrimeOverhangStrand",
  re5PrimeRecognitionTypeCode: "re5PrimeRecognitionTypeCode",
  "re3Prime.name": "re3PrimeName",
  "re3Prime.recognitionRegex": "re3PrimePattern",
  re3PrimeOverhang: "re3PrimeOverhang",
  re3PrimeOverhangStrand: "re3PrimeOverhangStrand",
  re3PrimeRecognitionTypeCode: "re3PrimeRecognitionTypeCode"
};

function cutUpArray(val, start, end) {
  return val.slice(start, end).join("");
}

function cutUpStr(val, start, end) {
  return val.slice(start, end);
}

export default function (_serSeq, options) {
  options = options || {};
  options.reformatSeqName = options.reformatSeqName !== false;
  const serSeq = cloneDeep(_serSeq);
  if (!serSeq) return false;

  try {
    if (serSeq.isProtein || serSeq.type === "protein" || serSeq.type === "AA") {
      serSeq.isProtein = true;
      serSeq.sequence = serSeq.proteinSequence || serSeq.sequence;
      options.isProtein = true;
    }
    let content = null;
    const cutUp = typeof serSeq.sequence === "string" ? cutUpStr : cutUpArray;
    if (!serSeq.sequence) serSeq.sequence = "";

    let lines = [];
    lines.push(createGenbankLocus(serSeq, options));
    if (serSeq.definition || serSeq.description) {
      lines.push(
        "DEFINITION  " +
          mangleOrStripUrls(serSeq.definition || serSeq.description, options)
      );
    }

    if (serSeq.accession) {
      lines.push("ACCESSION  " + serSeq.accession);
    }

    if (serSeq.version) {
      lines.push("VERSION  " + serSeq.version);
    }

    if (serSeq.extraLines) {
      lines = lines.concat(serSeq.extraLines);
    }
    if (serSeq.comments) {
      serSeq.comments.forEach(function (comment) {
        lines.push("COMMENT             " + comment);
      });
    }
    if (serSeq.teselagen_unique_id) {
      lines.push(
        "COMMENT             teselagen_unique_id: " + serSeq.teselagen_unique_id
      );
    }
    if (serSeq.library) {
      lines.push("COMMENT             library: " + serSeq.library);
    }

    let longestFeatureTypeLength = 15;

    serSeq.features = map(serSeq.features).concat(
      flatMap(pragmasAndTypes, ({ pragma, type }) => {
        return flatMap(serSeq[type], ann => {
          if (!isObject(ann)) {
            return [];
          }
          if (type === "primers") {
            ann.type = "primer_bind";
          }
          if (type === "parts" && ann.isDigestPart) {
            addDigestPartFieldsToNotes(ann);
          }
          ann.notes = pragma
            ? {
                ...ann.notes,
                pragma: [pragma]
              }
            : ann.notes;
          return ann;
        });
      })
    );
    serSeq.features.forEach(({ type }) => {
      if (type && type.length > longestFeatureTypeLength) {
        longestFeatureTypeLength = type.length;
      }
    });

    let printedFeatureHeader;
    each(serSeq.features, function (feat) {
      if (!printedFeatureHeader) {
        printedFeatureHeader = true;
        lines.push("FEATURES             Location/Qualifiers");
      }
      lines.push(
        featureToGenbankString(feat, {
          ...options,
          featurePadLength: longestFeatureTypeLength + 1
        })
      );
    });

    lines.push("ORIGIN      ");
    for (let i = 0; i < serSeq.sequence.length; i = i + 60) {
      const line = [];
      const ind = StringUtil.lpad("" + (i + 1), " ", 9);
      line.push(ind);

      for (let j = i; j < i + 60; j = j + 10) {
        // line.push(serSeq.sequence.slice(j,j+10).join(''));
        line.push(cutUp(serSeq.sequence, j, j + 10));
      }
      lines.push(line.join(" "));
    }

    lines.push("//");

    content = lines.join("\r\n");
    // return cb(err, content);
    return content;
  } catch (e) {
    console.warn("Error processing sequence << Check jsonToGenbank.js");
    console.warn(serSeq);
    console.warn(e.stack);
    return false;
  }
}

function createGenbankLocus(serSeq, options) {
  if (serSeq.sequence.symbols) {
    serSeq.sequence = serSeq.sequence.symbols.split("");
  }

  let tmp;
  let dnaType;
  if (serSeq.isProtein) {
    dnaType = "";
  } else if (serSeq.type === "RNA") {
    dnaType = serSeq?.doubleStranded
      ? "RNA"
      : serSeq?.sequenceTypeFromLocus ?? "ss-RNA";
  } else {
    dnaType = serSeq?.doubleStranded
      ? "DNA"
      : serSeq?.sequenceTypeFromLocus ?? "DNA";
  }
  const date = getCurrentDateString();

  let line = StringUtil.rpad("LOCUS", " ", 12);
  let nameToUse = serSeq.name || "Untitled_Sequence";
  nameToUse = options.reformatSeqName ? reformatName(nameToUse) : nameToUse;
  line += StringUtil.rpad(nameToUse, " ", 16);
  line += " "; // T.H line 2778 of GenbankFormat.as col 29 space
  line += StringUtil.lpad(String(serSeq.sequence.length), " ", 11);
  line += serSeq.isProtein ? " aa " : " bp "; // col 41
  // if (strandType !== "") {
  // 	tmp =  strandType + "-";
  // } else {
  tmp = "";
  // }
  line += StringUtil.lpad(tmp, " ", 3);
  line += StringUtil.rpad(dnaType, " ", 6);
  line += "  ";

  if (!serSeq.circular || serSeq.circular === "0") {
    line += "linear  ";
    //line += "        ";
  } else {
    line += "circular";
  }

  line += " "; //col 64
  line += StringUtil.rpad(serSeq.gbDivision || "SYN", " ", 1);
  // }
  line += " "; // col 68
  // DOES NOT PARSE DATE USEFULLY ORIGINALLY!
  line += date;
  //line += "\n";

  return line;
}

function getCurrentDateString() {
  let date = new Date();
  date = date.toString().split(" ");
  const day = date[2];
  const month = date[1].toUpperCase();
  const year = date[3];
  return day + "-" + month + "-" + year;
}

function featureNoteInDataToGenbankString(name, value, options) {
  return (
    StringUtil.lpad("/", " ", 22) +
    name +
    '="' +
    mangleOrStripUrls(value, options) +
    '"'
  );
}

function featureToGenbankString(feat, options) {
  const lines = [];
  if (feat.type === "primer") {
    feat.type = "primer_bind";
  }
  const line =
    "     " +
    StringUtil.rpad(feat.type || "misc_feature", " ", options.featurePadLength);
  let locStr = "";

  //for(var i=0;i<feat.locations.length;i++) {
  //	var loc = feat.locations[i];
  //	locStr.push((loc.start+1) + '..' + loc.end);
  //}

  if (feat.locations && feat.locations.length > 1) {
    feat.locations.forEach((loc, i) => {
      locStr +=
        getProteinStart(
          parseInt(loc.start, 10) + (options.inclusive1BasedStart ? 0 : 1),
          options.isProtein
        ) +
        ".." +
        getProteinEnd(
          parseInt(loc.end, 10) + (options.inclusive1BasedEnd ? 0 : 1),
          options.isProtein
        );

      if (i !== feat.locations.length - 1) {
        locStr += ",";
      }
    });
    locStr = "join(" + locStr + ")";
  } else {
    locStr +=
      getProteinStart(
        parseInt(feat.start, 10) + (options.inclusive1BasedStart ? 0 : 1),
        options.isProtein
      ) +
      ".." +
      getProteinEnd(
        parseInt(feat.end, 10) + (options.inclusive1BasedEnd ? 0 : 1),
        options.isProtein
      );
  }

  // locStr = locStr.join(",");

  if (feat.strand === -1) {
    locStr = "complement(" + locStr + ")";
  }

  lines.push(line + locStr);

  lines.push(
    featureNoteInDataToGenbankString(
      "label",
      feat.name || "Untitled Feature",
      options
    )
  );

  if (feat.bases && feat.bases.length && feat.type === "primer_bind") {
    addToNotes(feat, "note", `sequence: ${feat.bases}`);
  }
  if (feat.primerBindsOn && feat.type === "primer_bind") {
    addToNotes(feat, "primerBindsOn", feat.primerBindsOn);
  }
  if (feat.overlapsSelf) {
    addToNotes(feat, "pragma", "overlapsSelf");
  }
  if (feat.arrowheadType) {
    const valToAdd =
      feat.arrowheadType.toUpperCase() === "BOTH"
        ? "BOTH"
        : feat.arrowheadType.toUpperCase() === "NONE"
        ? "NONE"
        : undefined;

    if (valToAdd) addToNotes(feat, "direction", valToAdd);
  }
  let notes = feat.notes;

  if (notes) {
    try {
      if (typeof notes === "string") {
        try {
          notes = JSON.parse(notes);
        } catch (e) {
          console.warn("Warning: Note incorrectly sent as a string.");
          notes = {}; //set the notes to a blank object
        }
      }
      Object.keys(notes).forEach(function (key) {
        if (key === "color" || key === "labelColor") return; //we'll handle this below
        if (notes[key] instanceof Array) {
          notes[key].forEach(function (value) {
            lines.push(featureNoteInDataToGenbankString(key, value, options));
          });
        } else {
          console.warn("Warning: Note object expected array values");
          console.warn(notes);
        }
      });
    } catch (e) {
      console.warn("Warning: Note cannot be processed");
    }
  }
  feat.color = (feat.notes && feat.notes.color) || feat.color;
  feat.labelColor = (feat.notes && feat.notes.labelColor) || feat.labelColor;

  if (
    feat.color &&
    color.rgb(feat.color).string() !==
      color
        .rgb(getFeatureToColorMap({ includeHidden: true })[feat.type])
        .string() //don't save a color note if the color is already the same as our defaults
  ) {
    lines.push(featureNoteInDataToGenbankString("color", feat.color, options));
  }
  if (feat.labelColor) {
    lines.push(
      featureNoteInDataToGenbankString("labelColor", feat.labelColor, options)
    );
  }

  return lines.join("\r\n");
}

function getProteinStart(val, isProtein) {
  if (!isProtein) return val;
  return Math.floor((val + 2) / 3);
}
function getProteinEnd(val, isProtein) {
  if (!isProtein) return val;
  return Math.floor(val / 3);
}

function addToNotes(ann, key, val) {
  if (!ann.notes) {
    ann.notes = {};
  }
  if (!ann.notes[key]) {
    ann.notes[key] = [];
  }
  ann.notes[key].push(val);
}

function addDigestPartFieldsToNotes(ann) {
  Object.entries(DIGEST_PART_EXPORT_FIELD_MAP).forEach(
    ([digestFieldPath, digestFieldName]) => {
      addToNotes(ann, digestFieldName, String(get(ann, digestFieldPath)));
    }
  );
}

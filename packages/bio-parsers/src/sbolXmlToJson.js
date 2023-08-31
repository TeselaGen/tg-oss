/* eslint-disable no-var*/
import validateSequenceArray from "./utils/validateSequenceArray";
import searchWholeObjByName, {
  searchWholeObjByNameSimple,
  searchWholeObjByNameSimpleArray
} from "./utils/searchWholeObjByName";

import { XMLParser } from "fast-xml-parser";
import { flatMap, get } from "lodash";

//Here's what should be in the callback:
// {
//   parsedSequence:
//   messages:
//   success:
// }
async function sbolXmlToJson(string, options) {
  options = options || {};
  const onFileParsed = function (sequences) {
    //before we call the onFileParsed callback, we need to validate the sequence
    return validateSequenceArray(sequences, options);
  };
  let response = {
    parsedSequence: null,
    messages: [],
    success: true
  };
  try {
    const result = new XMLParser({
      isArray: () => true,
      ignoreAttributes: false
    }).parse(string);
    const sbolJsonMatches = searchWholeObjByName("DnaComponent", result);
    if (sbolJsonMatches[0]) {
      const resultArray = [];
      for (let i = 0; i < sbolJsonMatches[0].value.length; i++) {
        try {
          response = {
            parsedSequence: null,
            messages: [],
            success: true
          };
          response.parsedSequence = parseSbolJson(
            sbolJsonMatches[0].value[i],
            options
          );
        } catch (e) {
          console.error("error:", e);
          console.error("error.stack: ", e.stack);
          resultArray.push({
            success: false,
            messages: ["Error while parsing Sbol format"]
          });
        }
        if (response.parsedSequence.features.length > 0) {
          response.messages.push(
            "SBOL feature types are stored in feature notes"
          );
        }
        resultArray.push(response);
      }
      return onFileParsed(resultArray);
    } else {
      return onFileParsed({
        success: false,
        messages: ["Error: XML is not valid Jbei or Sbol format"]
      });
    }
  } catch (e) {
    return onFileParsed({
      success: false,
      messages: ["Error parsing XML to JSON"]
    });
  }
}
// Converts SBOL formats.
//  * Specifications for SBOL can be found at http://www.sbolstandard.org/specification/core-data-model
//  *
//  * The hierarcy of the components in an SBOL object is:
//  *
//  *          The hierarchy is Collection -> DnaComponent -> DnaSequence
//  *
//  * Check for each level and parse downward from there.
// tnrtodo: this should be tested with a wider variety of sbol file types!
function parseSbolJson(sbolJson, options) {
  let name;
  if (get(sbolJson, "name[0]")) {
    name = get(sbolJson, "name[0]");
  } else {
    name = get(sbolJson, "displayId[0]");
  }
  return {
    // circular: get(sbolJson, "seq:circular[0]"), //tnrtodo this needs to be changed
    circular: false,
    sequence: get(sbolJson, "dnaSequence[0].DnaSequence[0].nucleotides"),
    name: name,
    features: flatMap(sbolJson.annotation, function (annotation) {
      const feature = get(annotation, "SequenceAnnotation[0]");
      if (feature) {
        const notes = searchWholeObjByNameSimpleArray("@_ns2:about", feature);
        const otherNotes = searchWholeObjByNameSimpleArray(
          "@_ns2:resource",
          feature
        );
        const newNotes = {};
        [...notes, ...otherNotes].forEach(function (note) {
          if (note) {
            if (!newNotes.about) newNotes.about = [];
            newNotes.about.push(note);
          }
        });
        const featureName =
          searchWholeObjByNameSimple("name", feature) ||
          searchWholeObjByNameSimple("displayId", feature);
        return {
          name: featureName,
          notes: newNotes,
          type: "misc_feature", // sbol represents the feature type in what we are parsing as notes as the URL is difficult to follow
          // type: feature['seq:label'], //tnrtodo: figure out if an annotation type is passed
          // id: feature['seq:label'],
          start: parseInt(
            get(feature, "bioStart[0]") - (options.inclusive1BasedStart ? 0 : 1)
          ),
          end: parseInt(
            get(feature, "bioEnd[0]") - (options.inclusive1BasedEnd ? 0 : 1)
          ),
          strand: get(feature, "strand[0]") //+ or -
          // notes: feature['seq:label'],
        };
      }
    })
  };
}

export default sbolXmlToJson;

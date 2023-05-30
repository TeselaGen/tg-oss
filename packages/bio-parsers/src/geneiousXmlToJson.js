/* eslint-disable no-var*/

import validateSequenceArray from "./utils/validateSequenceArray";
import {
  searchWholeObjByNameSimple,
  searchWholeObjByNameSimpleArray,
} from "./utils/searchWholeObjByName";

import { XMLParser } from "fast-xml-parser";
import { forEach, flatMap } from "lodash";
import { filter } from "lodash";

//Here's what should be in the callback:
// {
//   parsedSequence:
//   messages:
//   success:
// }
async function geneiousXmlToJson(string, options) {
  options = options || {};

  const onFileParsed = function (sequences) {
    //before we call the onFileParsed callback, we need to validate the sequence
    return validateSequenceArray(sequences, options);
  };

  try {
    const result = new XMLParser({
      isArray: () => true,
    }).parse(string);
    const geneiousJsonMatches = searchWholeObjByNameSimpleArray(
      "geneiousDocument",
      result
    );

    const resultArray = [];
    if (!geneiousJsonMatches?.length) {
      return onFileParsed({
        success: false,
        messages: ["Error: XML is not valid geneious format"],
      });
    }
    forEach(geneiousJsonMatches, (geneiousJson) => {
      const response = {
        parsedSequence: null,
        messages: [],
        success: true,
      };
      try {
        response.parsedSequence = parseGeneiousJson(
          geneiousJson,
          options
        );
        resultArray.push(response);
      } catch (e) {
        console.error("error:", e);
        console.error("error.stack: ", e.stack);
        resultArray.push({
          success: false,
          messages: ["Error while parsing Geneious format"],
        });
      }
    });
    const toRet = filter(resultArray, (r) => r?.parsedSequence?.sequence?.length);
    if (toRet.length) return toRet;
    return onFileParsed(resultArray);
  } catch (e) {
    console.error(`e:`, e);
    return onFileParsed({
      success: false,
      messages: ["Error parsing geneious to JSON"],
    });
  }
}
function parseGeneiousJson(geneiousJson) {
  const circular = searchWholeObjByNameSimple("isCircular", geneiousJson);

  let geneiousJsonInner = searchWholeObjByNameSimple(
    "originalElement",
    geneiousJson
  );
  geneiousJsonInner = searchWholeObjByNameSimple(
    "XMLSerialisableRootElement",
    geneiousJsonInner
  );

  const sequence = searchWholeObjByNameSimple(
    "charSequence",
    geneiousJsonInner
  );
  const features = flatMap(
    searchWholeObjByNameSimpleArray("annotation", geneiousJsonInner),
    function (feature) {
      if (feature) {
        const name = searchWholeObjByNameSimple("description", feature);
        const intervals = searchWholeObjByNameSimpleArray("interval", feature);
        const type = searchWholeObjByNameSimple("type", feature);
        const firstInterval = intervals[0];
        const lastInterval = intervals[intervals.length - 1];
        const start =
          searchWholeObjByNameSimple("minimumIndex", firstInterval) - 1;
        const end =
          searchWholeObjByNameSimple("maximumIndex", lastInterval) - 1;
        let locations;
        if (intervals.length > 1) {
          locations = intervals.map((i) => {
            const start = searchWholeObjByNameSimple("minimumIndex", i) - 1;
            const end = searchWholeObjByNameSimple("maximumIndex", i) - 1;
            return {
              start,
              end,
            };
          });
        }
        const strand =
          searchWholeObjByNameSimple("direction", firstInterval) ===
          "leftToRight"
            ? 1
            : -1;
        const arrowheadType =
          searchWholeObjByNameSimple("direction", firstInterval) === "none"
            ? "NONE"
            : undefined;
        return {
          name,
          type,
          locations,
          arrowheadType,
          start,
          end,
          strand,
        };
      }
    }
  );
  const name = searchWholeObjByNameSimple("name", geneiousJsonInner);
  return {
    sequence,
    circular,
    name: name,
    features,
  };
}

export default geneiousXmlToJson;

/* eslint-disable no-var*/

import validateSequenceArray from "./utils/validateSequenceArray";
import { XMLParser } from "fast-xml-parser";
import { filter } from "lodash";

//Here's what should be in the callback:
// {
//   parsedSequence:
//   messages:
//   success:
// }
async function jbeiXmlToJson(string, options) {
  options = options || {};

  const onFileParsed = function (sequences) {
    //before we call the onFileParsed callback, we need to validate the sequence
    return validateSequenceArray(sequences, options);
  };

  try {
    const res = new XMLParser({}).parse(string);
    const jbeiSeq = res["seq:seq"];
    const resultArray = [];
    if (!jbeiSeq) {
      return onFileParsed({
        success: false,
        messages: ["Error: XML is not valid jbei format"],
      });
    }

    const response = {
      parsedSequence: null,
      messages: [],
      success: true,
    };
    try {
      response.parsedSequence = parseJbeiXml(jbeiSeq, options);
      resultArray.push(response);
    } catch (e) {
      console.error("error:", e);
      console.error("error.stack: ", e.stack);
      resultArray.push({
        success: false,
        messages: ["Error while parsing JBEI format"],
      });
    }

    const toRet = filter(
      resultArray,
      (r) => r?.parsedSequence?.sequence?.length
    );
    if (toRet.length) return toRet;
    return onFileParsed(resultArray);
  } catch (e) {
    console.error(`e:`, e);
    return onFileParsed({
      success: false,
      messages: ["Error parsing jbei to JSON"],
    });
  }
}
function parseJbeiXml(jbeiJson) {
  const {
    "seq:sequence": sequence,
    "seq:name": name,
    "seq:circular": circular,
    "seq:features": { "seq:feature": features },
  } = jbeiJson;
  return {
    sequence,
    circular,
    name: name,
    features: (Array.isArray(features) ? features : [features]).map(
      ({
        "seq:complement": complement,
        "seq:label": label,
        "seq:type": type,
        "seq:location": jbeiLocations,
      }) => {
        let start, end;
        const locs = Array.isArray(jbeiLocations)
          ? jbeiLocations
          : [jbeiLocations];
        const locations = locs.map(
          ({ "seq:genbankStart": gbStart, "seq:end": normEnd }, i) => {
            if (i === 0) start = gbStart - 1;
            if (i === locs.length - 1) end = normEnd - 1;
            return {
              start: gbStart - 1,
              end: normEnd - 1,
            };
          }
        );

        return {
          start,
          end,
          locations: locations.length > 1 ? locations : undefined,
          name: label,
          type,
          strand: complement ? -1 : 1,
        };
      }
    ),
  };
}

export default jbeiXmlToJson;

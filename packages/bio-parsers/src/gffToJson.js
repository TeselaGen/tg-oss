import gff from "@gmod/gff";
import { get } from "lodash";

function gffToJson(string) {
  const arrayOfThings = gff.parseStringSync(string);
  const results = [];
  const sequences = [];
  const features = {};
  arrayOfThings.forEach(featureOrSeq => {
    if (featureOrSeq.sequence) {
      sequences.push(featureOrSeq);
    } else {
      const feature = featureOrSeq[0];
      if (!features[feature.seq_id]) features[feature.seq_id] = [];
      const attributes = feature.attributes || {};
      const name = get(attributes, "ID[0]");
      features[feature.seq_id].push({
        name,
        start: feature.start,
        end: feature.end,
        strand: feature.strand === "+" ? 1 : -1,
        type: feature.type
      });
    }
  });
  sequences.forEach(sequence => {
    const sequenceId = sequence.id;
    const result = {
      messages: [],
      success: true,
      parsedSequence: {
        name: sequenceId,
        sequence: sequence.sequence,
        circular: false,
        features: features[sequence.id]
      }
    };
    results.push(result);
  });
  return results;
}

export default gffToJson;

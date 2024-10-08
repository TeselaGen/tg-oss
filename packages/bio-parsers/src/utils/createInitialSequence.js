import { untitledSequenceName } from "./constants";

export default function createInitialSequence(options) {
  options = options || {};
  return {
    messages: [],
    success: true,
    parsedSequence: {
      features: [],
      name:
        (options.fileName && options.fileName.replace(/\.[^/.]+$/, "")) ||
        untitledSequenceName,
      sequence: ""
    }
  };
}

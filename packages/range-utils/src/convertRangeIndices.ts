import { assign } from "lodash-es";
import { Range } from "./types";

interface RangeIndicesOptions {
  inclusive1BasedStart?: boolean;
  inclusive1BasedEnd?: boolean;
}

export default function convertRangeIndices(
  range: Range,
  inputType: RangeIndicesOptions = {},
  outputType: RangeIndicesOptions = {}
) {
  return assign({}, range, {
    start:
      Number(range.start) +
      (inputType.inclusive1BasedStart
        ? outputType.inclusive1BasedStart
          ? 0
          : -1
        : outputType.inclusive1BasedStart
          ? 1
          : 0),
    end:
      Number(range.end) +
      (inputType.inclusive1BasedEnd
        ? outputType.inclusive1BasedEnd
          ? 0
          : -1
        : outputType.inclusive1BasedEnd
          ? 1
          : 0)
  });
}

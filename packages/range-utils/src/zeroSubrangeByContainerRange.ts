//

import trimRangeByAnotherRange from "./trimRangeByAnotherRange";

import { Range } from "./types";

/**
 * "zeroes" a subrange of a container range by
 * adjusting subRange start and end such that it is as if the container range start = 0.
 * @param  {object} subRange  {start:
 *                                     end:
 *                                     }
 * @param  {object} containerRange {start:
 *                                     end:
 *                                     }
 * @param  {int} sequenceLength
 * @return {object}                {start:
 *                                     end:
 *                                     }
 */
export default function zeroSubrangeByContainerRange(
  subRange: Range,
  containerRange: Range,
  sequenceLength: number
) {
  //first check to make sure the container range fully contains the subRange
  const trimmedSubRange = trimRangeByAnotherRange(
    subRange,
    containerRange,
    sequenceLength
  );
  if (trimmedSubRange) {
    throw new Error(
      "subRange must be fully contained by containerRange! Otherwise this function does not make sense"
    );
  }
  const newSubrange: Range = {
    start: subRange.start - containerRange.start,
    end: subRange.end - containerRange.start
  };
  if (newSubrange.start < 0) {
    newSubrange.start += sequenceLength;
  }
  if (newSubrange.end < 0) {
    newSubrange.end += sequenceLength;
  }
  return newSubrange;
}

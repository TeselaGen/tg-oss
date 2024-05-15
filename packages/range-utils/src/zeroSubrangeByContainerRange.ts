import trimRangeByAnotherRange from "./trimRangeByAnotherRange";

//
// ac.throw([ac.posInt, ac.posInt, ac.bool], arguments);

/**
 * "zeroes" a subrange of a container range by
 * adjusting subRange start and end such that it is as if the container range start = 0.
 * @param  {object} subRange  {start:
 *                                     end:
 *                                     }
 * @param  {object} containerRange {start:
 *                                     end:
 *                                     }
 * @param  {number} sequenceLength
 * @return {object}                {start:
 *                                     end:
 *                                     }
 */
export default function zeroSubrangeByContainerRange(
  subRange: { start: number; end: number },
  containerRange: { start: number; end: number },
  sequenceLength: number
): { start: number; end: number } {
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
  const newSubrange: { start: number; end: number } = {
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

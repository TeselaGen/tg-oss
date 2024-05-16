/* eslint-disable @typescript-eslint/no-explicit-any */

export const convertIncomingRangeByInclusiveOptions = (
  range: { start: number; end: number },
  options: InclusiveOptions = {}
) => {
  if (options.inclusive1BasedStart) {
    range = { ...range, start: range.start - 1 };
  }
  if (options.inclusive1BasedEnd) {
    range = { ...range, end: range.end - 1 };
  }
  return range;
};
export const convertOutgoingRangeByInclusiveOptions = (
  range: { start: number; end: number },
  options: InclusiveOptions = {}
) => {
  if (options.inclusive1BasedStart) {
    range = { ...range, start: range.start + 1 };
  }
  if (options.inclusive1BasedEnd) {
    range = { ...range, end: range.end + 1 };
  }
  return range;
};

export type InclusiveOptions = {
  inclusive1BasedStart?: boolean;
  inclusive1BasedEnd?: boolean;
};

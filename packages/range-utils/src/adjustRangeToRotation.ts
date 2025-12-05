import { assign } from "lodash-es";

import { Range } from "./types";

export default function adjustRangeToRotation(
  rangeToBeAdjusted: Range,
  rotateTo = 0,
  rangeLength?: number
) {
  // ac.throw([ac.range, ac.posInt, ac.posInt], arguments);
  const mod = (n: number) => (rangeLength ? modulo(n, rangeLength) : n);

  const newRange = assign({}, rangeToBeAdjusted, {
    start: mod(rangeToBeAdjusted.start - (rotateTo || 0)),
    end: mod(rangeToBeAdjusted.end - (rotateTo || 0))
  });

  return newRange;
}

function modulo(n: number, m: number) {
  return ((n % m) + m) % m;
}

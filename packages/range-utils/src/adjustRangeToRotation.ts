import { assign } from "lodash-es";

import { Range } from "./types";

export default function adjustRangeToRotation<T extends Range>(
  rangeToBeAdjusted: T,
  rotateTo = 0,
  rangeLength?: number
): T {
  const mod = (n: number) => (rangeLength ? modulo(n, rangeLength) : n);

  const newRange = assign({}, rangeToBeAdjusted, {
    start: mod(rangeToBeAdjusted.start - (rotateTo || 0)),
    end: mod(rangeToBeAdjusted.end - (rotateTo || 0))
  });

  return newRange as T;
}

function modulo(n: number, m: number) {
  return ((n % m) + m) % m;
}

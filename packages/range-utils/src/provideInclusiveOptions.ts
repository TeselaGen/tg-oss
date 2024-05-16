/* eslint-disable @typescript-eslint/no-explicit-any */
import { assign } from "lodash";

export default function provideInclusiveOptions(
  funToWrap: (...args: any[]) => any
): (...args: any[]) => any {
  return function (...args: any[]): any {
    const options = args[args.length - 1];
    if (
      options &&
      (options.inclusive1BasedEnd || options.inclusive1BasedStart)
    ) {
      args.forEach(function (arg: any, index: number) {
        if (arg && arg.start > -1 && options.inclusive1BasedStart) {
          args[index] = assign(arg, { start: arg.start - 1 });
        }
        if (arg && arg.end > -1 && options.inclusive1BasedEnd) {
          args[index] = assign(arg, { end: arg.end - 1 });
        }
      });
    }
    let returnVal = funToWrap.apply(this, args);
    if (
      returnVal &&
      returnVal.start > -1 &&
      options &&
      options.inclusive1BasedStart
    ) {
      returnVal = assign(returnVal, { start: returnVal.start + 1 });
    }
    if (
      returnVal &&
      returnVal.end > -1 &&
      options &&
      options.inclusive1BasedEnd
    ) {
      returnVal = assign(returnVal, { end: returnVal.end + 1 });
    }
    return returnVal;
  };
}

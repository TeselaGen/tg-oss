import { assign } from "lodash-es";

type Options = {
  inclusive1BasedEnd?: boolean;
  inclusive1BasedStart?: boolean;
};

export default function provideInclusiveOptions<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => any
>(
  funToWrap: T
): (
  ...args: [...Parameters<T>, options?: Options]
) => ReturnType<T> {
  return function (
    this: unknown,
    ...args: [...Parameters<T>, options?: Options]
  ): ReturnType<T> {
    const options = args[args.length - 1] as Options | undefined;
    if (
      options &&
      (options.inclusive1BasedEnd || options.inclusive1BasedStart)
    ) {
      args.forEach(function (arg, index) {
        // cast arg to check for start/end
        const potentialRange = arg as { start?: number; end?: number } | null;
        if (
          potentialRange &&
          typeof potentialRange.start === "number" &&
          potentialRange.start > -1 &&
          options.inclusive1BasedStart
        ) {
          args[index] = assign(potentialRange, {
            start: potentialRange.start - 1
          });
        }
        if (
          potentialRange &&
          typeof potentialRange.end === "number" &&
          potentialRange.end > -1 &&
          options.inclusive1BasedEnd
        ) {
          args[index] = assign(potentialRange, {
            end: potentialRange.end - 1
          });
        }
      });
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    let returnVal = (funToWrap as Function).apply(this, args);
    const potentialReturn = returnVal as {
      start?: number;
      end?: number;
    } | null;

    if (
      potentialReturn &&
      typeof potentialReturn.start === "number" &&
      potentialReturn.start > -1 &&
      options &&
      options.inclusive1BasedStart
    ) {
      returnVal = assign(potentialReturn, {
        start: potentialReturn.start + 1
      });
    }
    if (
      potentialReturn &&
      typeof potentialReturn.end === "number" &&
      potentialReturn.end > -1 &&
      options &&
      options.inclusive1BasedEnd
    ) {
      returnVal = assign(potentialReturn, { end: potentialReturn.end + 1 });
    }
    return returnVal as ReturnType<T>;
  };
}

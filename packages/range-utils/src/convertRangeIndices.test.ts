import convertRangeIndices from "./convertRangeIndices";
import { expect } from "chai";

describe("convertRangeIndices", function () {
  it("should correctly convert various types of ranges", function () {
    expect(
      convertRangeIndices(
        { start: 4, end: 5 },
        { inclusive1BasedEnd: true },
        { inclusive1BasedStart: true }
      )
    ).to.deep.equal({ start: 5, end: 4 });

    expect(
      convertRangeIndices(
        {
          start: "1",
          end: "28"
        } as unknown as { start: number; end: number },
        { inclusive1BasedStart: true, inclusive1BasedEnd: true }
      )
    ).to.deep.equal({ start: 0, end: 27 });

    const ranges: { start: number; end: number }[] = [
      {
        start: 0,
        end: 0
      },
      {
        start: 1,
        end: 1
      },
      {
        start: 0,
        end: 10
      }
    ];

    ranges.forEach(function (range) {
      const convertedRange = convertRangeIndices(
        range,
        {},
        {
          inclusive1BasedStart: true,
          inclusive1BasedEnd: true
        }
      );
      expect(convertedRange.end).to.equal(range.end + 1);
      expect(convertedRange.start).to.equal(range.start + 1);
    });
  });

  it("should not remove other attributes on the range object", function () {
    const range = {
      start: 0,
      end: 10,
      id: "123"
    };
    const convertedRange = convertRangeIndices(range, {
      inclusive1BasedStart: true,
      inclusive1BasedEnd: true
    });
    expect(convertedRange).to.include({ id: "123" });
  });
});

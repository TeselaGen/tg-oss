const convertDnaCaretPositionOrRangeToAa = require("./convertDnaCaretPositionOrRangeToAA");
describe("convertDnaCaretPositionOrRangeToAa", function() {
  it(`should convert dna ranges and carets to AA ranges and carets`, () => {
    const res = convertDnaCaretPositionOrRangeToAa({
      start: 9,
      end: 11
    });
    expect(res.start).toEqual(3);
    expect(res.end).toEqual(3);
    //  0 1 2 3 4
    //   0 1 2 3
    //   a t g c
    expect(convertDnaCaretPositionOrRangeToAa(3)).toEqual(1);
  });
  it(`should convert dna ranges and locations to AA ranges and carets`, () => {
    const res = convertDnaCaretPositionOrRangeToAa({
      start: 9,
      end: 29,
      locations: [
        {
          start: 9,
          end: 17
        },
        {
          start: 18,
          end: 29
        }
      ]
    });
    expect(res.start).toEqual(3);
    expect(res.end).toEqual(9);
    expect(res.locations[0].start).toEqual(3);
    expect(res.locations[0].end).toEqual(5);
    expect(res.locations[1].start).toEqual(6);
    expect(res.locations[1].end).toEqual(9);
  });
});

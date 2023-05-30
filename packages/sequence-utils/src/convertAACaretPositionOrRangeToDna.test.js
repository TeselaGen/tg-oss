const convertAACaretPositionOrRangeToDna = require("./convertAACaretPositionOrRangeToDna");
describe("convertAACaretPositionOrRangeToDna", function() {
  it(`should convert dna ranges and carets to AA ranges and carets`, () => {
    const res = convertAACaretPositionOrRangeToDna({
      start: 3,
      end: 3
    });
    expect(res.start).toEqual(9);
    expect(res.end).toEqual(11);
    expect(convertAACaretPositionOrRangeToDna(3)).toEqual(9);
  });
  it(`should convert dna ranges and locations to AA ranges and carets`, () => {
    const res = convertAACaretPositionOrRangeToDna({
      start: 3,
      end: 9,
      locations: [
        {
          start: 3,
          end: 5
        },
        {
          start: 6,
          end: 9
        }
      ]
    });
    expect(res.start).toEqual(9);
    expect(res.end).toEqual(29);
    expect(res.locations[0].start).toEqual(9);
    expect(res.locations[0].end).toEqual(17);
    expect(res.locations[1].start).toEqual(18);
    expect(res.locations[1].end).toEqual(29);
  });
});

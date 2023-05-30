import rotateSequenceDataToPosition from "./rotateSequenceDataToPosition";
describe("rotateSequenceDataToPosition", () => {
  it("should rotate vanilla sequence data correctly", () => {
    const newData = rotateSequenceDataToPosition(
      {
        //         0123456
        sequence: "atgaccc"
      },
      4
    );
    expect(newData.sequence).toEqual("cccatga");
  });
  it("should rotate sequence data with features correctly", () => {
    const newData = rotateSequenceDataToPosition(
      {
        //         0123456
        sequence: "atgaccc",
        features: [
          {
            start: 4,
            end: 4
          },
          {
            start: 1,
            end: 0
          },
          {
            start: 2,
            end: 6,
            locations: [
              {
                start: 2,
                end: 3
              },
              {
                start: 4,
                end: 6
              }
            ]
          }
        ]
      },
      4
    );
    expect(newData.sequence).toEqual("cccatga");
    expect(newData.features).toMatchObject([
      {
        start: 0,
        end: 0
      },
      {
        start: 4,
        end: 3
      },
      {
        start: 5,
        end: 2,
        locations: [
          {
            start: 5,
            end: 6
          },
          {
            start: 0,
            end: 2
          }
        ]
      }
    ]);
  });
});

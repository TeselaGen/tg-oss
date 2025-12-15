import rotateBpsToPosition from "./rotateBpsToPosition";
describe("rotateBpsToPosition", () => {
  it("should rotate Bps To Position correctly ", () => {
    expect(rotateBpsToPosition("atgaccc", 4)).toEqual("cccatga");
  });
});

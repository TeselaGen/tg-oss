import {
  getFeatureTypes,
  getFeatureToColorMap,
  getMergedFeatureMap,
  getGenbankFeatureToColorMap,
} from "./featureTypesAndColors";

describe("getFeatureToColorMap", () => {
  it("should pass back feature colors by default ", () => {
    expect(getFeatureToColorMap().proprotein).toEqual("#F39A9D");
  });
  it("getFeatureTypes should not show hidden types by default ", () => {
    global.tg_featureTypeOverrides = [
      { name: "proprotein", isHidden: true },
      { name: "CDS", color: "blue" },
      { name: "someRandomFeature", color: "red", genbankEquivalentType: "RBS" }
    ];
    expect(getFeatureTypes().includes("proprotein")).toEqual(false);
    expect(getFeatureTypes().includes("CDS")).toEqual(true);
    expect(
      getFeatureTypes({ includeHidden: true }).includes("proprotein")
    ).toEqual(true);
  });

  it("should allow overwriting of colors ", () => {
    global.tg_featureTypeOverrides = [
      { name: "proprotein", isHidden: true },
      { name: "CDS", color: "blue" },
      { name: "someRandomFeature", color: "red", genbankEquivalentType: "RBS" }
    ];
    const featMap = getFeatureToColorMap();
    expect(featMap.CDS).toEqual("blue");
    // expect(featMap.CDS.isGenbankStandardType).toEqual(true);
    expect(featMap.proprotein).toEqual(undefined);
    expect(featMap.someRandomFeature).toEqual("red");
    expect(getGenbankFeatureToColorMap().someRandomFeature).toEqual(undefined);
  });
});
describe("getMergedFeatureMap", () => {
  it("should maintain the genbankEquivalentType", () => {
    global.tg_featureTypeOverrides = [
      { name: "proprotein", isHidden: true },
      { name: "CDS", color: "blue" },
      { name: "someRandomFeature", color: "red", genbankEquivalentType: "RBS" }
    ];
    const mergedFeatMap = getMergedFeatureMap();
    expect(mergedFeatMap.someRandomFeature.genbankEquivalentType).toEqual(
      "RBS"
    );
    expect(mergedFeatMap.CDS.isGenbankStandardType).toEqual(true);
  });
});

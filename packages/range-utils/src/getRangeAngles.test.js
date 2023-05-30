//0123456789
//r--------r
//
//0123
//r--r
//  0
// 3 1
//  2
const getRangeAngles = require("./getRangeAngles");
const assert = require("assert");
describe("getRangeAngles", function() {
  //tnrtodo set this up

  it("should return the correct angles for ranges that have joined locations", function(done) {
    const angles = getRangeAngles(
      {
        start: 1,
        end: 6,
        locations: [
          { start: 1, end: 2 },
          { start: 3, end: 6 },
        ],
      },
      10
    );
    // console.log('angles: ' + JSON.stringify(angles,null,4));
    const anglesInRadians = {};
    Object.keys(angles).forEach(function(key) {
      anglesInRadians[key] = (angles[key] * 360) / Math.PI / 2;
    });

    // console.log('anglesInRadians: ' + JSON.stringify(anglesInRadians,null,4));
    assert(anglesInRadians.startAngle === 36);
    assert(anglesInRadians.endAngle === 252);
    assert(anglesInRadians.totalAngle === 216);
    angles.locationAngles &&
      angles.locationAngles.forEach((angles, i) => {
        const anglesInRadians = {};
        Object.keys(angles).forEach(function(key) {
          anglesInRadians[key] = (angles[key] * 360) / Math.PI / 2;
        });
        // console.log('anglesInRadians:',anglesInRadians)

        // console.log('anglesInRadians: ' + JSON.stringify(anglesInRadians,null,4));
        assert((anglesInRadians.startAngle === i) === 0 ? 36 : 108);
        assert((anglesInRadians.endAngle === i) === 0 ? 108 : 252);
        assert((anglesInRadians.totalAngle === i) === 0 ? 72 : 144);
      });
    done();
  });
  it("should return the correct angles for ranges that cross the origin", function(done) {
    const angles = getRangeAngles({ start: 9, end: 0 }, 10);
    // console.log('angles: ' + JSON.stringify(angles,null,4));
    const anglesInRadians = {};
    Object.keys(angles).forEach(function(key) {
      anglesInRadians[key] = (angles[key] * 360) / Math.PI / 2;
    });
    assert(anglesInRadians.startAngle === 324);
    assert(anglesInRadians.endAngle === 36);
    assert(anglesInRadians.totalAngle === 72);
    // console.log('anglesInRadians: ' + JSON.stringify(anglesInRadians,null,4));
    done();
  });
  it("should return the correct angles for ranges that do not cross the origin", function(done) {
    const angles = getRangeAngles({ start: 1, end: 2, overlapsSelf: true }, 10);
    // console.log('angles: ' + JSON.stringify(angles,null,4));
    const anglesInRadians = {};
    Object.keys(angles).forEach(function(key) {
      anglesInRadians[key] = (angles[key] * 360) / Math.PI / 2;
    });
    // console.log('anglesInRadians: ' + JSON.stringify(anglesInRadians,null,4));
    assert(anglesInRadians.startAngle === 36);
    assert(anglesInRadians.centerAngle === 72); //even if overlapsSelf=true the center angle should still be 72
    assert(anglesInRadians.endAngle === 108);
    assert(anglesInRadians.totalAngle === 72);
    done();
  });
});

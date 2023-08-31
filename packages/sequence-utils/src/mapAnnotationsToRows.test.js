import chai from "chai";

import { expect } from "chai";
import chaiSubset from "chai-subset";
import mapAnnotationsToRows from "./mapAnnotationsToRows.js";
chai.use(chaiSubset);
describe("mapAnnotationsToRows", () => {
  it("maps overlapsSelf=true annotations to the same y-offset correctly", () => {
    const annotation1 = {
      start: 1,
      end: 3,
      id: "a"
    };

    const annotationWraps = {
      start: 1,
      end: 3,
      overlapsSelf: true,
      id: "overlaps self"
    };
    const annotationWrapsAddon = {
      start: 4,
      end: 0,
      overlapsSelf: true,
      isWrappedAddon: true,
      id: "overlaps self"
    };
    const annotation3 = {
      start: 0,
      end: 0,
      id: "b"
    };

    const annotation4 = {
      start: 0,
      end: 0,
      id: "c"
    };

    const annotations = [
      annotation1,
      annotationWraps,
      annotationWrapsAddon,
      annotation3,
      annotation4
    ];
    const sequenceLength = 10;
    const bpsPerRow = 5;
    const annotationsToRowsMap = mapAnnotationsToRows(
      annotations,
      sequenceLength,
      bpsPerRow
    );
    expect(annotationsToRowsMap[0]).to.containSubset([
      {
        annotation: annotationWraps,
        start: 1,
        end: 3,
        id: annotationWraps.id,
        yOffset: 1,
        enclosingRangeType: "beginningAndEnd"
      },
      {
        annotation: annotationWrapsAddon,
        start: 0,
        end: 0,
        id: annotationWrapsAddon.id,
        yOffset: 1,
        enclosingRangeType: "end"
      },
      {
        annotation: annotationWrapsAddon,
        start: 4,
        end: 4,
        id: annotationWrapsAddon.id,
        yOffset: 1,
        enclosingRangeType: "beginning"
      }
    ]);
  });
  it("maps overlapping annotations with joined locations to rows correctly", () => {
    const annotation1 = {
      start: 0,
      end: 9,
      locations: [
        { start: 0, end: 1 },
        { start: 7, end: 9 }
      ],
      id: "a"
    };
    const annotation2 = {
      start: 0,
      end: 9,
      locations: [
        { start: 0, end: 1 },
        { start: 2, end: 4 },
        { start: 9, end: 9 }
      ],
      id: "b"
    };
    const annotations = [annotation1, annotation2];
    const sequenceLength = 10;
    const bpsPerRow = 5;
    const annotationsToRowsMap = mapAnnotationsToRows(
      annotations,
      sequenceLength,
      bpsPerRow
    );
    expect(annotationsToRowsMap[0]).to.containSubset([
      {
        annotation: annotation1,
        start: 0,
        end: 4,
        id: annotation1.id,
        yOffset: 0,
        containsLocations: true,
        enclosingRangeType: "beginningAndEnd"
      },
      {
        annotation: annotation1,
        start: 0,
        end: 1,
        id: annotation1.id,
        yOffset: 0,
        isJoinedLocation: true,
        enclosingRangeType: "beginningAndEnd"
      },
      {
        start: 0,
        end: 4,
        id: annotation2.id,
        yOffset: 1,
        annotation: annotation2,
        enclosingRangeType: "beginningAndEnd"
      },
      {
        annotation: annotation2,
        start: 0,
        end: 1,
        id: annotation2.id,
        yOffset: 1,
        isJoinedLocation: true,
        enclosingRangeType: "beginningAndEnd"
      },
      {
        annotation: annotation2,
        start: 2,
        end: 4,
        id: annotation2.id,
        yOffset: 1,
        isJoinedLocation: true,
        enclosingRangeType: "beginningAndEnd"
      }
    ]);

    expect(annotationsToRowsMap[1]).to.containSubset([
      {
        annotation: annotation1,
        start: 5,
        end: 9,
        id: annotation1.id,
        yOffset: 0,
        containsLocations: true,
        enclosingRangeType: "beginningAndEnd"
      },
      {
        annotation: annotation1,
        start: 7,
        end: 9,
        id: annotation1.id,
        yOffset: 0,
        isJoinedLocation: true,
        enclosingRangeType: "beginningAndEnd"
      },
      {
        start: 5,
        end: 9,
        id: annotation2.id,
        yOffset: 1,
        annotation: annotation2,
        enclosingRangeType: "beginningAndEnd"
      },
      {
        annotation: annotation2,
        start: 9,
        end: 9,
        id: annotation2.id,
        yOffset: 1,
        isJoinedLocation: true,
        enclosingRangeType: "beginningAndEnd"
      }
    ]);
  });
  it("maps overlapping annotations to rows correctly", () => {
    const annotation1 = {
      start: 0,
      end: 9,
      id: "a"
    };
    const annotation2 = {
      start: 0,
      end: 9,
      id: "b"
    };
    const annotations = [annotation1, annotation2];
    const sequenceLength = 10;
    const bpsPerRow = 5;
    const annotationsToRowsMap = mapAnnotationsToRows(
      annotations,
      sequenceLength,
      bpsPerRow
    );
    expect(annotationsToRowsMap).to.deep.equal({
      0: [
        {
          annotation: annotation1,
          start: 0,
          end: 4,
          id: annotation1.id,
          yOffset: 0,
          enclosingRangeType: "beginningAndEnd"
        },
        {
          start: 0,
          end: 4,
          id: annotation2.id,
          yOffset: 1,
          annotation: annotation2,
          enclosingRangeType: "beginningAndEnd"
        }
      ],
      1: [
        {
          annotation: annotation1,
          start: 5,
          end: 9,
          id: annotation1.id,
          yOffset: 0,
          enclosingRangeType: "beginningAndEnd"
        },
        {
          start: 5,
          end: 9,
          id: annotation2.id,
          yOffset: 1,
          annotation: annotation2,
          enclosingRangeType: "beginningAndEnd"
        }
      ]
    });
  });
  it("correctly calculates y-offset for annotation split by origin", () => {
    const annotation1 = {
      start: 7,
      end: 9,
      id: "a"
    };
    const annotation2 = {
      start: 5,
      end: 3,
      id: "b"
    };
    const annotations = [annotation1, annotation2];
    const sequenceLength = 10;
    const bpsPerRow = 10;
    const annotationsToRowsMap = mapAnnotationsToRows(
      annotations,
      sequenceLength,
      bpsPerRow
    );
    expect(annotationsToRowsMap).to.deep.equal({
      0: [
        {
          start: 7,
          end: 9,
          id: annotation1.id,
          yOffset: 0,
          annotation: annotation1,
          enclosingRangeType: "beginningAndEnd"
        },
        {
          annotation: annotation2,
          start: 0,
          end: 3,
          id: annotation2.id,
          yOffset: 1,
          enclosingRangeType: "end"
        },
        {
          annotation: annotation2,
          start: 5,
          end: 9,
          id: annotation2.id,
          yOffset: 1,
          enclosingRangeType: "beginning"
        }
      ]
    });
  });
  it("correctly calculates y-offset for annotation split by origin (different ordering of annotations)", () => {
    const annotation1 = {
      start: 5,
      end: 3,
      id: "a"
    };
    const annotation2 = {
      start: 7,
      end: 9,
      id: "b"
    };
    const annotations = [annotation1, annotation2];
    const sequenceLength = 10;
    const bpsPerRow = 10;
    const annotationsToRowsMap = mapAnnotationsToRows(
      annotations,
      sequenceLength,
      bpsPerRow
    );
    expect(annotationsToRowsMap).to.deep.equal({
      0: [
        {
          annotation: annotation1,
          start: 0,
          end: 3,
          id: annotation1.id,
          yOffset: 0,
          enclosingRangeType: "end"
        },
        {
          annotation: annotation1,
          start: 5,
          end: 9,
          id: annotation1.id,
          yOffset: 0,
          enclosingRangeType: "beginning"
        },
        {
          start: 7,
          end: 9,
          id: annotation2.id,
          yOffset: 1,
          annotation: annotation2,
          enclosingRangeType: "beginningAndEnd"
        }
      ]
    });
  });

  it("maps single annotation to rows correctly", () => {
    const annotation1 = {
      start: 0,
      end: 9,
      id: "a"
    };
    const annotations = [annotation1];
    const sequenceLength = 10;
    const bpsPerRow = 5;
    const annotationsToRowsMap = mapAnnotationsToRows(
      annotations,
      sequenceLength,
      bpsPerRow
    );
    expect(annotationsToRowsMap).to.deep.equal({
      0: [
        {
          annotation: annotation1,
          start: 0,
          end: 4,
          id: annotation1.id,
          yOffset: 0,
          enclosingRangeType: "beginningAndEnd"
        }
      ],
      1: [
        {
          annotation: annotation1,
          start: 5,
          end: 9,
          id: annotation1.id,
          yOffset: 0,
          enclosingRangeType: "beginningAndEnd"
        }
      ]
    });
  });
  it("maps annotations to rows correctly when the annotations are passed as an object", () => {
    const annotation1 = {
      start: 0,
      end: 9,
      id: "a"
    };
    const annotations = { a: annotation1 };
    const sequenceLength = 10;
    const bpsPerRow = 5;
    const annotationsToRowsMap = mapAnnotationsToRows(
      annotations,
      sequenceLength,
      bpsPerRow
    );
    expect(annotationsToRowsMap).to.deep.equal({
      0: [
        {
          annotation: annotation1,
          start: 0,
          end: 4,
          id: annotation1.id,
          yOffset: 0,
          enclosingRangeType: "beginningAndEnd"
        }
      ],
      1: [
        {
          annotation: annotation1,
          start: 5,
          end: 9,
          id: annotation1.id,
          yOffset: 0,
          enclosingRangeType: "beginningAndEnd"
        }
      ]
    });
  });
});

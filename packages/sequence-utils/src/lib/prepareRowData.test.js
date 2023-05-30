

import {expect} from "chai";

import prepareRowData from "./prepareRowData";
import output1 from "./prepareRowData_output1.json";

describe("prepareRowData", () => {
  it("maps overlapping annotations to rows correctly", () => {
    const annotation1 = {
      start: 0,
      end: 9,
      id: "a"
    };
    const annotation2 = {
      start: 10,
      end: 4,
      id: "b"
    };
    const bpsPerRow = 5;
    const sequenceData = {
      sequence: "gagagagagagagaga",
      features: [annotation1],
      translations: [annotation1],
      parts: { a: annotation1 },
      cutsites: { b: annotation2 },
      orfs: [annotation2],
      primers: [annotation2, { id: "asdfa", start: 1, end: 3, forward: true }], //reverse primers shouldn't offset forward primers
      warnings: [annotation2],
      assemblyPieces: [annotation2],
      lineageAnnotations: [annotation2]
    };
    const rowData = prepareRowData(sequenceData, bpsPerRow);
    expect(rowData).to.deep.equal(output1);
  });
});

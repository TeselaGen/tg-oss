import { offsetFormulaByIndex } from "../../src/DataTable/offsetFormulaByIndex";

describe("offsetFormulaByIndex", () => {
  it(`offsetFormulaByIndex should work for all sorts of translations`, () => {
    expect(
      offsetFormulaByIndex({
        formula: "=c1",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "a"
      })
    ).toEqual("=c2");
    expect(
      offsetFormulaByIndex({
        formula: "=c1",
        newRowIndex: 3,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "a"
      })
    ).toEqual("=c3");
    expect(
      offsetFormulaByIndex({
        formula: "=c1",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "b"
      })
    ).toEqual("=d2");
    expect(
      offsetFormulaByIndex({
        formula: "=c$1",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "a"
      })
    ).toEqual("=c$1");
    expect(
      offsetFormulaByIndex({
        formula: "=c$1",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "b"
      })
    ).toEqual("=d$1");
    expect(
      offsetFormulaByIndex({
        formula: "=$c$1",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "b"
      })
    ).toEqual("=$c$1");
    expect(
      offsetFormulaByIndex({
        formula: "=sum(c1:c2)",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "a"
      })
    ).toEqual("=sum(c2:c3)");
    expect(
      offsetFormulaByIndex({
        formula: "=sum(c1,d2, e3)",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "a"
      })
    ).toEqual("=sum(c2,d3, e4)");
    expect(
      offsetFormulaByIndex({
        formula: "=(c5+d5)*ee7",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "a"
      })
    ).toEqual("=(c6+d6)*ee8");
    expect(
      offsetFormulaByIndex({
        formula: "=(c5+d5)*ee7",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "c"
      })
    ).toEqual("=(e6+f6)*eg8");
    expect(
      offsetFormulaByIndex({
        formula: "=sum(c:c)",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "a"
      })
    ).toEqual("=sum(c:c)");
    expect(
      offsetFormulaByIndex({
        formula: "=sum(c:c)",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "b"
      })
    ).toEqual("=sum(d:d)");
    expect(
      offsetFormulaByIndex({
        formula: "=sum($c:$c)",
        newRowIndex: 2,
        oldRowIndex: 1,
        oldCol: "a",
        newCol: "b"
      })
    ).toEqual("=sum($c:$c)");
  });
});

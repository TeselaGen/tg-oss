import filterSequenceString from "./filterSequenceString";
import { expect } from "vitest";

describe("filterSequenceString", () => {
  it("should not filter u's and should convert t's to u's from isOligo=true seqs", () => {
    const [str, warnings] = filterSequenceString("tatuuag--a", {
      isOligo: true
    });
    expect(str).toBe("tatuuaga");
    // expect(warnings[0]).toBe('Replaced "t" with "u" 2 times');
    expect(warnings[0]).toBe(
      "Invalid character(s) detected and removed: -, - "
    );
  });
  it("should not convert u's to t's for isDna (default isDna=true) seqs", () => {
    const [str, warnings] = filterSequenceString("tatuuag--a", {});
    // expect(warnings[0]).toBe('Replaced "u" with "t" 2 times');
    expect(warnings[0]).toBe(
      "Invalid character(s) detected and removed: -, - "
    );
    expect(str).toBe("tatuuaga");
  });
  it("should filter out unwanted chars", () => {
    const [str, warnings] = filterSequenceString("tatag--a");
    expect(warnings[0]).toBe(
      "Invalid character(s) detected and removed: -, - "
    );
    expect(str).toBe("tataga");
  });
  it("should handle additional chars option", () => {
    const [str, warnings] = filterSequenceString("tatag--a", {
      additionalValidChars: "-"
    });
    expect(warnings.length).toBe(0);
    expect(str).toBe("tatag--a");
  });
  it("should handle additional chars option", () => {
    const [str, warnings] = filterSequenceString("tatag--a", {
      additionalValidChars: "f-q"
    });
    expect(warnings.length).toBe(0);
    expect(str).toBe("tatag--a");
  });

  it("when isProtein: true, should filter only valid amino acids by default", () => {
    const [str, warnings] = filterSequenceString(
      'bbb342"""xtgalmfwkqespvicyhrnd,,../',
      {
        isProtein: true
      }
    );
    expect(warnings[0]).toBe(
      'Invalid character(s) detected and removed: b, b, b, 3, 4, 2, ", ", ", ,, ,, ., ., / '
    );
    expect(str).toBe("xtgalmfwkqespvicyhrnd");
  });
  it("when isProtein: true, should handle upper case letters", () => {
    const [str, warnings] = filterSequenceString("xtgalmfWKQEspvicyhrnd", {
      isProtein: true
    });
    expect(warnings.length).toBe(0);
    expect(str).toBe("xtgalmfWKQEspvicyhrnd");
  });
  it("when isProtein: true, should handle the option to includeStopCodon by allowing periods", () => {
    const [str] = filterSequenceString('bbb342"""xtgalmfwkqespvicyhrnd,,../', {
      isProtein: true,
      includeStopCodon: true
    });

    expect(str).toBe("xtgalmfwkqespvicyhrnd..");
  });
});

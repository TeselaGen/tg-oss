import {
  isZipFile,
  isExcelFile,
  isCsvFile,
  isTextFile,
  normalizeCsvHeader,
  validateCSVRequiredHeaders,
  validateCSVRow,
  removeExt,
  filterFilesInZip,
  parseCsvFile
} from "./file-utils"; // replace 'yourFile' with the path of your actual file

import * as JSZip from "jszip";
import * as mock from "mock-fs";

describe("parseCsvFile", () => {
  it("resolves with results when parsing is successful", async () => {
    const results = await parseCsvFile({
      originFileObj: new File(
        [
          `Material name
mat 1
mat 2`
        ],
        "dummyFile"
      )
    });
    expect(results.data).toEqual([
      { "Material name": "mat 1" },
      { "Material name": "mat 2" }
    ]);
  });
});

describe.skip("filterFilesInZip", () => {
  beforeAll(async () => {
    const zip = new JSZip();
    zip.file("test1.txt", "Hello World");
    zip.file("test2.csv", "id,name\n1,John");

    const data = await zip.generateAsync({ type: "nodebuffer" });

    mock({
      "/path/to": {
        "myzipfile.zip": data
      }
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it("should filter and return only .csv files", async () => {
    const file = {
      path: "/path/to/myzipfile.zip",
      originalname: "myzipfile.zip",
      mimetype: "application/zip"
    };
    const accepted = [".csv"];

    const files = await filterFilesInZip(file, accepted);

    expect(files.length).toBe(1);
    expect(files[0].name).toBe("test2.csv");
    const accepted2 = ["csv"];

    const files2 = await filterFilesInZip(file, accepted2);

    expect(files2.length).toBe(1);
    expect(files2[0].name).toBe("test2.csv");
  });
});

describe("CSV and Excel file tests", () => {
  describe("isZipFile", () => {
    it("should return true if file type is zip", () => {
      const file = { mimetype: "application/zip" };
      expect(isZipFile(file)).toBeTruthy();
    });

    it("should return false if file type is not zip", () => {
      const file = { mimetype: "application/pdf" };
      expect(isZipFile(file)).toBeFalsy();
    });
  });

  describe("isExcelFile", () => {
    it("should return true if file type is excel", () => {
      const file = { name: "test.xlsx" };
      expect(isExcelFile(file)).toBeTruthy();
    });

    it("should return false if file type is not excel", () => {
      const file = { name: "test.pdf" };
      expect(isExcelFile(file)).toBeFalsy();
    });
  });

  describe("isCsvFile", () => {
    it("should return true if file type is csv", () => {
      const file = { name: "test.csv" };
      expect(isCsvFile(file)).toBeTruthy();
    });

    it("should return false if file type is not csv", () => {
      const file = { name: "test.pdf" };
      expect(isCsvFile(file)).toBeFalsy();
    });
  });

  describe("isTextFile", () => {
    it("should return true if file type is txt", () => {
      const file = { name: "test.txt" };
      expect(isTextFile(file)).toBeTruthy();
    });

    it("should return false if file type is not txt", () => {
      const file = { name: "test.pdf" };
      expect(isTextFile(file)).toBeFalsy();
    });
  });

  describe("normalizeCsvHeader", () => {
    it('should return the same header if it starts with "ext-"', () => {
      const header = "ext-name";
      expect(normalizeCsvHeader(header)).toBe(header);
    });

    it('should return a normalized header if it does not start with "ext-"', () => {
      const header = "name";
      expect(normalizeCsvHeader(header)).toBe("NAME");
    });
  });

  describe("validateCSVRequiredHeaders", () => {
    it("should return error message if required headers are missing", () => {
      const fields = ["name", "address"];
      const requiredHeaders = ["name", "email"];
      const filename = "test.csv";
      expect(
        validateCSVRequiredHeaders(fields, requiredHeaders, filename)
      ).toBe("The file test.csv is missing required headers. (email)");
    });

    it("should return undefined if no required headers are missing", () => {
      const fields = ["name", "email"];
      const requiredHeaders = ["name", "email"];
      const filename = "test.csv";
      expect(
        validateCSVRequiredHeaders(fields, requiredHeaders, filename)
      ).toBeUndefined();
    });
  });

  describe("validateCSVRow", () => {
    it("should return error message if required fields are missing", () => {
      const row = { name: "John", email: "" };
      const requiredHeaders = ["name", "email"];
      const index = 0;
      expect(validateCSVRow(row, requiredHeaders, index)).toBe(
        'Row 1 is missing the required field "email"'
      );
    });

    it("should return undefined if no required fields are missing", () => {
      const row = { name: "John", email: "john@example.com" };
      const requiredHeaders = ["name", "email"];
      const index = 0;
      expect(validateCSVRow(row, requiredHeaders, index)).toBeUndefined();
    });
  });

  describe("removeExt", () => {
    it("should remove extension from filename", () => {
      const filename = "test.csv";
      expect(removeExt(filename)).toBe("test");
    });

    it("should return the same filename if there is no extension", () => {
      const filename = "test";
      expect(removeExt(filename)).toBe("test");
    });
  });
});

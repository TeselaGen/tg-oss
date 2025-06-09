/* eslint-disable @typescript-eslint/no-empty-function */
// file-utils.spec.js

// Import Bun's built-in test utilities
import { expect, beforeAll, describe, it } from "bun:test";

// Assuming file-utils.js is in the same directory or a relative path
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
} from "./file-utils";

// Fix: Correct JSZip import - import the default export directly
import JSZip from "jszip";

// --- Mocking Web APIs for Papaparse ---
// Papaparse uses FileReader and FileReaderSync.
// We need to mock these to make them available in the Bun test environment.
// A simple mock suffices to prevent 'not defined' errors.
global.FileReader = class {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null; // Store the result of readAsText/readAsArrayBuffer
  }

  // Simulate reading a Blob/File as text
  readAsText(blob) {
    if (blob instanceof File || blob instanceof Blob) {
      // In a real scenario, you'd convert blob to text
      // For testing purposes, we might just assume it's text or trigger onload directly
      blob
        .arrayBuffer()
        .then(buffer => {
          this.result = new TextDecoder().decode(buffer); // Decode buffer to string
          if (typeof this.onload === "function") {
            this.onload({ target: { result: this.result } });
          }
        })
        .catch(error => {
          if (typeof this.onerror === "function") {
            this.onerror(error);
          }
        });
    } else {
      // Handle cases where a non-File/Blob is passed, if necessary
      if (typeof this.onerror === "function") {
        this.onerror(new Error("FileReader: Input must be a Blob or File."));
      }
    }
  }

  // Simulate reading a Blob/File as ArrayBuffer
  readAsArrayBuffer(blob) {
    if (blob instanceof File || blob instanceof Blob) {
      blob
        .arrayBuffer()
        .then(buffer => {
          this.result = buffer;
          if (typeof this.onload === "function") {
            this.onload({ target: { result: this.result } });
          }
        })
        .catch(error => {
          if (typeof this.onerror === "function") {
            this.onerror(error);
          }
        });
    } else {
      if (typeof this.onerror === "function") {
        this.onerror(new Error("FileReader: Input must be a Blob or File."));
      }
    }
  }

  // Add other methods like readAsDataURL if needed by papaparse or your code
};

// If papaparse explicitly tries to use FileReaderSync in some branches, mock it too.
// This is a minimal mock to prevent ReferenceError. Its functionality won't be fully tested here.
global.FileReaderSync = class {
  readAsText() {
    // Just return a dummy string, as this is typically in a worker context
    return "mocked content";
  }
  readAsArrayBuffer() {
    return new ArrayBuffer(0); // Return an empty buffer
  }
  // Add other read methods if needed
};

// --- Mocking 'window.toastr' to prevent ReferenceError ---
// If the 'file-utils.js' code depends on window.toastr, we need to mock it.
// This mock prevents the 'window is not defined' error during tests.
// You might want to enhance this mock if you need to assert toastr calls.
global.window = {
  toastr: {
    warning: () => {}, // Mock the warning method
    error: () => {}, // Mock other methods if used
    success: () => {}
  }
};

describe("parseCsvFile", () => {
  it("resolves with results when parsing is successful", async () => {
    const results = await parseCsvFile({
      originFileObj: new File(
        [
          `Material name
mat 1
mat 2`
        ],
        "dummyFile",
        { type: "text/csv" } // Important: specify type for correct FileReader behavior
      )
    });
    expect(results.data).toEqual([
      { "Material name": "mat 1" },
      { "Material name": "mat 2" }
    ]);
  });
});

describe("filterFilesInZip", () => {
  let zipFileBlob; // Will store the zip content as a Blob

  beforeAll(async () => {
    const zip = new JSZip();
    zip.file("test1.txt", "Hello World");
    zip.file("test2.csv", "id,name\n1,John");

    // Generate the zip content as a Blob directly
    // This is more compatible with browser-like environments like Bun's test runner
    zipFileBlob = await zip.generateAsync({ type: "blob" });
  });

  it("should filter and return only .csv files from an in-memory zip blob", async () => {
    // Pass the Blob directly or wrap it in a File object if filterFilesInZip expects it
    const file = new File([zipFileBlob], "myzipfile.zip", {
      type: "application/zip"
    });

    const accepted = [".csv"];

    // Assuming filterFilesInZip receives an object with an 'originFileObj'
    // or a 'data' property that it then passes to JSZip.loadAsync.
    // If filterFilesInZip expects a specific structure, ensure this matches.
    const files = await filterFilesInZip(
      {
        originFileObj: file, // Pass the File object which contains the Blob
        originalname: file.name,
        mimetype: file.type
      },
      accepted
    );

    expect(files.length).toBe(1);
    expect(files[0].name).toBe("test2.csv");

    const accepted2 = ["csv"];

    const files2 = await filterFilesInZip(
      {
        originFileObj: file,
        originalname: file.name,
        mimetype: file.type
      },
      accepted2
    );

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

/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import { camelCase, flatMap, remove, startsWith, snakeCase } from "lodash-es";
import { loadAsync } from "jszip";
import Promise from "bluebird";
import { parse, unparse } from "papaparse";

const debug = false;
const logDebug = (...args) => {
  if (debug) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export const allowedCsvFileTypes = [".csv", ".txt", ".xlsx"];

export const isZipFile = file => {
  if (getExt(file) === "zip") return true;
  if (getExt(file) === "geneious") return false;
  const type = file.mimetype || file.type;
  return type === "application/zip" || type === "application/x-zip-compressed";
};

export const getExt = file =>
  (file?.name || file?.originalname)?.split(".").pop();
export const isExcelFile = file => getExt(file) === "xlsx";
export const isCsvFile = file => getExt(file) === "csv";
export const isTextFile = file => ["text", "txt"].includes(getExt(file));

export const isCsvOrExcelFile = file => isCsvFile(file) || isExcelFile(file);

export const extractZipFiles = async allFiles => {
  if (!Array.isArray(allFiles)) allFiles = [allFiles];
  // make a copy so we don't mutate the form value
  allFiles = [...allFiles];
  const zipFiles = remove(allFiles, isZipFile);
  if (!zipFiles.length) return allFiles;
  const zipFilesArray = Array.isArray(zipFiles) ? zipFiles : [zipFiles];
  const parsedZips = await Promise.map(zipFilesArray, file =>
    loadAsync(
      file instanceof
        (typeof Blob !== "undefined" ? Blob : require("buffer").Blob)
        ? file
        : file.originFileObj
    )
  );
  const zippedFiles = flatMap(parsedZips, zip =>
    Object.keys(zip.files).map(key => zip.files[key])
  );
  const unzippedFiles = await Promise.map(zippedFiles, file => {
    // converts the compressed file to a string of its contents
    return file.async("blob").then(function (fileData) {
      const newFileObj = new File([fileData], file.name);
      return {
        name: file.name,
        originFileObj: newFileObj,
        originalFileObj: newFileObj
      };
    });
  });
  if (unzippedFiles.length) {
    return allFiles.concat(
      unzippedFiles.filter(
        ({ name, originFileObj }) =>
          !name.includes("__MACOSX") &&
          !name.includes(".DS_Store") &&
          originFileObj.size !== 0
      )
    );
  } else {
    return allFiles;
  }
};

const defaultCsvParserOptions = {
  header: true,
  skipEmptyLines: "greedy"
};
export const setupCsvParserOptions = (parserOptions = {}) => {
  const {
    camelCaseHeaders = false,
    lowerCaseHeaders = false,
    ...rest
  } = parserOptions;

  const papaParseOpts = { ...rest };
  if (camelCaseHeaders) {
    logDebug("[CSV-PARSER] camelCasing headers");
    papaParseOpts.transformHeader = header => {
      let transHeader = header;
      if (!startsWith(header.trim(), "ext-")) {
        transHeader = camelCase(header);
      }

      if (transHeader) {
        logDebug(
          `[CSV-PARSER] Transformed header from: ${header} to: ${transHeader}`
        );
        transHeader = transHeader.trim();
      } else {
        logDebug(`[CSV-PARSER] Not transforming header: ${header}`);
      }

      return transHeader;
    };
  } else if (lowerCaseHeaders) {
    papaParseOpts.transformHeader = header => {
      let transHeader = header;
      if (!startsWith(header, "ext-")) {
        transHeader = header.toLowerCase();
      }

      if (transHeader) {
        logDebug(
          `[CSV-PARSER] Transformed header from: ${header} to: ${transHeader}`
        );
        transHeader = transHeader.trim();
      } else {
        logDebug(`[CSV-PARSER] Not transforming header: ${header}`);
      }

      return transHeader;
    };
  }
  // tnw: the papaparse trimHeaders option was removed so we need to trim headers manually
  const transformToAlwaysRun = header => header.trim();
  if (parserOptions.transformHeader) {
    const existingTransformHeader = parserOptions.transformHeader;
    papaParseOpts.transformHeader = header => {
      const trimmedHeader = transformToAlwaysRun(header);
      return existingTransformHeader(trimmedHeader);
    };
  } else {
    papaParseOpts.transformHeader = transformToAlwaysRun;
  }

  return papaParseOpts;
};

const normalizeCsvHeaderHelper = h => snakeCase(camelCase(h)).toUpperCase();

export function normalizeCsvHeader(header) {
  if (header.startsWith("ext-") || header.startsWith("EXT-")) {
    return header;
  }
  return normalizeCsvHeaderHelper(header);
}

export const parseCsvFile = (csvFile, parserOptions = {}) => {
  return new Promise((resolve, reject) => {
    const opts = {
      ...defaultCsvParserOptions,
      ...setupCsvParserOptions(parserOptions),
      complete: results => {
        if (
          results &&
          results.data?.length &&
          results.errors &&
          ((results.errors.length === 1 &&
            results.errors[0].code === `UndetectableDelimiter`) ||
            results.errors.every(
              e => e.code === `TooFewFields` || e.code === `TooManyFields`
            ))
        ) {
          return resolve(results);
        } else if (results && results.errors && results.errors.length) {
          return reject("Error in csv: " + JSON.stringify(results.errors));
        }
        return resolve(results);
      },
      error: error => {
        reject(error);
      }
    };
    logDebug(`[CSV-PARSER] parseCsvFile opts:`, opts);
    parse(csvFile.originFileObj, opts);
  });
};

/**
 * Gets a properly formatted json object into s csv string
 * https://www.papaparse.com/docs#json-to-csv
 * const options = {
      quotes: false, //or array of booleans
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ",",
      header: true,
      newline: "\r\n",
      skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
      columns: null //or array of strings
    }
 * @returns csv as string
 */
export const jsonToCsv = (jsonData, options = {}) => {
  const csv = unparse(jsonData, options);
  return csv;
};

export const parseCsvString = (csvString, parserOptions = {}) => {
  const opts = {
    ...defaultCsvParserOptions,
    ...setupCsvParserOptions(parserOptions)
  };
  logDebug(`[CSV-PARSER] parseCsvString opts:`, opts);
  return parse(csvString, opts);
};

export async function parseCsvOrExcelFile(
  fileOrFiles,
  { csvParserOptions } = {}
) {
  let csvFile, excelFile, txtFile;
  if (Array.isArray(fileOrFiles)) {
    csvFile = fileOrFiles.find(isCsvFile);
    excelFile = fileOrFiles.find(isExcelFile);
    txtFile = fileOrFiles.find(isTextFile);
  } else {
    if (isExcelFile(fileOrFiles)) excelFile = fileOrFiles;
    else if (isCsvFile(fileOrFiles)) csvFile = fileOrFiles;
    else if (isTextFile(fileOrFiles)) txtFile = fileOrFiles;
  }
  if (!csvFile && !excelFile && !txtFile) {
    throw new Error("No csv or excel files found");
  }

  if (!csvFile && !excelFile) csvFile = txtFile;

  if (!csvFile && excelFile && window.parseExcelToCsv) {
    csvFile = await window.parseExcelToCsv(
      excelFile.originFileObj || excelFile
    );
    if (csvFile.error) {
      throw new Error(csvFile.error);
    }
  } else if (excelFile) {
    throw new Error("Excel Parser not initialized on the window");
  }
  const parsedCsv = await parseCsvFile(csvFile, csvParserOptions);
  parsedCsv.originalFile = csvFile;
  return parsedCsv;
}

export const validateCSVRequiredHeaders = (
  fields,
  requiredHeaders,
  filename
) => {
  const missingRequiredHeaders = requiredHeaders.filter(field => {
    return !fields.includes(field);
  });
  if (missingRequiredHeaders.length) {
    const name = filename ? `The file ${filename}` : "CSV file";
    return `${name} is missing required headers. (${missingRequiredHeaders.join(
      ", "
    )})`;
  }
};

export const validateCSVRow = (row, requiredHeaders, index) => {
  const missingRequiredFields = requiredHeaders.filter(field => !row[field]);
  if (missingRequiredFields.length) {
    if (missingRequiredFields.length === 1) {
      return `Row ${index + 1} is missing the required field "${
        missingRequiredFields[0]
      }"`;
    } else {
      return `Row ${
        index + 1
      } is missing these required fields: ${missingRequiredFields.join(", ")}`;
    }
  }
};

export const cleanCommaSeparatedCell = cellData =>
  (cellData || "")
    .split(",")
    .map(n => n.trim())
    .filter(n => n);

/**
 * Because the csv rows might not have the same header keys in some cases (extended properties)
 * this function will make sure that each row will have all headers so that the export
 * does not drop fields
 * @param {*} rows
 */
export const cleanCsvExport = rows => {
  const allHeaders = [];
  rows.forEach(row => {
    Object.keys(row).forEach(header => {
      if (!allHeaders.includes(header)) {
        allHeaders.push(header);
      }
    });
  });
  rows.forEach(row => {
    allHeaders.forEach(header => {
      row[header] = row[header] || "";
    });
  });
  return rows;
};

export const filterFilesInZip = async (file, accepted) => {
  if (!file || (Array.isArray(file) && !file.length)) return [];
  const zipExtracted = await extractZipFiles(file);
  const acceptedFiles = [];
  for (const extFile of zipExtracted) {
    if (accepted.some(ext => ext?.replace(".", "") === getExt(extFile))) {
      acceptedFiles.push(extFile);
    }
  }

  if (acceptedFiles.length && acceptedFiles.length < zipExtracted.length)
    window.toastr.warning("Some files don't have the proper file extension.");

  if (!acceptedFiles.length)
    window.toastr.warning("No files with the proper extension were found.");

  return acceptedFiles;
};

export function removeExt(filename) {
  if (filename && filename.includes(".")) {
    return filename.split(".").slice(0, -1).join(".");
  } else {
    return filename;
  }
}

export async function uploadAndProcessFiles(files = []) {
  if (!files.length) return null;

  const formData = new FormData();
  files.forEach(({ originFileObj }) => formData.append("file", originFileObj));

  const response = await window.api.post("/user_uploads/", formData);

  return response.data.map(d => ({
    encoding: d.encoding,
    mimetype: d.mimetype,
    originalname: d.originalname,
    path: d.path,
    size: d.size
  }));
}

export async function encodeFilesForRequest(files) {
  const encodedFiles = [];
  for (const file of files) {
    const encoded = await fileToBase64(file.originalFileObj);
    const data = encoded.split(",");
    encodedFiles.push({
      type: file.type,
      base64Data: data[1],
      name: file.name
    });
  }
  return encodedFiles;
}

const fileToBase64 = file => {
  return new Promise(resolve => {
    const reader = new FileReader();
    // Read file content on file loaded event
    reader.onload = function (event) {
      resolve(event.target.result);
    };

    // Convert data to base64
    reader.readAsDataURL(file);
  });
};

import fastaToJson from "./fastaToJson";
import genbankToJson from "./genbankToJson";
import sbolXmlToJson from "./sbolXmlToJson";
import extractFileExtension from "./utils/extractFileExtension.js";
import snapgeneToJson from "./snapgeneToJson";
import ab1ToJson from "./ab1ToJson";
import gffToJson from "./gffToJson";
import isBrowser from "./utils/isBrowser";
import { tidyUpSequenceData } from "@teselagen/sequence-utils";
import geneiousXmlToJson from "./geneiousXmlToJson";
import jbeiXmlToJson from "./jbeiXmlToJson";
import { unzipSync } from "fflate";

/**
 * takes in file content string and its file name and determines what parser it needs to be sent to.
 * The file is parsed to our old JSON schema and after it goes through an intermediate step where we convert that json to our new schema
 * @param  {string} fileContentString content of the file as a string
 * @param  {Function} onFileParsed    //tnr: fill this out
 */

async function anyToJson(fileContentStringOrFileObj, options) {
  let fileContentString;
  options = options || {};
  let fileName = options.fileName || "";
  if (!fileName && typeof fileContentStringOrFileObj !== "string") {
    fileName = fileContentStringOrFileObj.name;
    options.fileName = fileName;
  }
  const ext = extractFileExtension(fileName);
  if (typeof fileContentStringOrFileObj === "string") {
    fileContentString = fileContentStringOrFileObj;
  } else {
    if (/^(ab1)$/.test(ext)) {
      // AB1 sequencing read
      //we will always want to pass the file obj and not the string to ab1
      return ab1ToJson(fileContentStringOrFileObj, options);
    } else if (/^(prot)$/.test(ext)) {
      // fileContentString = await getUtf8StringFromFile(
      //   fileContentStringOrFileObj,
      //   options
      // );
      // snapgene file (always requires that the full filename be passed in to anyToJson otherwise it won't parse properly)
      //we will always want to pass the file obj and not the string to the snapgene parser because it expects a binary file
      return snapgeneToJson(fileContentStringOrFileObj, options);
    } else if (/^(dna)$/.test(ext)) {
      // snapgene file (always requires that the full filename be passed in to anyToJson otherwise it won't parse properly)
      //we will always want to pass the file obj and not the string to the snapgene parser because it expects a binary file
      return snapgeneToJson(fileContentStringOrFileObj, options);
    } else if (/^(geneious)$/.test(ext)) {
      const a = await getUint8ArrayFromFile(fileContentStringOrFileObj);
      const b = unzipSync(a);
      const c = Object.values(b)[0];
      const d = new TextDecoder().decode(c, { stream: false });
      return geneiousXmlToJson(d, options);
    } else {
      // we want to get the string from the file obj
      fileContentString = await getUtf8StringFromFile(
        fileContentStringOrFileObj,
        options
      );
    }
  }
// console.log(`fileContentString.includes("seq:seq"):`,fileContentString.includes("seq:seq"))
// console.log(`fileContentString.includes("jbei")):`,fileContentString.includes("jbei"))
  if (/^(fasta|fas|fa|fna|ffn)$/.test(ext)) {
    // FASTA
    return fastaToJson(fileContentString, options);
  } else if (/^(gb|gbk)$/.test(ext)) {
    // GENBANK
    return genbankToJson(fileContentString, options);
  } else if (
    /^(seq)$/.test(ext) ||
    (/^(xml)$/.test(ext) &&
      fileContentString.includes("seq:seq") &&
      fileContentString.includes("jbei"))
  ) {
    // JBEI
    return jbeiXmlToJson(fileContentString, options);
  } else if (/^(json)$/.test(ext)) {
    // TG JSON Probably
    const failure = {
      messages: [`Unable to parse JSON file ${fileName}`],
      success: false,
    };
    try {
      const cleaned = tidyUpSequenceData(
        JSON.parse(fileContentString),
        options
      );
      if (!cleaned.sequence.length) return [failure];
      return [{ parsedSequence: cleaned, success: true }];
    } catch (error) {
      console.error(`error:`, error);
      return [failure];
    }
  } else if (/^(gp|genpep)$/.test(ext)) {
    // PROTEIN GENBANK
    return genbankToJson(fileContentString, { ...options, isProtein: true });
  } else if (/^(xml|rdf)$/.test(ext)) {
    // XML/RDF
    return sbolXmlToJson(fileContentString || fileContentStringOrFileObj, options);
  } else if (/^(gff|gff3)$/.test(ext)) {
    // GFF
    return gffToJson(fileContentStringOrFileObj, options);
  } else {
    // console.warn(
    //   "TNR: No filename passed to anyToJson so we're going through the list of parsers. Make sure you're passing the filename when using anyToJson!"
    // );
    let parsersToTry = [
      {
        fn: genbankToJson,
        name: "Genbank Parser",
      },
      {
        fn: fastaToJson,
        name: "Fasta Parser",
      },
    ];
    const firstChar = fileContentString[fileContentString.search(/\S|$/)];

    //try to guess the file type based on the first non-whitespace char in the filestring
    if (firstChar === ">") {
      parsersToTry = parsersToTry.sort((a) => {
        if (a.name === "Fasta Parser") return -1;
        return 1;
      });
    } else if (firstChar === "L") {
      parsersToTry = parsersToTry.sort((a) => {
        if (a.name === "Genbank Parser") return -1;
        return 1;
      });
    }

    for (const parser of parsersToTry) {
      const toReturn = await parser.fn(fileContentString, options);
      if (successfulParsing(toReturn)) {
        //continue on to through the normal flow
        toReturn.forEach(function (result) {
          result.messages.push("Parsed using " + parser.name + ".");
        });
        return toReturn;
      }
    }

    //none of the parsers worked
    return [
      {
        messages: [
          "Unable to parse file as FASTA, genbank, JBEI, or SBOL formats",
        ],
        success: false,
      },
    ];
  }

  //helper function to determine whether or not the parsing was successful or not
  function successfulParsing(resultArray) {
    return resultArray.some(function (result) {
      return result.success;
    });
  }
}

export default anyToJson;

function getUtf8StringFromFile(file, { emulateBrowser } = {}) {
  if (!isBrowser && !emulateBrowser) {
    //emulate browser is only used for testing purposes
    //we're in a node context
    return Buffer.isBuffer(file)
      ? file.toString("utf-8")
      : Buffer.isBuffer(file.buffer)
      ? file.buffer.toString("utf-8")
      : file;
  }
  const reader = new window.FileReader();
  reader.readAsText(file, "UTF-8");
  return new Promise((resolve, reject) => {
    reader.onload = (evt) => {
      resolve(evt.target.result);
    };
    reader.onerror = (err) => {
      console.error("err:", err);
      reject(err);
    };
  });
}
function getUint8ArrayFromFile(file, { emulateBrowser } = {}) {
  if (!isBrowser && !emulateBrowser) {
    //emulate browser is only used for testing purposes
    //we're in a node context
    return Buffer.isBuffer(file)
      ? new Uint8Array(file)
      : Buffer.isBuffer(file.buffer)
      ? new Uint8Array(file.buffer)
      : file;
  }
  const reader = new window.FileReader();
  // reader.readAsText(file, "UTF-8");
  reader.readAsArrayBuffer(file);

  return new Promise((resolve, reject) => {
    reader.onload = (evt) => {
      const arrayBuffer = evt.target.result;
      const bytes = new Uint8Array(arrayBuffer);
      resolve(bytes);
    };
    reader.onerror = (err) => {
      console.error("err:", err);
      reject(err);
    };
  });
}

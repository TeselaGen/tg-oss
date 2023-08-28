import createInitialSequence from "./utils/createInitialSequence";
import extractFileExtension from "./utils/extractFileExtension";
import splitStringIntoLines from "./utils/splitStringIntoLines.js";
import validateSequenceArray from "./utils/validateSequenceArray";

/**
 * parses a fasta file that may or may not contain multiple resultArray
 * @param  {[string]} fileString   [string respresentation of file contents]
 * @param  {[function]} onFileParsed [callback for a parsed sequence]
 * @author Joshua P Nixon
 */

function fastaToJson(fileString, options = {}) {
  const ext = extractFileExtension(options.fileName);
  if (/^(faa)$/.test(ext)) {
    options.isProtein = true;
  }

  let resultArray = [];
  let result = null;
  try {
    const lines = splitStringIntoLines(fileString);

    for (let i = 0; i < lines.length; i++) {
      parseLine(lines[i]);
    }
    if (result) {
      resultArray.push(result);
      result = null;
    }
  } catch (e) {
    console.error("error:", e);
    console.error("error.stack: ", e.stack);
    resultArray = [
      {
        success: false,
        messages: ["Import Error: Invalid File"]
      }
    ];
  }
  return validateSequenceArray(resultArray, options);

  function parseLine(line) {
    line = line.trim();
    if (";" === line[0]) {
      //first instace is title, afterwards comments are ignored
      if (result) {
        return;
      }
      result = createInitialSequence(options);
      parseTitle(line);
    } else if (">" === line[0]) {
      //header line
      if (result) {
        resultArray.push(result);
        result = null;
      }
      result = createInitialSequence(options);
      parseTitle(line);
    } else {
      //sequence line
      if (!result) {
        result = createInitialSequence(options);
      }
      if ("*" === line[line.length - 1]) {
        //some resultArray are ended with an asterisk
        parseSequenceLine(line.substring(0, line.length - 1));
        resultArray.push(result);
        result = null;
      } else {
        parseSequenceLine(line);
      }
    }
    if (options && options.parseFastaAsCircular) {
      result.parsedSequence.circular = true;
    }
  }

  function parseTitle(line) {
    if (options && "parseName" in options && !options.parseName) {
      result.parsedSequence.name = line.slice(1);
      return;
    }

    const pipeIndex = line.indexOf("|");
    if (pipeIndex > -1) {
      result.parsedSequence.name = line.slice(1, pipeIndex);
      result.parsedSequence.description = line.slice(pipeIndex + 1);
    } else {
      result.parsedSequence.name = line.slice(1);
    }
  }

  function parseSequenceLine(line) {
    // http://www.ncbi.nlm.nih.gov/BLAST/blastcgihelp.shtml says
    // that the sequence can be interspersed with numbers and/or spaces and - dashes for gaps.
    // if (options && !options.doNotRemoveDashes && line.match(/[\s0-9-]/)) {
    //     line = line.replace(/[\s[0-9-]/g, "");
    //     const msg = "Warning: spaces, numbers and/or dashes were removed from sequence"
    //     result.messages.indexOf(msg === -1) && result.messages.push(msg);
    // }
    result.parsedSequence.sequence += line;
  }
}

export default fastaToJson;

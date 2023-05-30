//note: Huge credit and thanks go to IsaacLuo from whose python repository this code was adapted
// https://github.com/IsaacLuo/SnapGeneFileReader

import bufferpack from "bufferpack";
import { StringDecoder } from "string_decoder";
import buffer from "buffer";

import getArrayBufferFromFile from "./utils/getArrayBufferFromFile";
import createInitialSequence from "./utils/createInitialSequence";
import validateSequenceArray from "./utils/validateSequenceArray";
import flattenSequenceArray from "./utils/flattenSequenceArray";
import { get } from "lodash";
import { XMLParser } from "fast-xml-parser";
import extractFileExtension from "./utils/extractFileExtension";

const Buffer = buffer.Buffer

async function snapgeneToJson(fileObj, options = {}) {
  try {
    const returnVal = createInitialSequence(options);
    const arrayBuffer = await getArrayBufferFromFile(fileObj);
    const ext = extractFileExtension(options.fileName);
    let isProtein = options.isProtein;
    if (ext && /^(prot)$/.test(ext)) {
      isProtein = true;
      options.isProtein = true;
    }
    let offset = 0;
    // eslint-disable-next-line no-inner-declarations
    function read(size, fmt) {
      const buffer = Buffer.from(arrayBuffer.slice(offset, size + offset));
      offset += size;
      if (fmt) {
        const decoder = new StringDecoder(fmt);
        const toRet = decoder.write(buffer);
        return toRet;
      } else {
        return buffer;
      }
    }
    // eslint-disable-next-line no-inner-declarations
    async function unpack(size, mode) {
      const buffer = await read(size);
      const unpacked = await bufferpack.unpack(">" + mode, buffer);
      if (unpacked === undefined) return undefined;
      return await unpacked[0];
    }

    await read(1); //read the first byte
    // READ THE DOCUMENT PROPERTIES
    const length = await unpack(4, "I");
    const title = await read(8, "ascii");
    if (length !== 14 || title !== "SnapGene") {
      throw new Error("Wrong format for a SnapGene file !");
    }
    const data = await {
      ...returnVal.parsedSequence,
      isProtein,
      isDNA: !!(await unpack(2, "H")) && !isProtein,
      exportVersion: await unpack(2, "H"),
      importVersion: await unpack(2, "H"),
      features: [],
    };
    while (offset <= arrayBuffer.byteLength) {
      // # READ THE WHOLE FILE, BLOCK BY BLOCK, UNTIL THE END
      const next_byte = await read(1);
      // # next_byte table
      // # 0: dna sequence
      // # 1: compressed DNA
      // # 2: unknown
      // # 3: unknown
      // # 5: primers
      // # 6: notes
      // # 7: history tree
      // # 8: additional sequence properties segment
      // # 9: file Description
      // # 10: features
      // # 11: history node
      // # 13: unknown
      // # 16: alignable sequence
      // # 17: alignable sequence
      // # 18: sequence trace
      // # 19: Uracil Positions
      // # 20: custom DNA colors

      const block_size = await unpack(4, "I");
      if (ord(next_byte) === 21 || ord(next_byte) === 0) {
        //   # READ THE SEQUENCE AND ITS PROPERTIES
        const props = await unpack(1, "b");
        const binaryRep = dec2bin(props);

        data.circular = isFirstBitA1(binaryRep);
        const size = block_size - 1;
        if (size < 0) return;
        data.size = isProtein ? size * 3 : size;
        //   data["dna"] = {
        //     topology="circular" if props & 0x01 else "linear",
        //     strandedness="double" if props & 0x02 > 0 else "single",
        //     damMethylated=props & 0x04 > 0,
        //     dcmMethylated=props & 0x08 > 0,
        //     ecoKIMethylated=props & 0x10 > 0,
        //     length=block_size - 1
        //   }
        data.sequence = await read(size, "utf8");
      } else if (ord(next_byte) === 10) {
        //   # READ THE FEATURES
        const strand_dict = { 0: ".", 1: "+", 2: "-", 3: "=" };
        const xml = await read(block_size, "utf8");
        const b = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
          isArray: (name) => name === "Feature" || name === "Segment",
        }).parse(xml);
        const { Features: { Feature = [] } = {} } = b;
        data.features = [];
        Feature.forEach((feat) => {
          const { directionality, Segment = [], name, type } = feat;
          let color;
          let maxStart = 0;
          let maxEnd = 0;
          const locations =
            Segment &&
            Segment.map((seg) => {
              if (!seg) throw new Error("invalid feature definition");
              const { range } = seg;
              color = seg.color;
              let { start, end } = getStartAndEndFromRangeString(range);
              start = isProtein ? start * 3 : start;
              end = isProtein ? end * 3 + 2 : end;
              maxStart = Math.max(maxStart, start);
              maxEnd = Math.max(maxEnd, end);
              return {
                start,
                end,
              };
            });

          data.features.push({
            name,
            type,
            ...(locations?.length > 1 && { locations }),
            strand: strand_dict[directionality],
            start: maxStart,
            end: maxEnd,
            // color,
          });
        });
      } else if (ord(next_byte) === 6) {
        //       # READ THE NOTES

        const xml = await read(block_size, "utf8");
        const b = new XMLParser({}).parse(xml);
        const name = get(b, "Notes.CustomMapLabel");
        if (name) {
          data.name = name;
        }

        const description = get(b, "Notes.Description");
        if (description && typeof description === "string") {
          data.description = description
            .replace("<html><body>", "")
            .replace("</body></html>", ""); //fixes https://github.com/TeselaGen/ve-sequence-parsers/issues/225
        }
      } else {
        // # WE IGNORE THE WHOLE BLOCK
        await read(block_size); //we don't do anything with this
      }
    }
    returnVal.parsedSequence = data;
    return validateSequenceArray(
      flattenSequenceArray([returnVal], options),
      options
    );
  } catch (e) {
    console.error("Error trying to parse file as snapgene:", e);
    return [
      {
        success: false,
        messages: ["Import Error: Invalid File"],
      },
    ];
  }
}

function getStartAndEndFromRangeString(rangestring) {
  const [start, end] = rangestring.split("-");
  return {
    start: start - 1,
    end: end - 1,
  };
}

function ord(string) {
  //  discuss at: http://locutus.io/php/ord/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: incidence
  //   example 1: ord('K')
  //   returns 1: 75
  //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
  //   returns 2: 65536
  const str = string + "";
  const code = str.charCodeAt(0);
  if (code >= 0xd800 && code <= 0xdbff) {
    // High surrogate (could change last hex to 0xDB7F to treat
    // high private surrogates as single characters)
    const hi = code;
    if (str.length === 1) {
      // This is just a high surrogate with no following low surrogate,
      // so we return its value;
      return code;
      // we could also throw an error as it is not a complete character,
      // but someone may want to know
    }
    const low = str.charCodeAt(1);
    return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
  }
  if (code >= 0xdc00 && code <= 0xdfff) {
    // Low surrogate
    // This is just a low surrogate with no preceding high surrogate,
    // so we return its value;
    return code;
    // we could also throw an error as it is not a complete character,
    // but someone may want to know
  }
  return code;
}

export default snapgeneToJson;

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function isFirstBitA1(num) {
  return Number(num.toString().split("").pop()) === 1;
}

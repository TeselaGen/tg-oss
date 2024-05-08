# Bio Parsers

<!-- TOC -->

- [Bio Parsers](#bio-parsers)
  - [About this Repo](#about-this-repo)
  - [[CHANGELOG](CHANGELOG.md)](#changelogchangelogmd)
  - [Exported Functions](#exported-functions)
  - [Format Specification](#format-specification)
  - [Usage](#usage)
    - [install](#install)
    - [jsonToGenbank (same interface as jsonToFasta)](#jsontogenbank-same-interface-as-jsontofasta)
    - [anyToJson (same interface as genbankToJson, fastaToJson, xxxxToJson) (async required)](#anytojson-same-interface-as-genbanktojson-fastatojson-xxxxtojson-async-required)
    - [Options (for anyToJson or xxxxToJson)](#options-for-anytojson-or-xxxxtojson)
    - [ab1ToJson](#ab1tojson)
    - [snapgeneToJson (.dna files)](#snapgenetojson-dna-files)
    - [genbankToJson](#genbanktojson)
  - [Updating this repo](#updating-this-repo)
    - [Outside collaborators](#outside-collaborators)
  - [Thanks/Collaborators](#thankscollaborators)

<!-- /TOC -->

## About this Repo

This repo contains a set of parsers to convert between datatypes through a generalized JSON format.

## [CHANGELOG](CHANGELOG.md)

## Exported Functions

Use the following exports to convert to a generalized JSON format:

```
fastaToJson //handles fasta files (.fa, .fasta)
genbankToJson //handles genbank files (.gb, .gbk)
ab1ToJson //handles .ab1 sequencing read files
sbolXmlToJson //handles .sbol files
geneiousXmlToJson //handles .genious files
jbeiXmlToJson //handles jbei .seq or .xml files
snapgeneToJson //handles snapgene (.dna) files
anyToJson    //this handles any of the above file types based on file extension
```

Use the following exports to convert from a generalized JSON format back to a specific format:

```
jsonToGenbank
jsonToFasta
jsonToBed
```

## Format Specification

The generalized JSON format looks like:

```js
const generalizedJsonFormat = {
  size: 25,
  sequence: "asaasdgasdgasdgasdgasgdasgdasdgasdgasgdagasdgasdfasdfdfasdfa",
  circular: true,
  name: "pBbS8c-RFP",
  description: "",
  parts: [
    {
      name: "part 1",
      type: "CDS", //optional for parts
      id: "092j92", //Must be a unique id. If no id is provided, we'll autogenerate one for you
      start: 10, //0-based inclusive index
      end: 30, //0-based inclusive index
      strand: 1,
      notes: {}
    }
  ],
  primers: [
    {
      name: "primer 1",
      id: "092j92", //Must be a unique id. If no id is provided, we'll autogenerate one for you
      start: 10, //0-based inclusive index
      end: 30, //0-based inclusive index
      strand: 1,
      notes: {}
    }
  ],
  features: [
    {
      name: "anonymous feature",
      type: "misc_feature",
      id: "5590c1978979df000a4f02c7", //Must be a unique id. If no id is provided, we'll autogenerate one for you
      start: 1,
      end: 3,
      strand: 1,
      notes: {}
    },
    {
      name: "coding region 1",
      type: "CDS",
      id: "5590c1d88979df000a4f02f5",
      start: 12,
      end: 9,
      strand: -1,
      notes: {}
    }
  ],
  //only if parsing in an ab1 file
  chromatogramData: {
    aTrace: [], //same as cTrace but for a
    tTrace: [], //same as cTrace but for t
    gTrace: [], //same as cTrace but for g
    cTrace: [0, 0, 0, 1, 3, 5, 11, 24, 56, 68, 54, 30, 21, 3, 1, 4, 1, 0, 0, ...etc], //heights of the curve spaced 1 per x position (aka if the cTrace.length === 1000, then the max basePos can be is 1000)
    basePos: [33, 46, 55, ...etc], //x position of the bases (can be unevenly spaced)
    baseCalls: ["A", "T", ...etc],
    qualNums: [] //or undefined if no qualNums are detected on the file
  }
};
```

## Usage

### install

`npm install -S @teselagen/bio-parsers`

or

`bun add @teselagen/bio-parsers`

or

use it from a script tag:

```html
<script src="https://unpkg.com/bio-parsers/umd/bio-parsers.js"></script>
<script>
  async function main() {
    var jsonOutput = await window.bioParsers.genbankToJson(
      `LOCUS       kc2         108 bp    DNA     linear    01-NOV-2016
COMMENT             teselagen_unique_id: 581929a7bc6d3e00ac7394e8
FEATURES             Location/Qualifiers
     CDS             1..108
                     /label="GFPuv"
     misc_feature    61..108
                     /label="gly_ser_linker"
     bogus_dude      4..60
                     /label="ccmN_sig_pep"
     misc_feature    4..60
                     /label="ccmN_nterm_sig_pep"
                     /pragma="Teselagen_Part"
                     /preferred5PrimeOverhangs=""
                     /preferred3PrimeOverhangs=""
ORIGIN      
        1 atgaaggtct acggcaagga acagtttttg cggatgcgcc agagcatgtt ccccgatcgc
       61 ggtggcagtg gtagcgggag ctcgggtggc tcaggctctg ggg
//`
    );
    console.log("jsonOutput:", jsonOutput);
    var genbankString = window.bioParsers.jsonToGenbank(jsonOutput[0].parsedSequence);
    console.log(genbankString);
  }
  main();
</script>
```

see the `./umd_demo.html` file for a full working example

### jsonToGenbank (same interface as jsonToFasta)

```js
//To go from json to genbank:
import { jsonToGenbank } from "bio-parsers"
//You can pass an optional options object as the second argument. Here are the defaults
const options = {
  isProtein: false, //by default the sequence will be parsed and validated as type DNA (unless U's instead of T's are found). If isProtein=true the sequence will be parsed and validated as a PROTEIN type (seqData.isProtein === true)
  guessIfProtein: false, //if true the parser will attempt to guess if the sequence is of type DNA or type PROTEIN (this will override the isProtein flag)
  guessIfProteinOptions: {
    threshold = 0.90, //percent of characters that must be DNA letters to be considered of type DNA
    dnaLetters = ['G', 'A', 'T', 'C'] //customizable set of letters to use as DNA
  },
  inclusive1BasedStart: false //by default feature starts are parsed out as 0-based and inclusive
  inclusive1BasedEnd: false //by default feature ends are parsed out as 0-based and inclusive
  // Example:
  // 0123456
  // ATGAGAG
  // --fff--  (the feature covers GAG)
  // 0-based inclusive start:
  // feature.start = 2
  // 1-based inclusive start:
  // feature.start = 3
  // 0-based inclusive end:
  // feature.end = 4
  // 1-based inclusive end:
  // feature.end = 5
}
const genbankString = jsonToGenbank(generalizedJsonFormat, options)

```

### anyToJson (same interface as genbankToJson, fastaToJson, xxxxToJson) (async required)

```js
import { anyToJson } from "bio-parsers";

//note, anyToJson should be called using an await to allow for file parsing to occur (if a file is being passed)
const results = await anyToJson(
  stringOrFile, //if ab1 files are being passed in you should pass files only, otherwise strings or files are fine as inputs
  options //options.fileName (eg "pBad.ab1" or "pCherry.fasta") is important to pass here in order for the parser to!
);

//we always return an array of results because some files my contain multiple sequences
results[0].success; //either true or false
results[0].messages; //either an array of strings giving any warnings or errors generated during the parsing process
results[0].parsedSequence; //this will be the generalized json format as specified above :)
//chromatogram data will be here (ab1 only):
results[0].parsedSequence.chromatogramData;
```

### Options (for anyToJson or xxxxToJson)

```js
//You can pass an optional options object as the third argument. Here are the defaults
const options = {
  fileName: "example.gb", //the filename is used if none is found in the genbank
  isProtein: false, //if you know that it is a protein string being parsed you can pass true here
  parseFastaAsCircular: false; //by default fasta files are parsed as linear sequences. You can change this by setting parseFastaAsCircular=true
  //genbankToJson options only
  inclusive1BasedStart: false //by default feature starts are parsed out as 0-based and inclusive
  inclusive1BasedEnd: false //by default feature ends are parsed out as 0-based and inclusive
  acceptParts: true //by default features with a feature.notes.pragma[0] === "Teselagen_Part" are added to the sequenceData.parts array. Setting this to false will keep them as features instead
  // fastaToJson options only
  parseName: true //by default attempt to parse the name and description of sequence from the comment line. Setting this to false will keep the name unchanged with no description
}
```

### ab1ToJson

```js
import { ab1ToJson } from "bio-parsers";
const results = await ab1ToJson(
  //this can be either a browser file  <input type="file" id="input" multiple onchange="ab1ToJson(this.files[0])">
  // or a node file ab1ToJson(fs.readFileSync(path.join(__dirname, './testData/ab1/example1.ab1')));
  file,
  options //options.fileName (eg "pBad.ab1" or "pCherry.fasta") is important to pass here in order for the parser to!
);

//we always return an array of results because some files my contain multiple sequences
results[0].success; //either true or false
results[0].messages; //either an array of strings giving any warnings or errors generated during the parsing process
results[0].parsedSequence; //this will be the generalized json format as specified above :)
//chromatogram data will be here (ab1 only):
results[0].parsedSequence.chromatogramData;
```

### snapgeneToJson (.dna files)

```js
import { snapgeneToJson } from "bio-parsers";
//file can be either a browser file  <input type="file" id="input" multiple onchange="snapgeneToJson(this.files[0])">
// or a node file snapgeneToJson(fs.readFileSync(path.join(__dirname, './testData/ab1/example1.ab1')));
const results = await snapgeneToJson(file, options);
```

### genbankToJson

```js
import { genbankToJson } from "bio-parsers";

const result = genbankToJson(string, options);

console.info(result);
// [
//     {
//         "messages": [
//             "Import Error: Illegal character(s) detected and removed from sequence. Allowed characters are: atgcyrswkmbvdhn",
//             "Invalid feature end:  1384 detected for Homo sapiens and set to 1",
//         ],
//         "success": true,
//         "parsedSequence": {
//             "features": [
//                 {
//                     "notes": {
//                         "organism": [
//                             "Homo sapiens"
//                         ],
//                         "db_xref": [
//                             "taxon:9606"
//                         ],
//                         "chromosome": [
//                             "17"
//                         ],
//                         "map": [
//                             "17q21"
//                         ]
//                     },
//                     "type": "source",
//                     "strand": 1,
//                     "name": "Homo sapiens",
//                     "start": 0,
//                     "end": 1
//                 }
//             ],
//             "name": "NP_003623",
//             "sequence": "gagaggggggttatccccccttcgtcagtcgatcgtaacgtatcagcagcgcgcgagattttctggcgcagtcag",
//             "circular": true,
//             "extraLines": [
//                 "DEFINITION  contactin-associated protein 1 precursor [Homo sapiens].",
//                 "ACCESSION   NP_003623",
//                 "VERSION     NP_003623.1  GI:4505463",
//                 "DBSOURCE    REFSEQ: accession NM_003632.2",
//                 "KEYWORDS    RefSeq."
//             ],
//             "type": "DNA",
//             "size": 925
//         }
//     }
// ]
```

You can see more examples by looking at the tests.

## Updating this repo

### Outside collaborators

fork and pull request please :)

## Thanks/Collaborators

- IsaacLuo - https://github.com/IsaacLuo/SnapGeneFileReader (from which the snapgene parser was adapted)
- Joshua Nixon (original collaborator)
- Thomas Rich (original collaborator)

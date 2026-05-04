import React, { useState, useEffect, useMemo } from "react";
import { compose } from "redux";
import {
  wrapDialog,
  DialogFooter,
  DataTable,
  withSelectedEntities,
  withSelectTableRecords
} from "@teselagen/ui";
import {
  tidyUpAnnotation,
  getFeatureToColorMap
} from "@teselagen/sequence-utils";
import getImportMatches from "./utils/getImportMatches";
import {
  NumericInput,
  Tag,
  Intent,
  Tabs,
  Tab,
  Button,
  Spinner,
  Icon,
  Checkbox
} from "@blueprintjs/core";
import { startCase, forEach } from "lodash-es";
import pluralize from "pluralize";
import withEditorProps from "./withEditorProps";
import { hideDialog } from "./GlobalDialogUtils";
import { Uploader } from "@teselagen/ui";
import { anyToJson } from "@teselagen/bio-parsers";
import SimpleCircularOrLinearView from "./SimpleCircularOrLinearView";

import { MAX_MATCHES_DISPLAYED } from "./constants/findToolConstants";

const formName = "importFeaturesDialogForm";

const exampleGenbank = `LOCUS       Example_Sequence        5299 bp    DNA     circular    04-MAY-2026
FEATURES             Location/Qualifiers
     CDS             complement(7..885)
                     /label="araC"
                     /note="Imported from demo"
     CDS             1236..2018
                     /label="GFPuv"
                     /note="Imported from demo"
     misc_marker     complement(4514..5173)
                     /label="CmR"
                     /note="Imported from demo"
     misc_feature    3001..3501
                     /label="New Feature"
                     /note="This is a new feature that doesn't exist yet"
     misc_feature    121..200
                     /label="Flexible Feature 1"
                     /note="This feature has a 98% match"
     misc_feature    1561..1650
                     /label="Flexible Feature 2"
                     /note="This feature has a 99% match"
ORIGIN
        1 gacgtcttat gacaacttga cggctacatc attcactttt tcttcacaac cggcacggaa
       61 ctcgctcggg ctggccccgg tgcatttttt aaatacccgc gagaaataga gttgatcgtc
      121 aaaaccaaca ttgcgaccga cggaggcgat aggcatccgg gtggtgctca aaagcagctt
      181 cgcctggctg atacgttggt cctcgcgcca gcttaagacg ctaatcccta actgctggcg
      241 gaaaagatgt gacagacgcg acggcgacaa gcaaacatgc tgtgcgacgc tggcgatatc
      301 aaaattgctg tctgccaggt gatcgctgat gtactgacaa gcctcgcgta cccgattatc
      361 catcggtgga tggagcgact cgttaatcgc ttccatgcgc cgcagtaaca attgctcaag
      421 cagatttatc gccagcagct ccgaatagcg cccttcccct tgcccggcgt taatgatttg
      481 cccaaacagg tcgctgaaat gcggctggtg cgcttcatcc gggcgaaaga accccgtatt
      541 ggcaaatatt gacggccagt taagccattc atgccagtag gcgcgcggac gaaagtaaac
      601 ccactggtga taccattcgc gagcctccgg atgacgaccg tagtgatgaa tctctcctgg
      661 cgggaacagc aaaatatcac ccggtcggca aacaaattct cgtccctgat ttttcaccac
      721 cccctgaccg cgaatggtga gattgagaat ataacctttc attcccagcg gtcggtcgat
      781 aaaaaaatcg agataaccgt tggcctcaat cggcgttaaa cccgccacca gatgggcatt
      841 aaacgagtat cccggcagca ggggatcatt ttgcgcttca gccatacttt tcatactccc
      901 gccattcaga gaagaaacca attgtccata ttgcatcaga cattgccgtc actgcgtctt
      961 ttactggctc ttctcgctaa ccaaaccggt aaccccgctt attaaaagca ttctgtaaca
     1021 aagcgggacc aaagccatga caaaaacgcg taacaaaagt gtctataatc acggcagaaa
     1081 agtccacatt gattatttgc acggcgtcac actttgctat gccatagcat ttttatccat
     1141 aagattagcg gattctacct gacgcttttt atcgcaactc tctactgttt ctccataccc
     1201 gtttttttgg gaatttttaa gaaggagata tacatatgag taaaggagaa gaacttttca
     1261 ctggagttgt cccaattctt gttgaattag atggtgatgt taatgggcac aaattttctg
     1321 tcagtggaga gggtgaaggt gatgcaacat acggaaaact tacccttaaa tttatttgca
     1381 ctactggaaa actacctgtt ccatggccaa cacttgtcac tactttctct tatggtgttc
     1441 aatgcttttc ccgttatccg gatcatatga aacggcatga ctttttcaag agtgccatgc
     1501 ccgaaggtta tgtacaggaa cgcactatat ctttcaaaga tgacgggaac tacaagacgc
     1561 gtgctgaagt caagtttgaa ggtgataccc ttgttaatcg gatcgagtta aaaggtattg
     1621 attttaaaga agatggaaac attctcggac acaaactcga atacaactat aactcacaca
     1681 atgtatacat cacggcagac aaacaaaaga atggaatcaa agctaacttc aaaattcgcc
     1741 acaacattga agatggatct gttcaactag cagaccatta tcaacaaaat actccaattg
     1801 gcgatggccc tgtcctttta ccagacaacc attacctgtc gacacaatct gccctttcga
     1861 aagatcccaa cgaaaagcgt gaccacatgg tccttcttga gtttgtaact gctgctggga
     1921 ttacacatgg catggatgag ctcggcggcg gcggcagcaa ggtctacggc aaggaacagt
     1981 ttttgcggat gcgccagagc atgttccccg atcgctaaat cgagtaagga tctccaggca
     2041 tcaaataaaa cgaaaggctc agtcgaaaga ctgggccttt cgttttatct gttgtttgtc
     2101 ggtgaacgct ctctactaga gtcacactgg ctcaccttcg ggtgggcctt tctgcgttta
     2161 tacctagggt acgggttttg ctgcccgcaa acgggctgtt ctggtgttgc tagtttgtta
     2221 tcagaatcgc agatccggct tcagccggtt tgccggctga aagcgctatt tcttccagaa
     2281 ttgccatgat tttttcccca cgggaggcgt cactggctcc cgtgttgtcg gcagctttga
     2341 ttcgataagc agcatcgcct gtttcaggct gtctatgtgt gactgttgag ctgtaacaag
     2401 ttgtctcagg tgttcaattt catgttctag ttgctttgtt ttactggttt cacctgttct
     2461 attaggtgtt acatgctgtt catctgttac attgtcgatc tgttcatggt gaacagcttt
     2521 gaatgcacca aaaactcgta aaagctctga tgtatctatc ttttttacac cgttttcatc
     2581 tgtgcatatg gacagttttc cctttgatat gtaacggtga acagttgttc tacttttgtt
     2641 tgttagtctt gatgcttcac tgatagatac aagagccata agaacctcag atccttccgt
     2701 atttagccag tatgttctct agtgtggttc gttgtttttg cgtgagccat gagaacgaac
     2761 cattgagatc atacttactt tgcatgtcac tcaaaaattt tgcctcaaaa ctggtgagct
     2821 gaatttttgc agttaaagca tcgtgtagtg tttttcttag tccgttatgt aggtaggaat
     2881 ctgatgtaat ggttgttggt attttgtcac cattcatttt tatctggttg ttctcaagtt
     2941 cggttacgag atccatttgt ctatctagtt caacttggaa aatcaacgta tcagtcgggc
     3001 ggcctcgctt atcaaccacc aatttcatat tgctgtaagt gtttaaatct ttacttattg
     3061 gtttcaaaac ccattggtta agccttttaa actcatggta gttattttca agcattaaca
     3121 tgaacttaaa ttcatcaagg ctaatctcta tatttgcctt gtgagttttc ttttgtgtta
     3181 gttcttttaa taaccactca taaatcctca tagagtattt gttttcaaaa gacttaacat
     3241 gttccagatt atattttatg aattttttta actggaaaag ataaggcaat atctcttcac
     3301 taaaaactaa ttctaatttt tcgcttgaga acttggcata gtttgtccac tggaaaatct
     3361 caaagccttt aaccaaagga ttcctgattt ccacagttct cgtcatcagc tctctggttg
     3421 ctttagctaa tacaccataa gcattttccc tactgatgtt catcatctga gcgtattggt
     3481 tataagtgaa cgataccgtc cgttctttcc ttgtagggtt ttcaatcgtg gggttgagta
     3541 gtgccacaca gcataaaatt agcttggttt catgctccgt taagtcatag cgactaatcg
     3601 ctagttcatt tgctttgaaa acaactaatt cagacataca tctcaattgg tctaggtgat
     3661 tttaatcact ataccaattg agatgggcta gtcaatgata attactagtc cttttcccgg
     3721 gtgatctggg tatctgtaaa ttctgctaga cctttgctgg aaaacttgta aattctgcta
     3781 gaccctctgt aaattccgct agacctttgt gtgttttttt tgtttatatt caagtggtta
     3841 taatttatag aataaagaaa gaataaaaaa agataaaaag aatagatccc agccctgtgt
     3901 ataactcact actttagtca gttccgcagt attacaaaag gatgtcgcaa acgctgtttg
     3961 ctcctctaca aaacagacct taaaacccta aaggcttaag tagcaccctc gcaagctcgg
     4021 gcaaatcgct gaatattcct tttgtctccg accatcaggc acctgagtcg ctgtcttttt
     4081 cgtgacattc agttcgctgc gctcacggct ctggcagtga atgggggtaa atggcactac
     4141 aggcgccttt tatggattca tgcaaggaaa ctacccataa tacaagaaaa gcccgtcacg
     4201 ggcttctcag ggcgttttat ggcgggtctg ctatgtggtg ctatctgact ttttgctgtt
     4261 cagcagttcc tgccctctga ttttccagtc tgaccacttc ggattatccc gtgacaggtc
     4321 attcagactg gctaatgcac ccagtaaggc agcggtatca tcaacaggct tacccgtctt
     4381 actgtcccta gtgcttggat tctcaccaat aaaaaacgcc cggcggcaac cgagcgttct
     4441 gaacaaatcc agatggagtt ctgaggtcat tactggatct atcaacagga gtccaagcga
     4501 gctcgatatc aaattacgcc ccgccctgcc actcatcgca gtactgttgt aattcattaa
     4561 gcattctgcc gacatggaag ccatcacaaa cggcatgatg aacctgaatc gccagcggca
     4621 tcagcacctt gtcgccttgc gtataatatt tgcccatggt gaaaacgggg gcgaagaagt
     4681 tgtccatatt ggccacgttt aaatcaaaac tggtgaaact cacccaggga ttggctgaga
     4741 cgaaaaacat attctcaata aaccctttag ggaaataggc caggttttca ccgtaacacg
     4801 ccacatcttg cgaatatatg tgtagaaact gccggaaatc gtcgtggtat tcactccaga
     4861 gcgatgaaaa cgtttcagtt tgctcatgga aaacggtgta acaagggtga acactatccc
     4921 atatcaccag ctcaccgtct ttcattgcca tacgaaattc cggatgagca ttcatcaggc
     4981 gggcaagaat gtgaataaag gccggataaa acttgtgctt atttttcttt acggtcttta
     5041 aaaaggccgt aatatccagc tgaacggtct ggttataggt acattgagca actgactgaa
     5101 atgcctcaaa atgttcttta cgatgccatt gggatatatc aacggtggta tatccagtga
     5161 tttttttctc cattttagct tccttagctcctgaaaatct cgataactca aaaaatacgc
     5221 ccggtagtga tcttatttca ttatggtgaa agttggaacc tcttacgtgc cgatcaacgt
     5281 ctcattttcg ccagatatc
//
`;

const typeColors = getFeatureToColorMap();

export const ImportFeaturesDialog = compose(
  withEditorProps,
  withSelectedEntities(formName),
  withSelectTableRecords(formName)
)(function ImportFeaturesDialog(props) {
  const {
    sequenceData: destinationSequenceData,
    upsertFeature,
    upsertPart,
    upsertPrimer,
    annotationVisibilityShow,
    selectTableRecords,
    step,
    setStep
  } = props;

  const [isFlexible, setIsFlexible] = useState(props.isFlexible || false);
  const [matchThreshold, setMatchThreshold] = useState(
    props.matchThreshold || 96
  );
  const [minImportSize, setMinImportSize] = useState(20);
  const [selectedTab, setSelectedTab] = useState("new");
  const [sourceSequences, setSourceSequences] = useState(
    props.sourceSequences || []
  );
  const [isParsing, setIsParsing] = useState(false);
  const [showExistingFeatures, setShowExistingFeatures] = useState(false);
  const [previewAnnotation, setPreviewAnnotation] = useState(null);

  const { newAnnotations, duplicateAnnotations } = useMemo(
    () =>
      getImportMatches({
        sourceSequences,
        destinationSequenceData,
        isFlexible,
        matchThreshold,
        minImportSize
      }),
    [
      sourceSequences,
      destinationSequenceData,
      isFlexible,
      matchThreshold,
      minImportSize
    ]
  );

  const rawSelectedEntities = props[formName + "SelectedEntities"];
  const selectedEntities = useMemo(
    () => rawSelectedEntities || [],
    [rawSelectedEntities]
  );

  const previewSequenceData = useMemo(() => {
    if (!destinationSequenceData) return null;
    const seqData = { ...destinationSequenceData };
    if (!showExistingFeatures) {
      seqData.features = [];
      seqData.parts = [];
      seqData.primers = [];
      delete seqData.filteredFeatures;
      delete seqData.filteredParts;
      delete seqData.filteredPrimers;
      delete seqData.cutsites;
      delete seqData.orfs;
      delete seqData.translations;
    }
    // Add selected entities as temporary features for preview
    selectedEntities.forEach(ann => {
      if (!ann.annotationType) return;
      const type = pluralize(ann.annotationType);
      const existing = Array.isArray(seqData[type]) ? seqData[type] : [];
      seqData[type] = [
        ...existing,
        {
          ...ann,
          id: `preview-${ann.id}`,
          color:
            ann.annotationType === "feature"
              ? typeColors[ann.type] || typeColors.misc_feature || "#7f8c8d"
              : undefined
        }
      ];
    });
    return seqData;
  }, [destinationSequenceData, showExistingFeatures, selectedEntities]);
  useEffect(() => {
    selectTableRecords(newAnnotations);
  }, [newAnnotations, selectTableRecords]);

  const schema = [
    {
      path: "name",
      type: "string"
    },
    {
      path: "sourceName",
      displayName: "Source",
      type: "string"
    },
    {
      path: "annotationType",
      type: "string",
      render: val => startCase(val)
    },
    {
      path: "type",
      type: "string",
      render: (val, record) => {
        if (record.annotationType !== "feature") return "";
        const color = typeColors[val] || typeColors.misc_feature || "#7f8c8d";
        return (
          <Tag
            minimal
            style={{
              color: "white",
              background: color,
              fontWeight: 600,
              fontSize: 11
            }}
          >
            {val}
          </Tag>
        );
      }
    },
    {
      path: "forward",
      displayName: "Strand",
      type: "boolean",
      render: val => (
        <div
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "var(--base3)",
            display: "flex",
            justifyContent: "center"
          }}
        >
          {val ? "→" : "←"}
        </div>
      )
    },

    {
      path: "range",
      type: "string",
      render: (val, record) => `${record.start + 1}-${record.end + 1}`
    },
    {
      path: "matchPercent",
      type: "number",
      displayName: "Match",
      render: val => (
        <Tag
          minimal={val < 100}
          intent={val === 100 ? Intent.SUCCESS : Intent.WARNING}
        >
          {val}%
        </Tag>
      )
    },
    {
      path: "numMismatches",
      type: "number",
      displayName: "Mismatches"
    }
  ];

  const handleImport = () => {
    selectedEntities.forEach((ann, i) => {
      const annotationTypePlural = pluralize(ann.annotationType);
      const upsertFn =
        ann.annotationType === "feature"
          ? upsertFeature
          : ann.annotationType === "part"
            ? upsertPart
            : upsertPrimer;

      let conditionals = {};
      if (selectedEntities.length > 1) {
        if (i === 0) {
          conditionals = { batchUndoStart: true };
        } else if (i === selectedEntities.length - 1) {
          conditionals = { batchUndoEnd: true };
        } else {
          conditionals = { batchUndoMiddle: true };
        }
      }

      upsertFn(
        tidyUpAnnotation(ann, {
          sequenceData: destinationSequenceData,
          annotationType: annotationTypePlural
        }),
        conditionals
      );
      annotationVisibilityShow(annotationTypePlural);
    });

    hideDialog();
  };

  const [fileList, setFileList] = useState([]);

  if (step === 0) {
    return (
      <div className="bp3-dialog-body">
        <Uploader
          multiple
          showUploadList={false}
          fileList={fileList}
          onChange={async files => {
            setFileList(files);
            const filesToParse = files.filter(f => !f.loading && !f.parsed);
            if (filesToParse.length > 0) {
              setIsParsing(true);
              try {
                const newSeqs = [];
                for (const file of filesToParse) {
                  file.parsed = true;
                  const results = await anyToJson(file.originFileObj || file, {
                    fileName: file.name
                  });
                  if (results) {
                    forEach(results, result => {
                      if (result.success) {
                        newSeqs.push(result.parsedSequence);
                      }
                    });
                  }
                }
                setSourceSequences(prev => [...prev, ...newSeqs]);
              } catch (e) {
                console.error(`Error parsing files:`, e);
                window.toastr.error("Error parsing one or more files.");
              } finally {
                setIsParsing(false);
              }
            }
          }}
          innerText="Click or drag to upload source sequences (.gb, .fa, .snapgene, etc)"
        />

        {sourceSequences.length > 0 && (
          <div
            style={{
              marginTop: 20,
              padding: "16px",
              borderRadius: 12,
              border: "1px dashed var(--base3)"
            }}
          >
            <h5
              style={{
                marginTop: 0,
                marginBottom: 12,
                color: "var(--reversed)",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Icon icon="layers" size={14} style={{ marginRight: 8 }} />
              Uploaded Sequences ({sourceSequences.length})
            </h5>
            <div style={{ maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
              {sourceSequences.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    // background: "var(--base1)",
                    borderRadius: 6,
                    marginBottom: 6,
                    border: "1px solid var(--base3)"
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--reversed)"
                    }}
                  >
                    <Icon
                      icon="document"
                      size={12}
                      style={{ marginRight: 10, color: "var(--base3)" }}
                    />
                    {s.name}
                  </span>
                  <Button
                    minimal
                    small
                    icon="cross"
                    intent="danger"
                    onClick={() => {
                      setSourceSequences(prev =>
                        prev.filter((_, j) => i !== j)
                      );
                      setFileList(prev => prev.filter((_, j) => i !== j));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {!sourceSequences.some(s => s.name === "Example_Sequence") && (
          <div style={{ marginTop: 10, textAlign: "center" }}>
            <Button
              minimal
              intent="primary"
              onClick={async () => {
                setIsParsing(true);
                try {
                  const results = await anyToJson(exampleGenbank, {
                    fileName: "example.gb"
                  });
                  if (results && results[0] && results[0].success) {
                    setSourceSequences(prev => [
                      ...prev,
                      results[0].parsedSequence
                    ]);
                  }
                } catch (e) {
                  console.error("Error parsing example:", e);
                } finally {
                  setIsParsing(false);
                }
              }}
            >
              Or use example file
            </Button>
          </div>
        )}

        {isParsing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 10,
              color: "#48aff0"
            }}
          >
            <Spinner size={20} style={{ marginRight: 10 }} />
            Parsing sequences...
          </div>
        )}
        <br></br>
        <DialogFooter
          hideModal={hideDialog}
          onClick={() => setStep(1)}
          disabled={sourceSequences.length === 0 || isParsing}
          text="Next"
        />
      </div>
    );
  }

  return (
    <div className="bp3-dialog-body">
      <style>{`
        .tg-import-features-container {
          display: flex;
          flex-wrap: nowrap;
          gap: 20px;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid var(--base3);
          margin-bottom: 20px;
        }
        .tg-import-features-left {
          flex: 1 1 50%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .tg-import-features-right {
          flex: 1 1 50%;
          border-left: 1px solid var(--base3);
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          min-height: 400px;
        }
        @media (max-width: 850px) {
          .tg-import-features-right {
            border-left: none !important;
            border-top: 1px solid var(--base3);
            padding-left: 0 !important;
            padding-top: 20px;
          }
        }
      `}</style>

      <div className="tg-import-features-container">
        <div className="tg-import-features-left">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox
              checked={isFlexible}
              onChange={e => setIsFlexible(e.target.checked)}
              style={{ marginBottom: 0 }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "var(--reversed)",
                  fontWeight: 500
                }}
              >
                Use flexible feature detection with a DNA match threshold of
              </span>
            </Checkbox>

            <NumericInput
              disabled={!isFlexible}
              style={{ width: 80 }}
              value={matchThreshold}
              onValueChange={val => setMatchThreshold(val)}
              min={1}
              max={100}
              rightElement={
                <div
                  style={{
                    padding: "6px 8px",
                    fontSize: 12,
                    color: "var(--base3)",
                    fontWeight: 600
                  }}
                >
                  %
                </div>
              }
            />
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "4px 12px",
                // background: "var(--base2)",
                borderRadius: 8,
                border: "1px solid var(--base3)"
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--reversed)",
                  fontSize: 13
                }}
              >
                Min Feature Size:
              </div>
              <NumericInput
                style={{ width: 70 }}
                value={minImportSize}
                onValueChange={val => setMinImportSize(val)}
                min={1}
                max={1000}
              />
              <div style={{ fontSize: 11, color: "var(--base3)" }}>bps</div>
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--base3)",
              display: "flex",
              alignItems: "center",
              padding: "4px 10px",
              // background: "var(--base2)",
              borderRadius: 20,
              border: "1px solid var(--base3)"
            }}
          >
            <Tag
              round
              minimal
              intent={newAnnotations.length > 0 ? "success" : "none"}
              style={{ fontWeight: 600, marginRight: 8 }}
            >
              {newAnnotations.length}
            </Tag>
            <span style={{ whiteSpace: "nowrap" }}>
              {pluralize("new match", newAnnotations.length)} from{" "}
              <b style={{ color: "var(--reversed)" }}>
                {sourceSequences.length}
              </b>{" "}
              {pluralize("sequence", sourceSequences.length)}
              {newAnnotations.length + duplicateAnnotations.length >=
                MAX_MATCHES_DISPLAYED && (
                <span style={{ color: Intent.DANGER, marginLeft: 10 }}>
                  (Capped at {MAX_MATCHES_DISPLAYED})
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="tg-import-features-right">
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--base3)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 10,
              textAlign: "center"
            }}
          >
            Feature Preview
          </div>
          {previewSequenceData && (
            <div style={{ flex: 1, position: "relative" }}>
              <SimpleCircularOrLinearView
                sequenceData={previewSequenceData}
                annotationVisibility={{
                  features: true,
                  parts: false,
                  cutsites: false,
                  primers: false
                }}
                withVisibilityOptions
                // minimalPreviewTypeBtns
                withFullscreen
                withChoosePreviewType
                selectionLayer={
                  previewAnnotation
                    ? {
                        start: previewAnnotation.start,
                        end: previewAnnotation.end
                      }
                    : undefined
                }
              />
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 10
            }}
          >
            <Checkbox
              checked={showExistingFeatures}
              onChange={e => setShowExistingFeatures(e.target.checked)}
              style={{ marginBottom: 0 }}
            >
              <span style={{ fontSize: 12, color: "var(--base3)" }}>
                Show existing features
              </span>
            </Checkbox>
          </div>
        </div>
      </div>

      <Tabs
        id="ImportTabs"
        selectedTabId={selectedTab}
        onChange={setSelectedTab}
        renderActiveTabPanelOnly
      >
        <Tab
          id="new"
          title={`New (${newAnnotations.length})`}
          panel={
            <DataTable
              isInfinite
              noPadding
              noExcessiveCheck
              formName={formName}
              entities={newAnnotations}
              withCheckboxes
              schema={schema}
              noRouter
              onRowClick={record => setPreviewAnnotation(record)}
              currentRowId={previewAnnotation && previewAnnotation.id}
            />
          }
        />
        <Tab
          id="duplicates"
          title={`Duplicates (${duplicateAnnotations.length})`}
          panel={
            <DataTable
              isInfinite
              formName={formName}
              entities={duplicateAnnotations}
              withCheckboxes
              schema={schema}
              noRouter
              onRowClick={record => setPreviewAnnotation(record)}
              currentRowId={previewAnnotation && previewAnnotation.id}
            />
          }
        />
      </Tabs>

      <DialogFooter
        hideModal={hideDialog}
        secondaryText="Back"
        secondaryAction={() => setStep(0)}
        onClick={handleImport}
        disabled={selectedEntities.length === 0}
        text="Import Selected"
      />
    </div>
  );
});

const ImportFeaturesDialogWithDialog = wrapDialog(props => ({
  title: "Import Features from Another Sequence",
  canEscapeKeyClose: false,
  style: { width: props.step === 1 ? "min(1000px, 95vw)" : 600 }
}))(ImportFeaturesDialog);

export default function ImportFeaturesDialogWrapper(props) {
  const [step, setStep] = useState(0);
  return (
    <ImportFeaturesDialogWithDialog {...props} step={step} setStep={setStep} />
  );
}

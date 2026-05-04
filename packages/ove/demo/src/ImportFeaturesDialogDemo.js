import React, { useEffect } from "react";
import { ImportFeaturesDialogUnconnected, updateEditor } from "../../src";
import exampleSequenceData from "./exampleData/exampleSequenceData";
import store from "./store";

export default function ImportFeaturesDialogDemo() {
  useEffect(() => {
    updateEditor(store, "DemoEditor", {
      sequenceData: exampleSequenceData
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h3>ImportFeaturesDialog Demo (Debugging)</h3>
      <div style={{ display: "flex", gap: 20, flexDirection: "column" }}>
        <div style={{ border: "1px solid #ccc", padding: 10 }}>
          <h4>Page 1 (Step 0) - Upload</h4>
          <ImportFeaturesDialogUnconnected
            editorName="DemoEditor"
            step={0}
            setStep={() => {}}
          />
        </div>
        <div style={{ border: "1px solid #ccc", padding: 10 }}>
          <h4>Page 2 (Step 1) - Results</h4>
          <ImportFeaturesDialogUnconnected
            editorName="DemoEditor"
            step={1}
            sequenceData={exampleSequenceData}
            setStep={() => {}}
            isFlexible={true}
            matchThreshold={90}
            sourceSequences={[
              {
                name: "Fake Source Sequence 1",
                sequence: "gacgtcttatgacaacttgacggctacatc",
                features: [
                  {
                    name: "Fake Feature 1",
                    start: 0,
                    end: 29,
                    type: "misc_feature",
                    id: "fake1"
                  }
                ]
              },
              {
                name: "Fake Source Sequence 2",
                sequence: "atgagtaaaggagaagaacttttcactggagttgtccca",
                features: [
                  {
                    name: "Fake Feature 2",
                    start: 0,
                    end: 38,
                    type: "CDS",
                    id: "fake2"
                  }
                ]
              },
              {
                name: "Fake Source Sequence 3",
                sequence:
                  "tttaaaaaggccgtaatatccagctgaacggtctggttataggtacattgagcaactgactgaa",
                features: [
                  {
                    name: "Fake Feature 3",
                    start: 0,
                    end: 63,
                    type: "promoter",
                    id: "fake3"
                  }
                ]
              },
              {
                name: "Flexible Match Source",
                sequence: "gacgtcttatgacaacttgacggctacatcattcactttttcAAt", // 2 mismatches at end
                features: [
                  {
                    name: "Flexible Feature",
                    start: 0,
                    end: 44,
                    type: "misc_feature",
                    id: "flex1"
                  }
                ]
              },
              {
                name: "Duplicate Source",
                sequence: "gacgtcttatgacaacttgacggctacatcattcactttttcttc", // Matches start of example
                features: [
                  {
                    name: "araC", // Existing feature in example
                    start: 6,
                    end: 884,
                    type: "CDS",
                    id: "dup1"
                  }
                ]
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

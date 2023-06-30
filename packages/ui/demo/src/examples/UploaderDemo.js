import React from "react";
import Uploader from "../../../src/FormComponents/Uploader";
import DemoWrapper from "../DemoWrapper";
import OptionsSection from "../OptionsSection";
import { useToggle } from "../useToggle";

export default function UploaderDemo() {
  const [disabled, disabledToggleComp] = useToggle({
    type: "disabled"
  });
  const [advancedAccept, advancedAcceptToggleComp] = useToggle({
    type: "accept",
    label: "Toggle Advance Accept"
  });
  // const [advancedAccept, advancedAcceptToggleComp] = useToggle({
  //   type: "accept",
  //   label: "Toggle Advance Accept"
  // });
  return (
    <div>
      <OptionsSection>
        {disabledToggleComp}
        {advancedAcceptToggleComp}
      </OptionsSection>
      <DemoWrapper>
        <Uploader
          accept={
            advancedAccept
              ? [
                  {
                    type: "ab1",
                    description: "Sequence Trace Format",
                    exampleFiles: [
                      { description: "Download File 1", exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json" },
                      { description: "View File 2", icon: 'link', exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json" }
                    ]
                  },
                  {
                    type: "dna",
                    description: "SnapGene DNA Format I'm a superrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrrsuperrrrrrrrrrr long message",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  },
                  {
                    type: "template",
                    isTemplate: true,
                    description: "I'm a template file",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  },
                  {
                    type: "json",
                    description: "TeselaGen JSON Format",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  },
                  {
                    type: ["fasta", "fas", "fa", "fna", "ffn", "txt"],
                    description: "Fasta Format",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  },
                  {
                    type: ["csv", "xlsx"],
                    description: "TeselaGen CSV Format",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  },
                  {
                    type: ["gb", "gbk", "txt"],
                    description: "Genbank Format",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  },
                  {
                    type: ["gp", "genpep", "txt"],
                    description: "Genbank Protein Format",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  },
                  {
                    type: ["xml", "rdf"],
                    description: "SBOL XML Format",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  },
                  {
                    type: ".dna",
                    description: "SnapGene DNA File",
                    exampleFile: "https://teselagen.github.io/json-schema-viewer/#/view/%23?url=.%2Fschemas%2Fdesign.json"
                  }
                ]
              : ["gb", "gp"]
          }
          onChange={() => {
            window.toastr.success("File uploaded!");
          }}
          disabled={disabled}
        />
      </DemoWrapper>
    </div>
  );
}

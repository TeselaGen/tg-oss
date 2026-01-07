import { Chance } from "chance";
import { times } from "lodash-es";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import DataTable from "../../../src/DataTable";
import DemoWrapper from "../DemoWrapper";
import { Classes, Dialog } from "@blueprintjs/core";
import { DialogFooter, SelectField } from "@teselagen/ui";
import { reduxForm } from "redux-form";

const chance = new Chance();

// 1. Define a list of mock materials
const materialOptions = [
  "Plasmid-pBR322", "Genomic-E-coli", "Primer-M13F", "Enzyme-BsaI",
  "Buffer-CutSmart", "DNA-Ladder-1kb", "RNA-Polymerase", "Ligase-T4",
  "dNTP-Mix", "PCR-Master-Mix", "SYBR-Green", "Loading-Dye",
  "Proteinase-K", "RNase-A", "Ethanol-70", "Isopropanol",
  "HEPES-Buffer", "Tris-EDTA", "Agarose-Powder", "Ethidium-Bromide"
];

// 2. Update the generator to assign a different material to each row
const getEnts = num =>
  times(num).map(i => {
    const linkedMaterial = materialOptions[i % materialOptions.length];
    return {
      id: nanoid(),
      sampleName: linkedMaterial,
      aliquotType: "sample-aliquot",
      // Use modulo to cycle through materials so each row is unique
      linkedMaterial,
      isDry: false,
      volume: "",
      concentration: ""
    };
  });

function EditableCellTable(props) {
  const [entities] = useState(getEnts(20));
  
  const [volUnit, setVolUnit] = useState("uL");
  const [measureType, setMeasureType] = useState("Concentration");
  const [concUnit, setConcUnit] = useState("ng/uL");

  const schema = useMemo(
    () => ({
      fields: [
        {
          path: "sampleName",
          displayName: "Aliquot Name",
          isRequired: true
        },
        // 3. The Searchable Dropdown Schema
        {
          path: "linkedMaterial",
          displayName: "Linked Material",
          type: "dropdown",
          values: materialOptions,
          placeholder: "Search materials..."
        },
        {
          path: "aliquotType",
          displayName: "Aliquot Type",
          type: "dropdown",
          values: ["sample-aliquot", "reagent-aliquot"]
        },
        {
          path: "isDry",
          displayName: "Dry Aliquot",
          type: "boolean"
        },
        {
          path: "volume",
          displayName: `Volume (${volUnit})`,
          type: "number",
          isRequired: true
        },
        {
          path: "concentration",
          displayName: measureType === "Concentration" ? `Conc (${concUnit})` : `Molarity (${concUnit})`,
          type: "number"
        }
      ]
    }),
    [volUnit, measureType, concUnit]
  );

  return (
    <div>
      <DemoWrapper>
        <Dialog 
          title="Bulk Create Aliquots" 
          isOpen={true} 
          style={{ width: "90vw", height: "85vh" }}
        >
          <div className={Classes.DIALOG_BODY}>
            <div style={{ 
              display: "flex", 
              gap: "20px", 
              padding: "10px", 
              marginBottom: "15px",
              alignItems: "flex-end"
            }}>
              <SelectField
                label="Volume Unit"
                name="volumeUnit"
                inlineLabel
                options={["uL", "mL", "nL"]}
                onFieldSubmit={(v) => setVolUnit(v)}
                defaultValue={volUnit}
              />
              <SelectField
                label="Measurement Type"
                name="measurementType"
                inlineLabel
                options={["Concentration", "Molarity"]}
                onFieldSubmit={(v) => setMeasureType(v)}
                defaultValue={measureType}
              />
              <SelectField
                label="Concentration Unit"
                name="concUnit"
                inlineLabel
                options={measureType === "Concentration" ? ["ng/uL", "ug/uL"] : ["nM", "uM"]}
                onFieldSubmit={(v) => setConcUnit(v)}
                defaultValue={concUnit}
              />
            </div>

            <DataTable
              {...props}
              formName="aliquotBulkTable"
              isSimple
              isCellEditable
              entities={entities}
              schema={schema}
              maxHeight={400}
            />
          </div>
          <DialogFooter 
            secondaryText="Cancel" 
            text="Create 15 Aliquots"
          />
        </Dialog>
      </DemoWrapper>
    </div>
  );
}

export default reduxForm({
  form: "aliquotBulkTable"
})(EditableCellTable);
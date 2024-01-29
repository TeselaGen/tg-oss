import { Chance } from "chance";
import { times } from "lodash";
import { nanoid } from "nanoid";
import React, { useMemo, useRef, useState } from "react";
import DataTable from "../../../src/DataTable";
import DemoWrapper from "../DemoWrapper";
import { useToggle } from "../useToggle";
import OptionsSection from "../OptionsSection";
import { toNumber } from "lodash";

const chance = new Chance();
function getEnts(num) {
  return times(num).map(i => {
    return {
      name:
        i < 20
          ? "Tom" + (88 + i) + (i % 5 !== 0 ? " a" : "")
          : i < 25
            ? "Nancy" + (88 + i)
            : chance.name(),
      id: nanoid(),
      type:
        i === 0
          ? "fail"
          : i === 1 || i === 22
            ? "too old"
            : chance.pickone(["new", "old"]),
      howMany:
        i === 0 ? "fail" : i === 1 ? "15" : chance.pickone(["3", 40, 2, 5]),
      isProtein: true,
      weather:
        i === 0 ? "WAY TOO HOT" : chance.pickone(["rainy", "cloudy", "HOT"])
    };
  });
}

export default function SimpleTable(p) {
  const key = useRef(0);
  const [, numComp] = useToggle({
    type: "num",
    label: "Number of Entities",
    isSelect: true,
    defaultValue: 50,
    hook: v => {
      key.current++;
      setEnts(getEnts(toNumber(v)));
    },
    options: [20, 50, 100]
  });
  const [defaultValAsFunc, defaultValAsFuncComp] = useToggle({
    type: "defaultValAsFunc"
  });
  const [allowFormulas, allowFormulasComp] = useToggle({
    type: "allowFormulas"
  });
  const [entities, setEnts] = useState([]);
  const schema = useMemo(() => {
    return {
      fields: [
        {
          path: "name",
          validate: newVal => {
            if (!newVal || !newVal.includes("a"))
              return "Must include the letter 'a'";
          },
          format: newVal => {
            return newVal?.toLowerCase?.();
          },
          allowFormulas
        },
        {
          path: "type",
          type: "dropdown",
          isRequired: true,
          values: ["old", "new"]
        },
        {
          path: "tags",
          type: "dropdownMulti",
          isRequired: true,
          values: ["tag1", "tag2", "color:blue", "color:red", "color:green"]
        },
        {
          path: "weather",
          //should auto validate against list of accepted values, should auto format to try to coerce input values into accepted
          type: "dropdown",
          description: "What it's like outside",
          defaultValue: "sunny",
          values: ["cloudy", "rainy", "sunny", "overcast"]
        },
        {
          path: "howMany",
          //should auto validate to make sure the type is number, should auto format (I think this already works..) to try to coerce input values into accepted
          type: "number",
          defaultValue: defaultValAsFunc ? () => 4 : 1,
          //should be able to pass additional validation/formatting
          validate: newVal => {
            if (newVal > 20) return "This val is toooo high";
          },
          format: newVal => {
            return toNumber(newVal) + 1;
          }
        },
        {
          path: "isProtein",
          //should auto validate to coerce Yes -> true "true"->true, should auto format to try to coerce input values into accepted
          type: "boolean",
          defaultValue: true
        }
      ]
    };
  }, [defaultValAsFunc, allowFormulas]);
  return (
    <div>
      <OptionsSection>
        {numComp}
        {defaultValAsFuncComp}
        {allowFormulasComp}
        {/* {tagValuesAsObjectsComp} */}
      </OptionsSection>
      <DemoWrapper>
        <DataTable
          allowFormulas={allowFormulas}
          key={key.current}
          formName="editableCellTable"
          isSimple
          isCellEditable
          entities={entities}
          schema={schema}
          // isEntityDisabled={
          //   isEntityDisabled
          //     ? ent => ent.name === "chris" || ent.name === "sam"
          //     : undefined
          // }
          {...p}
        ></DataTable>
      </DemoWrapper>
    </div>
  );
}

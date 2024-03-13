import React, { useMemo, useRef, useState } from "react";
import DataTable from "../../../src/DataTable";
import DemoWrapper from "../DemoWrapper";
import { useToggle } from "../useToggle";
import OptionsSection from "../OptionsSection";
import { nanoid } from "nanoid";
import { map } from "lodash";
import { getColLetFromIndex } from "../../../src/DataTable/editCellHelper";

export default function SimpleTable(p) {
  const key = useRef(0);
  const [simpleCircularLoop, simpleCircularLoopComp] = useToggle({
    type: "simpleCircularLoop"
  });
  const [manyColumns, manyColumnsComp] = useToggle({
    type: "manyColumns"
  });
  const [simpleRangeExample, simpleRangeExampleComp] = useToggle({
    type: "simpleRangeExample"
  });
  const [entities, _setEnts] = useState([]);
  const setEnts = ents => {
    _setEnts(ents.map(e => ({ id: nanoid(), ...e })));
  };
  const schema = useMemo(() => {
    key.current++;
    if (simpleCircularLoop) {
      setEnts([
        {
          a: "=sum(b1,a2)",
          b: 44
        },
        {
          a: "=sum(b1,b2,a1)",
          b: 44
        }
      ]);
      return {
        fields: [
          { path: "a", allowFormulas: true },
          { path: "b", allowFormulas: true }
        ]
      };
    }
    if (manyColumns) {
      setEnts([
        {
          a: "=sum(cc1:cc3)",
          b: 44,
          cc: 87
        },
        {
          a: "=sum(b1,b2,a1)",
          b: 44,
          aa: 42,
          cc: 88
        },
        {
          a: "=sum(1:1)",
          aa: 42,
          cc: 89
        },
        {
          a: "=sum(aa:aa)",
          aa: 42,
          cc: 89
        },
        ...map(new Array(40), () => {
          return {
            a: "=sum(B:B)",
            b: 12,
            c: 13
          };
        })
      ]);
      return {
        fields: [
          ...map(new Array(100), (v, i) => ({
            path: getColLetFromIndex(i).toLowerCase(),
            allowFormulas: true
          }))
        ]
      };
    }
    if (simpleRangeExample) {
      setEnts([
        {
          a: "=sum(b1:b3)",
          b: 44
        },
        {
          a: "=sum(B:B)",
          b: 44
        },
        {
          a: "=sum(2:2)",
          b: 44
        }
      ]);
      return {
        fields: [
          { path: "a", allowFormulas: true },
          { path: "b", allowFormulas: true },
          { path: "c", allowFormulas: true }
        ]
      };
    }
    setEnts([
      {
        "Thing 1": "=sum(b1,a2)",
        thing2: 44
      },
      {
        "Thing 1": "=sum(b1,c1)",
        thing2: 44,
        c: "=e1"
      }
    ]);

    return {
      fields: [
        { path: "Thing 1", allowFormulas: true },
        { path: "thing2", allowFormulas: true },
        { path: "c", allowFormulas: true },
        { path: "d", allowFormulas: true },
        { path: "e", allowFormulas: true }
      ]
    };
  }, [simpleCircularLoop, manyColumns, simpleRangeExample]);
  return (
    <div>
      {/* <ExcelCell></ExcelCell> */}
      <OptionsSection>
        {simpleCircularLoopComp}
        {manyColumnsComp}
        {simpleRangeExampleComp}
      </OptionsSection>
      <DemoWrapper>
        <DataTable
          allowFormulas={true}
          key={key.current}
          formName="excelTable"
          isSimple
          isCellEditable
          entities={entities}
          initialEntities={entities}
          schema={schema}
          {...p}
        ></DataTable>
      </DemoWrapper>
    </div>
  );
}

import React from "react";
import { Button, Icon, Popover, RadioGroup } from "@blueprintjs/core";

import {
  idtAllawi1997Tm,
  rnaXia1998Tm,
  breslauer1986Tm,
  nebSantaLucia1998Tm
} from "@teselagen/sequence-utils";

import { isNumber, isString } from "lodash-es";
import { popoverOverflowModifiers } from "@teselagen/ui";
import useTmType from "../utils/useTmType";

const tmCalculators = {
  idtAllawi1997Tm,
  rnaXia1998Tm,
  breslauer1986Tm,
  nebSantaLucia1998Tm
};
export default function MeltingTemp({
  sequence,
  WrapperToUse = p => <div>{p.children}</div>,
  InnerWrapper = p => (
    <Button minimal small>
      {p.children}
    </Button>
  )
}) {
  const [primerConc /* , setPrimerConcentration */] = React.useState(0.0000005);
  const [monovalentCationConc /* , setMonovalentCationConc */] =
    React.useState(0.05);
  const [tmType, setTmType] = useTmType("breslauer1986Tm");
  const calculator = tmCalculators[tmType] || tmCalculators.breslauer1986Tm;
  const seq = sequence || "";
  let tm =
    seq.length > 5
      ? calculator(seq, {
          monovalentCationConc,
          primerConc
        })
      : 0;
  if (isNumber(tm)) {
    tm = tm.toFixed(1);
  }
  const hasWarning = isString(tm) && tm.length > 7 && tm;
  return (
    <WrapperToUse dataTest="veStatusBar-selection-tm">
      <Popover
        modifiers={popoverOverflowModifiers}
        content={
          <div style={{ maxWidth: 300, padding: 20 }}>
            Using Tm calculations based on these{" "}
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://github.com/TeselaGen/tg-oss/blob/master/packages/sequence-utils/src/calculateNebTm.js"
            >
              algorithms
            </a>
            <br></br>
            <br></br>
            <RadioGroup
              label="Choose Tm Type:"
              options={[
                { value: "idtAllawi1997Tm", label: "IDT Allawi (1997)" },
                { value: "rnaXia1998Tm", label: "RNA Xia (1998)" },
                {
                  value: "breslauer1986Tm",
                  label: "Default Tm (Breslauer et al., 1986)"
                },
                {
                  value: "nebSantaLucia1998Tm",
                  label: "NEB Tm (SantaLucia, 1998)"
                }
              ]}
              onChange={e => setTmType(e.target.value)}
              selectedValue={tmType}
            ></RadioGroup>
            {hasWarning && (
              <div>
                <Icon
                  style={{ marginLeft: 5, marginRight: 5 }}
                  size={10}
                  icon="warning-sign"
                ></Icon>
                {hasWarning}
                <br></br>
                <br></br>
                Try using the Default Tm
              </div>
            )}
          </div>
        }
      >
        <React.Fragment>
          <InnerWrapper>Melting Temp: {Number(tm) || 0} </InnerWrapper>
          {hasWarning && (
            <Icon
              style={{ marginLeft: 5, marginRight: 5 }}
              size={10}
              icon="warning-sign"
            ></Icon>
          )}
        </React.Fragment>
      </Popover>
    </WrapperToUse>
  );
}

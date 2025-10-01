import React from "react";
import { Button, Icon, Popover, RadioGroup } from "@blueprintjs/core";

import { calculateTm, calculateNebTm } from "@teselagen-biotech/sequence-utils";

import { isNumber, isString } from "lodash-es";
import { popoverOverflowModifiers } from "@teselagen-biotech/ui";
import useTmType from "../utils/useTmType";

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
  const [tmType, setTmType] = useTmType();
  let tm = (tmType === "neb_tm" ? calculateNebTm : calculateTm)(sequence, {
    monovalentCationConc,
    primerConc
  });
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
                { value: "default", label: "Default Tm (Breslauer)" },
                { value: "neb_tm", label: "NEB Tm (SantaLucia)" }
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

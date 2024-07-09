import React from "react";
import { isNumber, set } from "lodash-es";
import { Intent, Classes } from "@blueprintjs/core";
import InfoHelper from "../InfoHelper";
export const REQUIRED_ERROR = "This field is required.";

export const fieldRequired = value =>
  !value || (Array.isArray(value) && !value.length)
    ? REQUIRED_ERROR
    : undefined;

export const getOptions = options => {
  return (
    options &&
    options.map(function (opt) {
      if (typeof opt === "string") {
        return { label: opt, value: opt };
      } else if (isNumber(opt)) return { label: opt.toString(), value: opt };
      return opt;
    })
  );
};

export const fakeWait = () => {
  const fakeWaitNum = isNumber(window.Cypress.addFakeDefaultValueWait)
    ? window.Cypress.addFakeDefaultValueWait
    : 3000;

  return new Promise(resolve => {
    setTimeout(() => resolve(), fakeWaitNum);
  });
};

export const getCheckboxOrSwitchOnChange = ({
  beforeOnChange,
  input,
  onFieldSubmit
}) =>
  async function (e, val) {
    const v = e.target ? e.target.checked : val;
    if (beforeOnChange) {
      const { stopEarly } = (await beforeOnChange(v, e)) || {};
      if (stopEarly) return;
      set(e, "target.checked", v);
    }
    input.onChange(e, val);
    onFieldSubmit(v);
  };

export function getIntent({
  showErrorIfUntouched,
  meta: { touched, error, warning }
}) {
  const hasError = (touched || showErrorIfUntouched) && error;
  const hasWarning = (touched || showErrorIfUntouched) && warning;
  if (hasError) {
    return Intent.DANGER;
  } else if (hasWarning) {
    return Intent.WARNING;
  }
}

export function getIntentClass(...args) {
  const intent = getIntent(...args);
  if (intent === Intent.DANGER) {
    return Classes.INTENT_DANGER;
  } else if (intent === Intent.WARNING) {
    return Classes.INTENT_WARNING;
  } else {
    return "";
  }
}

export function removeUnwantedProps(props) {
  const cleanedProps = { ...props };
  delete cleanedProps.className;
  delete cleanedProps.units;
  delete cleanedProps.inlineLabel;
  delete cleanedProps.isLabelTooltip;
  delete cleanedProps.showErrorIfUntouched;
  delete cleanedProps.onChange;
  delete cleanedProps.containerStyle;
  delete cleanedProps.onFieldSubmit;
  delete cleanedProps.onBlur;
  delete cleanedProps.intent;
  delete cleanedProps.intentClass;
  delete cleanedProps.meta;
  delete cleanedProps.defaultValue;
  delete cleanedProps.enableReinitialize;
  delete cleanedProps.tabIndex;
  delete cleanedProps.secondaryLabel;
  delete cleanedProps.tooltipError;
  delete cleanedProps.tooltipInfo;
  delete cleanedProps.tooltipProps;
  // delete cleanedProps.asyncValidate;
  // delete cleanedProps.asyncValidating;
  // delete cleanedProps.validateOnChange;
  delete cleanedProps.hasCustomError;
  if (cleanedProps.inputClassName) {
    cleanedProps.className = cleanedProps.inputClassName;
    delete cleanedProps.inputClassName;
  }
  return cleanedProps;
}

export function LabelWithTooltipInfo({ label, tooltipInfo, labelStyle }) {
  return tooltipInfo ? (
    <div style={{ display: "flex", alignItems: "center", ...labelStyle }}>
      {label}{" "}
      <InfoHelper
        style={{ marginLeft: "5px", marginTop: "-6px" }}
        size={12}
        content={tooltipInfo}
      />
    </div>
  ) : (
    label || null
  );
}

export function getNewName(list, targetName) {
  const usedNumbers = [];

  for (let i = 0; i < list.length; i++) {
    const currentName = list[i].name;
    const baseName = currentName.replace(/\(\d+\)\.csv$/, ".csv");

    if (baseName === targetName) {
      const match = currentName.match(/\((\d+)\)\.csv$/);
      if (match) {
        usedNumbers[parseInt(match[1])] = true;
      } else {
        usedNumbers[0] = true;
      }
    }
  }

  let newName = targetName;
  for (let i = 0; i <= usedNumbers.length; i++) {
    if (!usedNumbers[i]) {
      if (i === 0) {
        newName = targetName;
      } else {
        newName = targetName.replace(".csv", `(${i}).csv`);
      }
      break;
    }
  }

  return newName;
}

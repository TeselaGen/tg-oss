import { isNumber } from "lodash";
import { getVals } from "./getVals";
import { isValueEmpty } from "./isValueEmpty";

export const defaultValidators = {
  dropdown: (newVal, field) => {
    const err = "Please choose one of the accepted values";
    if (!newVal) {
      if (field.isRequired) return err;
    } else if (!getVals(field.values).includes(newVal)) {
      return err;
    }
  },
  dropdownMulti: (newVal, field) => {
    const err = "Please choose one of the accepted values";
    if (!newVal) {
      if (field.isRequired) return err;
    } else {
      let err;
      newVal.split(",").some(v => {
        if (!getVals(field.values).includes(v)) {
          err = `${v} is not an accepted value`;
          return true;
        }
        return false;
      });
      return err;
    }
  },
  number: (newVal, field) => {
    if (isValueEmpty(newVal) && !field.isRequired) return;
    if (isNaN(newVal) || !isNumber(newVal)) {
      return "Must be a number";
    }
  },
  string: (newVal, field) => {
    if (!field.isRequired) return false;
    if (!newVal) return "Please enter a value here";
  }
};

import _, { isString, set, toNumber } from "lodash";
import { defaultValidators } from "./defaultValidators";
import { defaultFormatters } from "./defaultFormatters";
import { evaluate } from "mathjs";
import getIdOrCodeOrIndex from "./utils/getIdOrCodeOrIndex";

//(mutative) responsible for formatting and then validating the
// const depGraph = {
//   a1: ["a3"],
//   a2: ["a1"],
//   a3: [],
//   b1: ["a1", "a2"],
//   b2: ["a2"],
//   b3: ["a3"]
// };

export const editCellHelper = ({
  _cellAlphaNum,
  updateGroup,
  depGraph,
  entity,
  path,
  schema,
  columnSchema,
  newVal,
  entities,
  nestLevel = 0,
  depLevel = 0,
  allowFormulas
}) => {
  let nv = newVal;
  if (nv?.formula) {
    nv = nv.formula;
  }

  const colSchema =
    columnSchema || schema?.fields?.find(({ path: p }) => p === path) || {};
  path = path || colSchema.path;
  const cellAlphaNum =
    _cellAlphaNum ||
    getCellAlphaNum({
      entities,
      entity,
      colSchema,
      schema
    });
  if (
    updateGroup[cellAlphaNum] !== undefined &&
    updateGroup[cellAlphaNum] !== "__Currently&&Updating__"
  ) {
    // if the cell is already being updated, return the value
    return { value: updateGroup[cellAlphaNum], errors: {} };
  } else {
    updateGroup[cellAlphaNum] = "__Currently&&Updating__";
  }
  const cellId = `${getIdOrCodeOrIndex(entity)}:${colSchema.path}`;
  const oldVal = entity[path];
  const { format, validate, type } = colSchema;
  let errors = {
    __hasErrors: false
  };
  if (nv === undefined && colSchema.defaultValue !== undefined) {
    nv = colSchema.defaultValue;
  }

  let hasFormula = false;
  if (colSchema.allowFormulas && typeof nv === "string" && nv[0] === "=") {
    const ogFormula = nv;
    // if the nv is missing a closing paren, add it
    // count the number of open parens
    // count the number of close parens
    // if the number of open parens is greater than the number of close parens, add a close paren
    const openParens = (nv.match(/\(/g) || []).length;
    const closeParens = (nv.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      nv = nv + ")";
    }
    // if the nv is a valid formula, evaluate it and evaluate any nested formulas
    // if the nv is not a valid formula, return the error
    // fill in any variables with their values
    let error;
    // if nv contains : then it is a range
    // if (nv.includes(":")) {
    // replace the range with the the values of the range
    // get the start and end of the range
    const { rangeErr, replacedFormula } = replaceFormulaRanges({
      formula: nv,
      schema,
      entities
    });
    error = rangeErr;
    nv = replacedFormula;
    nv = nv.replace(/([A-Z]+[0-9]+)/gi, _match => {
      const match = _match.toUpperCase();
      if (updateGroup[match] === "__Currently&&Updating__") {
        error = `Circular Loop Detected between ${cellAlphaNum} and ${match}`;
        return "circular_loop_detected";
      }
      // match will equal E12 or B4 for example
      const [letter, rowIndex] = match.split(/(\d+)/);
      const entity = entities.find((e, i) => {
        return i === rowIndex - 1;
      });
      const columns = schema.fields;
      const letterIndex = lettersToNumber(letter);
      const col = columns[letterIndex];
      if (!col) {
        return match;
      }
      const { path } = col;
      if (!entity) return match;
      let val = entity[path];
      if (val === undefined || val === "") return 0;
      if (val?.formula) {
        val = val.formula;
      }
      if (isString(val) && val[0] === "=") {
        // if the value is a formula, evaluate it
        const { value, errors: _errors } = editCellHelper({
          _cellAlphaNum: match,
          updateGroup,
          depGraph,
          entity,
          path,
          schema,
          columnSchema: col,
          newVal: val,
          entities,
          nestLevel: nestLevel + 1
        });
        errors = mergeErrors(errors, _errors);
        val = value?.formula ? value.value : value;
      } else if (!isNaN(toNumber(val))) {
        return val;
      } else if (isString(val)) {
        return 0;
      }
      return val;
    });

    const toEval = nv.slice(1);
    try {
      if (!error) {
        nv = evaluate(toEval);
        nv = {
          formula: ogFormula,
          value: `${nv}`
        };
      } else {
        throw new Error(error);
      }
    } catch (e) {
      nv = {
        formula: ogFormula,
        value: `#ERROR`,
        error: e.message
      };
      errors[cellId] = e.message;
      errors.__hasErrors = true;
    }
    hasFormula = nv;
    nv = nv.value;
  }

  if (format) {
    nv = format(nv, colSchema);
  }
  if (defaultFormatters[type]) {
    nv = defaultFormatters[type](nv, colSchema);
  }
  if (validate && !hasErrors(errors)) {
    const error = validate(nv, colSchema, entity);
    if (error) {
      errors.__hasErrors = true;
    }
    errors[cellId] = error;
  }
  if (!hasErrors(errors)) {
    const validator =
      defaultValidators[type] ||
      type === "string" ||
      (type === undefined && defaultValidators.string);
    if (validator) {
      const error = validator(nv, colSchema);
      if (error) {
        errors.__hasErrors = true;
      }
      errors[cellId] = error;
    }
  }
  const value = hasFormula || nv;
  if (
    // if the formula and its value is the same as it was, don't set it again otherwise it will be added to the undo/redo stack
    !(
      hasFormula &&
      value.value === oldVal?.value &&
      value.formula === oldVal?.formula
    )
  ) {
    set(entity, path, value);
  }
  updateGroup[cellAlphaNum] = value;
  if (allowFormulas && entities && entities.length) {
    // go through the depGraph and update any cells that depend on this cell
    const cellDepGraph = depGraph[cellAlphaNum];
    if (cellDepGraph && cellDepGraph.length) {
      cellDepGraph.forEach(depCellAlphaNum => {
        if (depCellAlphaNum === cellAlphaNum) return;
        if (updateGroup[depCellAlphaNum] === "__Currently&&Updating__") {
          // if the cell is already being updated, return the value
          return updateGroup[depCellAlphaNum];
        }
        const [depColLetter, depRowIndex] = depCellAlphaNum.split(/(\d+)/);
        const depEntity = entities[depRowIndex - 1];
        // if (!depEntity) debugger
        // if (!depEntity) return
        const depColIndex = depColLetter.charCodeAt(0) - 65;
        const depColSchema = schema.fields[depColIndex];
        const depPath = depColSchema.path;
        const depNewVal = depEntity[depPath];

        const { errors: _errors } = editCellHelper({
          _cellAlphaNum: depCellAlphaNum,
          allowFormulas,
          updateGroup,
          depGraph,
          entity: depEntity,
          path: depPath,
          schema,
          columnSchema: depColSchema,
          newVal: depNewVal,
          entities,
          depLevel: depLevel + 1,
          nestLevel: nestLevel
        });
        errors = mergeErrors(errors, _errors);
      });
    }
  }
  updateGroup[cellAlphaNum] = value?.formula ? value.value : value;
  if (!hasErrors(errors)) {
    errors[cellId] = undefined;
  }
  return { entity, errors, value };
};

function getCellAlphaNum({ entities, entity, colSchema, schema }) {
  const rowIndex = entities.indexOf(entity);
  const colIndex = schema.fields.indexOf(colSchema);
  return getCellAlphaNumHelper(colIndex, rowIndex);
}
export function getCellAlphaNumHelper(colIndex, rowIndex) {
  const colLetter = getColLetFromIndex(colIndex);
  const cellAlphaNum = `${colLetter}${rowIndex + 1}`;
  return cellAlphaNum;
}

const hasErrors = errors => {
  return errors.__hasErrors;
};

export const getColLetFromIndex = index => {
  if (index > 25)
    return (
      getColLetFromIndexHelper(index / 26 - 1) +
      getColLetFromIndexHelper(index % 26)
    );
  return getColLetFromIndexHelper(index);
};
const getColLetFromIndexHelper = index => {
  return String.fromCharCode(65 + index);
};

const lettersToNumber = letters => {
  let n = 0;
  for (let p = 0; p < letters.length; p++) {
    n = letters[p].charCodeAt() - 64 + n * 26;
  }
  return n - 1;
};

export const replaceFormulaRanges = ({ formula, schema, entities }) => {
  let error;
  const replaced = formula
    .toLowerCase()
    .replace(/([A-Z]*[0-9]*:[A-Z]*[0-9]*)/gi, _match => {
      // if (_match.includes(":")) {
      // }
      const match = _match.toUpperCase();
      const [start, end] = match.split(":");
      const [startLetter, _startRowIndex] = start.split(/(\d+)/);
      const [endLetter, _endRowIndex] = end.split(/(\d+)/);
      let startRowIndex = parseInt(_startRowIndex);
      let endRowIndex = parseInt(_endRowIndex);
      let toRet = "";

      if (startLetter !== endLetter) {
        error = `Ranges must be in the same column`;
        return "range_in_different_columns";
      }
      if (!startLetter && !endLetter && _startRowIndex === _endRowIndex) {
        // we have a range like 1:1
        const rowIndex = startRowIndex;
        const startColIndex = 1;
        const endColIndex = schema.fields.length;
        for (let i = startColIndex; i <= endColIndex; i++) {
          const colLet = getColLetFromIndex(i - 1);
          toRet += `${colLet}${rowIndex}${i === endColIndex ? "" : ","}`;
        }
        return toRet;
      }
      if (_startRowIndex === undefined && _endRowIndex === undefined) {
        // we have a range like A:A
        startRowIndex = 1;
        endRowIndex = entities.length;
      }
      for (let j = startRowIndex; j <= endRowIndex; j++) {
        toRet += `${startLetter}${j}${j === endRowIndex ? "" : ","}`;
      }
      return toRet;
    });
  return {
    replacedFormula: replaced,
    error
  };
};

function mergeErrors(errors, _errors) {
  let hasErrors = false;
  if (_errors.__hasErrors || errors.__hasErrors) {
    hasErrors = true;
  }
  errors = {
    ...errors,
    ..._errors,
    __hasErrors: hasErrors
  };
  return errors;
}

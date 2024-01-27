import { isString, set } from "lodash";
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
  updateGroup,
  depGraph,
  entity,
  path,
  schema,
  columnSchema,
  newVal,
  entities,
  nestLevel = 0,
  depLevel = 0
}) => {
  // nestLevel === 0 && console.log(`depGraph:`, depGraph);
  // console.log(`nestLevel:`, nestLevel);
  // console.log(`depLevel:`, depLevel);
  // console.log(`updateGroup:`, updateGroup);
  // // if (nestLevel === 2) return
  let nv = newVal;
  if (nv?.formula) {
    nv = nv.formula;
  }

  const colSchema =
    columnSchema || schema?.fields?.find(({ path: p }) => p === path) || {};
  path = path || colSchema.path;
  const cellAlphaNum = getCellAlphaNum({
    entities,
    entity,
    colSchema,
    schema
  });
  // console.log(`evaluating cellAlphaNum:`, cellAlphaNum);
  if (
    updateGroup[cellAlphaNum] !== undefined &&
    updateGroup[cellAlphaNum] !== "__Currently&&Updating__"
  ) {
    // if the cell is already being updated, return the value
    return { value: updateGroup[cellAlphaNum] };
  } else {
    updateGroup[cellAlphaNum] = "__Currently&&Updating__";
  }
  const cellId = `${getIdOrCodeOrIndex(entity)}:${colSchema.path}`;

  const { format, validate, type } = colSchema;
  let errors = {};
  if (nv === undefined && colSchema.defaultValue !== undefined) {
    nv = colSchema.defaultValue;
  }
  // console.log(`nv:`, nv);

  let hasFormula = false;
  if (colSchema.allowFormulas && typeof nv === "string" && nv[0] === "=") {
    const ogFormula = nv;
    // console.log(`ogFormula:`, ogFormula);
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
    nv = nv.toLowerCase().replace(/([A-Z]+[0-9]+)/gi, _match => {
      const match = _match.toUpperCase();
      if (updateGroup[match] === "__Currently&&Updating__") {
        error = `Circular Loop Detected between ${cellAlphaNum} and ${match}`;
        return "circular_loop_detected";
      }

      // match = E12 or B4
      const [letter, rowIndex] = match.split(/(\d+)/);
      const entity = entities.find((e, i) => {
        return i === rowIndex - 1;
      });
      const columns = schema.fields;
      const letterIndex = letter.toUpperCase().charCodeAt(0) - 65;
      const col = columns[letterIndex];
      if (!col) {
        return match;
      }
      const { path } = col;
      if (!entity) return match;
      let val = entity[path];

      if (val === undefined) return match;
      if (val?.formula) {
        val = val.formula;
      }
      if (isString(val) && val[0] === "=") {
        // if the value is a formula, evaluate it
        const { value, errors: _errors } = editCellHelper({
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
        errors = {
          ...errors,
          ..._errors
        };
        val = value?.formula ? value.value : value;
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
      errors = {
        ...errors,
        [cellId]: e.message
      };
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
    errors = {
      ...errors,
      [cellId]: error
    };
  }
  if (!hasErrors(errors)) {
    const validator =
      defaultValidators[type] ||
      type === "string" ||
      (type === undefined && defaultValidators.string);
    if (validator) {
      const error = validator(nv, colSchema);
      errors = {
        ...errors,
        [cellId]: error
      };
    }
  }
  const value = hasFormula || nv;
  set(entity, path, value);
  updateGroup[cellAlphaNum] = value;
  if (entities && entities.length) {
    // go through the depGraph and update any cells that depend on this cell
    const cellDepGraph = depGraph[cellAlphaNum];
    if (cellDepGraph && cellDepGraph.length) {
      cellDepGraph.forEach(depCellAlphaNum => {
        if (depCellAlphaNum === cellAlphaNum) return;
        if (updateGroup[depCellAlphaNum] === "__Currently&&Updating__") {
          // if the cell is already being updated, return the value
          return updateGroup[depCellAlphaNum];
        }
        // console.log(`evaluate deps`, cellDepGraph, `for cell`, cellAlphaNum);
        const [depColLetter, depRowIndex] = depCellAlphaNum.split(/(\d+)/);

        const depEntity = entities[depRowIndex - 1];
        const depColIndex = depColLetter.charCodeAt(0) - 65;
        const depColSchema = schema.fields[depColIndex];
        const depPath = depColSchema.path;
        const depNewVal = depEntity[depPath];

        const { errors: _errors } = editCellHelper({
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
        errors = {
          ...errors,
          ..._errors
        };
      });
    }
  }
  updateGroup[cellAlphaNum] = value?.formula ? value.value : value;
  if (!hasErrors(errors)) {
    errors[cellId] = undefined;
  }
  return { entity, errors: errors, value };
};

function getCellAlphaNum({ entities, entity, colSchema, schema }) {
  const rowIndex = entities.indexOf(entity) + 1;
  const colIndex = schema.fields.indexOf(colSchema);
  const colLetter = String.fromCharCode(65 + colIndex);
  const cellAlphaNum = `${colLetter}${rowIndex}`;
  return cellAlphaNum;
}

const hasErrors = errors => {
  return Object.values(errors).some(e => e);
};

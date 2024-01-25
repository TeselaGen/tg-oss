import { isPlainObject, set } from "lodash";
import { defaultValidators } from "./defaultValidators";
import { defaultFormatters } from "./defaultFormatters";
import { evaluate } from "mathjs";

//(mutative) responsible for formatting and then validating the

export const editCellHelper = ({
  entity,
  path,
  schema,
  columnSchema,
  newVal,
  entities
}) => {
  let nv = newVal;

  const colSchema =
    columnSchema || schema?.fields?.find(({ path: p }) => p === path) || {};
  path = path || colSchema.path;
  const { format, validate, type } = colSchema;
  let error;
  if (nv === undefined && colSchema.defaultValue !== undefined)
    nv = colSchema.defaultValue;
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
    // if the nv is a valid formula, evaluate it
    // if the nv is not a valid formula, return the error
    // fill in any variables with their values
    nv = nv.toLowerCase().replace(/([A-Z]+[0-9]+)/gi, match => {
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
      const val = entity[path];
      if (val === undefined) return match;
      if (isPlainObject(val)) {
        if (val.formula) {
          const {value} = editCellHelper({})
        }
      }
      return val;
    });
    const toEval = nv.slice(1);
    try {
      nv = evaluate(toEval);

      nv = {
        formula: ogFormula,
        value: `${nv}`
      };
    } catch (e) {
      nv = {
        formula: ogFormula,
        value: `#ERROR`
      };
      error = e.message;
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
  if (validate && !error) {
    error = validate(nv, colSchema, entity);
  }
  if (!error) {
    const validator =
      defaultValidators[type] ||
      type === "string" ||
      (type === undefined && defaultValidators.string);
    if (validator) {
      error = validator(nv, colSchema);
    }
  }
  const value = hasFormula || nv;
  set(entity, path, value);
  return { entity, error, value };
};

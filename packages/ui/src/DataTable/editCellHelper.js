import { set } from "lodash";
import { defaultValidators } from "./defaultValidators";
import { defaultFormatters } from "./defaultFormatters";

//(mutative) responsible for formatting and then validating the

export const editCellHelper = ({
  entity,
  path,
  schema,
  columnSchema,
  newVal
}) => {
  let nv = newVal;

  const colSchema =
    columnSchema || schema?.fields?.find(({ path: p }) => p === path) || {};
  path = path || colSchema.path;
  const { format, validate, type } = colSchema;
  let error;
  if (nv === undefined && colSchema.defaultValue !== undefined)
    nv = colSchema.defaultValue;
  if (colSchema.allowFormulas && typeof nv === "string" && nv[0] === "=") {
    // if the nv is missing a closing paren, add it
    // count the number of open parens
    // count the number of close parens
    // if the number of open parens is greater than the number of close parens, add a close paren
    const openParens = (nv.match(/\(/g) || []).length;
    const closeParens = (nv.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      nv = nv + ")";
    }
    console.log(`nv:`,nv)
    // if the nv is a valid formula, evaluate it
    // if the nv is not a valid formula, return the error

    
  }
  if (format) {
    nv = format(nv, colSchema);
  }
  if (defaultFormatters[type]) {
    nv = defaultFormatters[type](nv, colSchema);
  }
  if (validate) {
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
  set(entity, path, nv);
  return { entity, error };
};

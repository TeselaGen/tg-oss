import { set } from "lodash-es";
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

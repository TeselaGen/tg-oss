import { Field } from "./types/Field";
import { Schema } from "./types/Schema";

export const getFieldPathToField = (schema: Schema) => {
  const fieldPathToField: { [path: string]: Field } = {};
  schema.fields.forEach(f => {
    fieldPathToField[f.path] = f;
  });
  return fieldPathToField;
};

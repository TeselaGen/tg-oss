import { camelCase } from "lodash-es";
import { startCase, keyBy, map } from "lodash-es";

type Field = {
  type?: string;
  displayName?: string;
  path?: string;
  filterDisabled?: boolean;
  sortDisabled?: boolean;
};

type Schema = { fields: (Field | string)[] };

type CompleteField = Field & {
  type: string;
  displayName: string;
  path: string;
};

type CompleteSchema = {
  fields: CompleteField[];
};

const convertSchema = (schema: Schema): CompleteSchema => {
  let schemaToUse = schema;
  if (!schemaToUse.fields && Array.isArray(schema)) {
    schemaToUse = {
      fields: schema
    };
  }
  schemaToUse = {
    ...schemaToUse
  };
  schemaToUse.fields = schemaToUse.fields.map((field, i) => {
    if (typeof field === "string") {
      return {
        displayName: startCase(camelCase(field)),
        path: field,
        type: "string"
      };
    } else {
      const fieldToUse = { ...(field as Field) };
      fieldToUse.type = fieldToUse.type || "string";
      fieldToUse.displayName =
        fieldToUse.displayName || startCase(camelCase(fieldToUse.path || ""));
      // paths are needed for column resizing
      if (!fieldToUse.path) {
        fieldToUse.filterDisabled = true;
        fieldToUse.sortDisabled = true;
        fieldToUse.path = "fake-path" + i;
      }
      return fieldToUse as CompleteField;
    }
  });
  return schemaToUse as CompleteSchema;
};

export function mergeSchemas(_originalSchema: Schema, _overrideSchema: Schema) {
  const originalSchema = convertSchema(_originalSchema);
  const overrideSchema = convertSchema(_overrideSchema);

  const overridesByKey = keyBy(overrideSchema.fields, "path");
  return {
    ...originalSchema,
    ...overrideSchema,
    fields: originalSchema.fields
      .map(f => {
        const override = overridesByKey[f.path];
        if (override) {
          delete overridesByKey[f.path];
          return override;
        }
        return f;
      })
      .concat(map(overridesByKey))
  };
}

export default convertSchema;
